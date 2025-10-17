# TODO App AWS Architecture Documentation

## Architecture Overview

The TODO application follows a serverless three-tier architecture pattern using AWS managed services for optimal scalability, reliability, and cost-effectiveness.

## Architecture Components

### Frontend Layer
- **Amazon S3**: Hosts the React.js static website
- **Amazon CloudFront**: Global CDN for content delivery and caching
- **AWS Certificate Manager (ACM)**: Provides SSL/TLS certificates for HTTPS

### API Layer
- **Amazon Cognito**: Handles user authentication and authorization
- **Amazon API Gateway**: RESTful API management and routing
- **AWS Lambda**: Serverless compute functions (Node.js runtime) for business logic

### Database Layer
- **Amazon RDS MySQL**: Primary database for storing TODO items
- **AWS Secrets Manager**: Securely manages database credentials

### Monitoring & Infrastructure
- **Amazon CloudWatch**: Centralized logging and monitoring
- **AWS CDK**: Infrastructure as Code for deployment automation

## Data Flow

1. **User Authentication**: Users authenticate through Amazon Cognito
2. **Frontend Access**: Users access the React app via CloudFront CDN from S3
3. **API Requests**: Frontend makes authenticated API calls to API Gateway
4. **Business Logic**: API Gateway triggers Lambda functions for processing
5. **Data Storage**: Lambda functions interact with RDS MySQL for data persistence
6. **Security**: Database credentials are securely retrieved from Secrets Manager

## API Endpoints

- `GET /api/todos` - Retrieve user's TODO items
- `POST /api/todos` - Create new TODO item
- `PUT /api/todos/{id}` - Update existing TODO item
- `DELETE /api/todos/{id}` - Delete TODO item
- `PATCH /api/todos/{id}` - Toggle TODO completion status

## Security Features

- HTTPS encryption for all communications
- JWT-based authentication via Cognito
- User data isolation by user_id
- Secure credential management with Secrets Manager
- Input validation and sanitization in Lambda functions

## Scalability & Performance

- Auto-scaling Lambda functions based on demand
- CloudFront global edge locations for low latency
- API Gateway caching for improved response times
- RDS MySQL with appropriate instance sizing

Generated on: October 17, 2025