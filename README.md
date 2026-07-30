# 🏋️ FitPlan – AI Gym & Meal Plan Generator

FitPlan is an AI-powered serverless web application that generates personalized weekly workout and meal plans based on a user's fitness profile, goals, and daily activity logs.

The application uses Amazon Bedrock (Claude Haiku) to generate intelligent plans and AWS serverless services for scalability and cost efficiency.

---

# 🚀 Technology Stack

## Frontend (`app/`)

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Zustand
- Axios

## Backend (`backend/`)

- Python 3.12
- AWS Lambda
- Amazon API Gateway
- Amazon DynamoDB
- Amazon Cognito
- Amazon Bedrock (Claude Haiku)
- AWS SAM (Serverless Application Model)

---

# 📁 Project Structure

```
gym-plan-v2/

│
├── app/                        # React + TypeScript frontend
│   ├── public/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── api/
│   │   ├── store/
│   │   ├── types/
│   │   ├── hooks/
│   │   ├── assets/
│   │   ├── App.tsx
│   │   └── main.tsx
│   │
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── .env.example
│   └── .gitignore
│
├── backend/                    # Python AWS Lambda backend
│   ├── functions/
│   │   ├── onboard/
│   │   ├── get_plan/
│   │   ├── log_daily/
│   │   ├── get_logs/
│   │   └── weekly_plan_gen/
│   │
│   ├── common/
│   │
│   ├── mcp_server/
│   │
│   ├── requirements.txt
│   ├── template.yaml
│   └── .gitignore
│
├── docs/
│
├── README.md
│
└── .gitignore
```

---

# 📌 Project Architecture

```
User

        │

        ▼

React Web Application (app)

        │

Amazon API Gateway

        │

AWS Lambda Functions

        │

Amazon DynamoDB

        │

Amazon Bedrock (Claude Haiku)

        │

Workout + Meal Plan

        │

Response back to User
```

---

# ✨ Features

- User Authentication (Amazon Cognito)
- Personalized Gym Plans
- Personalized Meal Plans
- AI-powered Weekly Plan Generation
- Daily Workout Logging
- Daily Meal Logging
- Weekly Progress Tracking
- Responsive React Interface
- Serverless AWS Backend

---

# 🛠 Prerequisites

Before starting, install:

- Git
- Node.js (v18 or later)
- Python 3.12
- AWS CLI v2
- AWS SAM CLI
- Visual Studio Code
- AWS Account

---

# ⚙️ Backend Setup

```bash
cd backend

python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

---

# ⚙️ Frontend Setup

```bash
cd app

npm install
```

Run the frontend:

```bash
npm run dev
```

---

# 🌍 Environment Variables

Copy

```
.env.example
```

to

```
.env.local
```

and configure your AWS credentials after deployment.

---

# 🚀 Deploy Backend

```bash
cd backend

sam build

sam deploy --guided
```

---

# 💻 Development Workflow

## Backend

```bash
cd backend

# Activate virtual environment

sam build

sam deploy
```

## Frontend

```bash
cd app

npm run dev
```

The application will run on:

```
http://localhost:5173
```

---

# 🌿 Git Workflow

Every team member should follow this workflow.

### 1. Pull latest changes

```bash
git pull origin main
```

### 2. Create a feature branch

```bash
git checkout -b feature/your-feature-name
```

Example:

```bash
git checkout -b feature/login-page
```

### 3. Develop your feature

### 4. Commit changes

```bash
git add .

git commit -m "Add login page"
```

### 5. Push branch

```bash
git push origin feature/login-page
```

### 6. Create Pull Request

Request a code review before merging.

---

# 📅 Project Timeline

## Week 1

- Repository setup
- Project structure
- Backend setup
- Frontend setup

## Week 2

- Authentication
- User onboarding
- Database integration

## Week 3

- AI Plan Generation
- Dashboard
- Weekly Plans

## Week 4

- Daily Logging
- Testing
- Deployment
- Final Review

---

# 💰 Estimated AWS Cost

| Service | Estimated Cost |
|----------|----------------|
| AWS Lambda | Free Tier |
| DynamoDB | Free Tier |
| Cognito | Free Tier |
| API Gateway | Free Tier |
| Bedrock | ~$5–15/month (depending on usage) |

---

# 👥 Team Workflow

Each team member will work on an assigned module.

- Frontend
- Backend
- AWS Infrastructure
- AI Integration
- Testing & Documentation

All changes must go through Pull Requests before merging into `main`.

---

# 📄 License

This project is developed as part of the FitPlan Internship Project.

---

# ❤️ Built By

FitPlan Development Team
