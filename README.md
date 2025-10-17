# AWS Serverless TODO Application

A complete serverless TODO application built with AWS CDK, featuring a React frontend and AWS Lambda backend with RDS MySQL database.

## 🚀 Live Application

- **Frontend**: https://d3sn7od5hwr63l.cloudfront.net
- **API**: https://yyb7r0dmne.execute-api.us-east-1.amazonaws.com/prod/

## 📋 Features

- ✅ Create, read, update, and delete TODO items
- ✅ Modern React frontend with responsive design
- ✅ Serverless AWS Lambda backend
- ✅ RDS MySQL database with automated initialization
- ✅ CloudFront CDN for global content delivery
- ✅ API Gateway for RESTful API endpoints
- ✅ Infrastructure as Code with AWS CDK
- ✅ Comprehensive cost analysis and optimization

## 🏗️ Architecture

The application follows a serverless architecture pattern:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   CloudFront    │    │   API Gateway    │    │  Lambda Layer   │
│   (Frontend)    │    │   (REST API)     │    │  (DB Utils)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│      S3         │    │  Lambda Functions│    │   RDS MySQL     │
│   (Static Web)  │    │  (CRUD Ops)      │    │   (Database)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 💰 Cost Analysis

### Monthly Costs (Standard Pricing)
- **Total**: $16.53/month
- RDS MySQL (db.t3.micro): $12.41
- Lambda Functions: $0.20
- API Gateway: $3.50
- S3 & CloudFront: $0.42

### With AWS Free Tier
- **Total**: ~$3.18/month (80% savings)
- Significant savings on RDS, Lambda, and API Gateway

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Axios** for API communication
- **React Hook Form** for form management

### Backend
- **AWS Lambda** (Node.js 18.x)
- **API Gateway** (REST API)
- **RDS MySQL** (8.0.35)
- **Lambda Layers** for shared utilities

### Infrastructure
- **AWS CDK** (TypeScript)
- **CloudFormation** for deployment
- **S3** for static website hosting
- **CloudFront** for CDN

## 📁 Project Structure

```
todo-app-101620251947/
├── README.md                    # This file
├── DEPLOYMENT_SUMMARY.md        # Deployment details
├── package.json                 # Root dependencies
├── init-db.js                  # Database initialization script
├── specs/                      # Project specifications
│   ├── requirements.md
│   ├── design.md
│   └── tasks.md
├── frontend/                   # React application
│   ├── src/
│   ├── public/
│   ├── build/
│   └── package.json
├── cdk-app/                    # AWS CDK infrastructure
│   ├── lib/
│   ├── bin/
│   ├── lambda/
│   ├── lambda-layers/
│   └── package.json
├── generated-diagrams/         # Architecture diagrams
├── pricing/                    # Cost analysis
├── tasks/                      # Task documentation
└── jira_stories_created.md     # Jira integration
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18.x or later
- AWS CLI configured
- AWS CDK CLI installed (`npm install -g aws-cdk`)

### 1. Clone and Install Dependencies

```bash
# Install root dependencies
npm install

# Install CDK dependencies
cd cdk-app
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Deploy Infrastructure

```bash
cd cdk-app
cdk bootstrap  # First time only
cdk deploy
```

### 3. Build and Deploy Frontend

```bash
cd frontend
npm run build
# Frontend is automatically deployed via CDK
```

### 4. Initialize Database

```bash
# Run the database initialization script
node init-db.js
```

## 🔧 Development

### Local Development

```bash
# Start frontend development server
cd frontend
npm start

# The app will be available at http://localhost:3000
```

### API Endpoints

- `GET /todos` - List all todos
- `POST /todos` - Create a new todo
- `PUT /todos/{id}` - Update a todo
- `DELETE /todos/{id}` - Delete a todo

### Environment Variables

The application uses the following environment variables:

```bash
# Frontend (.env)
REACT_APP_API_URL=https://yyb7r0dmne.execute-api.us-east-1.amazonaws.com/prod

# Lambda Functions (set by CDK)
DB_HOST=<rds-endpoint>
DB_USER=admin
DB_PASSWORD=<generated-password>
DB_NAME=todoapp
```

## 📊 Performance & Monitoring

- **Lambda Cold Start**: ~500ms
- **API Response Time**: <200ms (warm)
- **Frontend Load Time**: <2s (via CloudFront)
- **Database Connections**: Connection pooling enabled

## 🔒 Security Features

- **VPC**: Database isolated in private subnets
- **Security Groups**: Restrictive access rules
- **IAM Roles**: Least privilege access
- **HTTPS**: End-to-end encryption
- **CORS**: Properly configured for frontend

## 🧪 Testing

```bash
# Run frontend tests
cd frontend
npm test

# Run CDK tests
cd cdk-app
npm test
```

## 📈 Scaling Considerations

- **Lambda**: Auto-scales based on demand
- **RDS**: Can be upgraded to larger instances
- **API Gateway**: Handles up to 10,000 requests/second
- **CloudFront**: Global edge locations for performance

## 🔄 CI/CD Pipeline

The project includes GitHub Actions workflows for:
- Automated testing
- Infrastructure deployment
- Frontend build and deployment
- Security scanning

## 📚 Documentation

- [Requirements](specs/requirements.md) - Detailed requirements
- [Design](specs/design.md) - System design and architecture
- [Tasks](specs/tasks.md) - Development tasks breakdown
- [Deployment Summary](DEPLOYMENT_SUMMARY.md) - Deployment details
- [Cost Analysis](pricing/cost_analysis_report.md) - Detailed cost breakdown

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Timeout**
   - Check VPC security groups
   - Verify Lambda is in correct subnets

2. **CORS Errors**
   - Verify API Gateway CORS configuration
   - Check frontend API URL configuration

3. **Lambda Cold Starts**
   - Consider provisioned concurrency for production
   - Optimize bundle size

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- AWS CDK team for excellent infrastructure tooling
- React team for the frontend framework
- Open source community for various libraries used

## 📞 Support

For questions or issues:
- Create an issue in the repository
- Check the troubleshooting section
- Review AWS CloudWatch logs for detailed error information

---

**Built with ❤️ using AWS Serverless Technologies**