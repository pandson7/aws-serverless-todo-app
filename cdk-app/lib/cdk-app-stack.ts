import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class TodoAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const suffix = '101620251947';

    // VPC for RDS
    const vpc = new ec2.Vpc(this, `TodoVpc-${suffix}`, {
      maxAzs: 2,
      natGateways: 1
    });

    // Database credentials
    const dbCredentials = new secretsmanager.Secret(this, `TodoDbSecret-${suffix}`, {
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: 'admin' }),
        generateStringKey: 'password',
        excludeCharacters: '"@/\\'
      }
    });

    // RDS MySQL Database
    const database = new rds.DatabaseInstance(this, `TodoDatabase-${suffix}`, {
      engine: rds.DatabaseInstanceEngine.mysql({
        version: rds.MysqlEngineVersion.VER_8_0
      }),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
      vpc,
      credentials: rds.Credentials.fromSecret(dbCredentials),
      databaseName: 'todoapp',
      deletionProtection: false,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    // Cognito User Pool
    const userPool = new cognito.UserPool(this, `TodoUserPool-${suffix}`, {
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      autoVerify: { email: true },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: false
      }
    });

    const userPoolClient = new cognito.UserPoolClient(this, `TodoUserPoolClient-${suffix}`, {
      userPool,
      generateSecret: false,
      authFlows: {
        userPassword: true,
        userSrp: true
      }
    });

    // Lambda Layer for database utilities
    const dbLayer = new lambda.LayerVersion(this, `TodoDbLayer-${suffix}`, {
      code: lambda.Code.fromAsset('lambda-layers/db-layer'),
      compatibleRuntimes: [lambda.Runtime.NODEJS_18_X],
      description: 'Database utilities layer'
    });

    // Lambda function environment variables
    const lambdaEnvironment = {
      DB_HOST: database.instanceEndpoint.hostname,
      DB_NAME: 'todoapp',
      DB_SECRET_ARN: dbCredentials.secretArn,
      USER_POOL_ID: userPool.userPoolId
    };

    // Lambda functions
    const getTodosFunction = new lambda.Function(this, `GetTodos-${suffix}`, {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda/get-todos'),
      environment: lambdaEnvironment,
      layers: [dbLayer],
      vpc,
      timeout: cdk.Duration.seconds(30)
    });

    const createTodoFunction = new lambda.Function(this, `CreateTodo-${suffix}`, {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda/create-todo'),
      environment: lambdaEnvironment,
      layers: [dbLayer],
      vpc,
      timeout: cdk.Duration.seconds(30)
    });

    const updateTodoFunction = new lambda.Function(this, `UpdateTodo-${suffix}`, {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda/update-todo'),
      environment: lambdaEnvironment,
      layers: [dbLayer],
      vpc,
      timeout: cdk.Duration.seconds(30)
    });

    const deleteTodoFunction = new lambda.Function(this, `DeleteTodo-${suffix}`, {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda/delete-todo'),
      environment: lambdaEnvironment,
      layers: [dbLayer],
      vpc,
      timeout: cdk.Duration.seconds(30)
    });

    const initDbFunction = new lambda.Function(this, `InitDb-${suffix}`, {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda/init-db'),
      environment: lambdaEnvironment,
      layers: [dbLayer],
      vpc,
      timeout: cdk.Duration.seconds(60)
    });

    // Grant permissions
    const lambdaFunctions = [getTodosFunction, createTodoFunction, updateTodoFunction, deleteTodoFunction, initDbFunction];
    
    lambdaFunctions.forEach(fn => {
      database.connections.allowDefaultPortFrom(fn);
      dbCredentials.grantRead(fn);
    });

    // API Gateway
    const api = new apigateway.RestApi(this, `TodoApi-${suffix}`, {
      restApiName: `Todo Service ${suffix}`,
      description: 'This service serves todos.',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key', 'X-Amz-Security-Token']
      }
    });

    // Cognito Authorizer
    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, `TodoAuthorizer-${suffix}`, {
      cognitoUserPools: [userPool]
    });

    // API Resources
    const todos = api.root.addResource('todos');
    const todoItem = todos.addResource('{id}');

    // API Methods
    todos.addMethod('GET', new apigateway.LambdaIntegration(getTodosFunction), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO
    });

    todos.addMethod('POST', new apigateway.LambdaIntegration(createTodoFunction), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO
    });

    todoItem.addMethod('PUT', new apigateway.LambdaIntegration(updateTodoFunction), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO
    });

    todoItem.addMethod('DELETE', new apigateway.LambdaIntegration(deleteTodoFunction), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO
    });

    // S3 bucket for frontend
    const websiteBucket = new s3.Bucket(this, `TodoWebsite-${suffix}`, {
      bucketName: `todo-website-${suffix}`,
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'error.html',
      publicReadAccess: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true
    });

    // CloudFront distribution
    const distribution = new cloudfront.Distribution(this, `TodoDistribution-${suffix}`, {
      defaultBehavior: {
        origin: new origins.S3Origin(websiteBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS
      },
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html'
        }
      ]
    });

    // Outputs
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'API Gateway URL'
    });

    new cdk.CfnOutput(this, 'UserPoolId', {
      value: userPool.userPoolId,
      description: 'Cognito User Pool ID'
    });

    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: userPoolClient.userPoolClientId,
      description: 'Cognito User Pool Client ID'
    });

    new cdk.CfnOutput(this, 'WebsiteUrl', {
      value: distribution.distributionDomainName,
      description: 'CloudFront Distribution URL'
    });

    new cdk.CfnOutput(this, 'BucketName', {
      value: websiteBucket.bucketName,
      description: 'S3 Bucket Name'
    });
  }
}