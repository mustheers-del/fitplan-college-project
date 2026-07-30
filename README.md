# FitPlan - Serverless Gym & Meal Plan Generator

## Project Overview
FitPlan is a serverless application that generates personalized weekly gym and meal plans using AWS Lambda, DynamoDB, and Claude AI via Bedrock.

## Technology Stack

### Backend
- **Runtime**: Python 3.12
- **Serverless**: AWS Lambda
- **Database**: Amazon DynamoDB
- **LLM**: Amazon Bedrock (Claude Haiku)
- **Auth**: Amazon Cognito
- **API**: AWS API Gateway
- **IaC**: AWS SAM (Serverless Application Model)

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State**: Zustand
- **HTTP Client**: Axios

## Project Structure

fitplan-project/ ├── backend/ │ ├── functions/ # Lambda function handlers │ │ ├── onboard/ │ │ ├── get_plan/ │ │ ├── log_daily/ │ │ ├── get_logs/ │ │ └── weekly_plan_gen/ │ ├── common/ # Shared business logic │ ├── mcp_server/ # MCP layer (optional) │ ├── requirements.txt # Python dependencies │ ├── template.yaml # SAM infrastructure │ └── .gitignore │ ├── frontend/ │ ├── src/ │ │ ├── pages/ # React pages │ │ ├── components/ # React components │ │ ├── api/ # API client │ │ ├── store/ # Zustand store │ │ ├── types/ # TypeScript types │ │ └── App.tsx │ ├── public/ │ ├── package.json │ ├── tsconfig.json │ ├── vite.config.ts │ ├── .env.example │ └── .gitignore │ ├── docs/ # Documentation ├── README.md └── .gitignore


## Getting Started

### Prerequisites
- Node.js v18+
- Python 3.12
- AWS Account
- AWS CLI v2
- AWS SAM CLI

### Setup

1. **Clone the repository**
```bash
git clone <repo-url>
cd fitplan-project
```

2. **Setup Backend**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. **Setup Frontend**
```bash
cd ../frontend
npm install
```

4. **Configure Environment**
Copy `.env.example` to `.env.local` and fill in your AWS details (after deployment)

5. **Deploy**
```bash
cd backend
sam build
sam deploy --guided
```

## Development Workflow

### Backend Development
```bash
cd backend
source venv/bin/activate
# Edit files, then run:
sam build
sam deploy
```

### Frontend Development
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

### Build for Production
```bash
cd frontend
npm run build
```

## Features

- ✅ User authentication with Cognito
- ✅ Personalized weekly gym plans
- ✅ AI-powered meal plans
- ✅ Daily workout/meal logging
- ✅ Progress tracking
- ✅ Responsive React frontend
- ✅ Serverless backend (AWS Lambda)

## Cost Estimate
- **Lambda**: Free tier covers 1M requests/month
- **DynamoDB**: Free tier covers 25GB storage
- **Cognito**: Free for up to 50k MAUs
- **Bedrock**: ~$0.10-0.30 per week (plan generation)

**Total monthly cost**: ~$5-15 (well within free tier for MVP)

## Timeline

- **Week 1**: Backend infrastructure & models
- **Week 2**: Frontend auth & setup
- **Week 3**: Plan generation & display
- **Week 4**: Daily logging & deployment

## Contributing

Each team member works on their assigned component:
1. Create feature branch
2. Implement feature
3. Push to branch
4. Create Pull Request
5. Code review & merge

## Deployment

Currently deployed on AWS:
- Backend: Lambda @ `https://xxxxx.execute-api.us-east-1.amazonaws.com/dev`
- Frontend: S3 + CloudFront @ `https://fitplan.example.com`

## Support

For issues or questions, create a GitHub issue or contact the team.

---

**Built with ❤️ by the FitPlan Team**