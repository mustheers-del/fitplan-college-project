# FitPlan

## AI-Powered Fitness & Nutrition Planner

FitPlan is a full-stack fitness application that creates personalized workout and nutrition plans using AI. It helps users track daily activity, monitor progress, receive fitness guidance, generate recipes, and safely adapt workout recommendations based on injuries.

---

## Features

### Authentication

* User signup and login
* Email confirmation
* Forgot password / password reset
* Secure authentication using Amazon Cognito
* Logout and session handling

### Fitness

* AI-generated weekly workout plans
* Muscle-focus selection
* Injury-aware workout recommendations
* Injury safety validation
* Daily workout logging
* Progress tracking
* Calendar
* Achievements
* AI Fitness Coach

### Nutrition

* AI-generated meal plans
* Nutrition recommendations
* Recipe generation

### Weekly Automation

* Weekly plan regeneration
* Previous-week activity used for the next plan
* Maximum 50 users per scheduled run

---

## Tech Stack

### Frontend

* React 18
* TypeScript
* Vite
* React Router
* Netlify

### Backend

* Python 3.12
* AWS Lambda
* Amazon API Gateway
* Amazon DynamoDB
* Amazon Cognito
* AWS SAM
* Amazon CloudWatch

### AI

* OpenRouter
* Claude Haiku 4.5
* Pydantic validation
* Injury-safety validation and retry handling

---

## Architecture

```text
                    React + TypeScript
                           |
                           | HTTPS + JWT
                           v
                 API Gateway + Cognito
                           |
                           v
                      AWS Lambda
                       /       \
                      /         \
                     v           v
                DynamoDB     OpenRouter
                                  |
                             Claude Haiku
```

---

## AWS Region

The project uses:

`us-east-1`

Main AWS services:

* Amazon Cognito
* API Gateway
* AWS Lambda
* DynamoDB
* CloudWatch
* AWS SAM

---

## DynamoDB

Main table:

`fitplan-dev-main`

User partition:

`PK = USER#<Cognito User ID>`

Common sort keys:

```text
PROFILE
PLAN#<weekStartDate>
DAILYLOG#<date>
```

---

## Injury Safety

FitPlan includes an injury-aware workout generation system.

```text
User selects injury
        ↓
Profile stores injury
        ↓
AI prompt includes restrictions
        ↓
AI generates workout
        ↓
Safety validator checks exercises
        ↓
Valid plan → returned to user
Invalid plan → AI retry
```

Supported injury restrictions include:

* Knee
* Shoulder
* Lower back

The system prevents exercises that conflict with the selected injury.

---

## Weekly Plan Generation

FitPlan uses previous-week activity when generating the next weekly plan.

```text
Previous week's logs
        ↓
Adherence parsing
        ↓
Profile + previous plan + adherence
        ↓
AI generation
        ↓
New weekly plan
        ↓
Stored in DynamoDB
```

Safety limit:

`MAX_USERS_PER_RUN=50`

---

## API

Development API:

```text
https://j3svg2s5id.execute-api.us-east-1.amazonaws.com/dev
```

Health endpoint:

```text
GET /health
```

Example:

```powershell
Invoke-RestMethod "https://j3svg2s5id.execute-api.us-east-1.amazonaws.com/dev/health"
```

---

## Project Structure

```text
backend/
├── common/
├── functions/
├── tests/
└── template.yaml

frontend/
├── src/
│   ├── api/
│   ├── auth/
│   ├── components/
│   ├── pages/
│   ├── styles/
│   └── types/
├── package.json
└── vite.config.ts

docs/
README.md
```

---

## Local Development

### Frontend

From the project root:

```powershell
cd frontend
npm install
npm run dev
```

Frontend:

`http://localhost:5173`

Create the local environment file:

```powershell
Copy-Item .env.example .env
```

Configure the required environment variables before running the application.

### Backend

From the project root:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements-dev.txt
```

Run backend tests:

```powershell
python -m pytest tests -q
```

---

## Testing

Current backend verification:

**93 tests passing**

Run:

```powershell
.\backend\.venv\Scripts\python.exe -m pytest backend\tests -q
```

The frontend production build can be verified with:

```powershell
npm run build --prefix frontend
```

---

## Security

Secrets and credentials must not be committed to Git.

Never commit:

```text
.env
.env.local
AWS credentials
API keys
OAuth client secrets
private tokens
```

The OpenRouter API key is stored outside the Git repository using AWS Systems Manager Parameter Store.

---

## Team

| Member        | Role                                                                             |
| ------------- | -------------------------------------------------------------------------------- |
| **Mustheer**  | Tech Lead, AI layer, frontend foundations, architecture, integration and reviews |
| **Ankush**    | Backend models, DynamoDB, profile APIs and backend features                      |
| **Parshuram** | AWS infrastructure, SAM, deployment and cloud configuration                      |
| **Sohail**    | Frontend authentication, onboarding and UI development                           |
| **Aayan**     | Frontend/API types and supporting frontend development                           |

---

## Git

Current development branch:

`dev`

GitHub repository:

`https://github.com/mustheers-del/fitplan-college-project`

Basic workflow:

```text
Feature branch
      ↓
Pull Request
      ↓
Review
      ↓
Merge into dev
```

Never commit secrets or credentials to Git.

---

## Current Project Status

The main FitPlan application is implemented and tested.

### Completed

* Authentication
* Signup
* Login
* Email confirmation
* Forgot password
* Onboarding
* Dashboard
* Weekly AI workout plans
* Muscle focus
* AI meal plans
* Recipe generation
* Daily logs
* Progress tracking
* Calendar
* Achievements
* Profile
* Settings
* AI Coach
* Injury-aware workout generation
* Weekly plan regeneration
* Landing page
* AWS backend deployment

### Verification

| Area                      | Status     |
| ------------------------- | ---------- |
| Backend tests             | 93 passing |
| Frontend production build | Passing    |
| AWS health check          | Passing    |
| Weekly plan generation    | Tested     |
| Injury safety flow        | Tested     |

---

## Project Goal

FitPlan provides users with an AI-powered fitness experience where they can:

1. Create an account
2. Complete their fitness profile
3. Set fitness goals and injuries
4. Receive personalized workout and nutrition plans
5. Track workouts and meals
6. Monitor progress
7. Ask the AI Coach for guidance
8. Generate recipes
9. Track achievements
10. Receive updated weekly plans based on previous activity

---

## Project Type

This project was developed as part of an academic/internship project.

---
