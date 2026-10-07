# FitPlan

## AI-Powered Fitness & Nutrition Planner

FitPlan is a full-stack, AI-powered fitness and nutrition web application that creates personalized workout and meal plans based on a user's fitness goals, experience level, injuries, diet preferences, equipment, and lifestyle.

The application allows users to sign up, complete onboarding, generate an AI-powered fitness plan, track progress, log activities, use an AI Coach, generate recipes, and receive updated weekly plans.

The final production version uses a **React + TypeScript frontend deployed on Vercel**, an **AWS serverless backend**, **Amazon Cognito authentication**, **DynamoDB**, and **Google Gemini AI**.

---

## Live Project

Frontend:

```text
https://fitplan-college-project-azbh.vercel.app

Backend API:
https://j3svg2s5id.execute-api.us-east-1.amazonaws.com/dev

Health Check:
https://j3svg2s5id.execute-api.us-east-1.amazonaws.com/dev/health

Features
Authentication
- User signup
- User login
- Email verification
- Forgot password / password reset
- Secure authentication using Amazon Cognito
- Logout and session handling
Onboarding
Users complete a personalized onboarding flow that collects information such as:
- Age
- Height
- Weight
- Fitness goal
- Experience level
- Training days per week
- Available equipment
- Injuries
- Dietary preference
- Cuisine preference
- Meals per day
- Calorie target
AI Workout Plans
FitPlan generates personalized 7-day workout plans using Gemini AI.
Workout plans include:
- Training and rest days
- Exercise names
- Sets
- Repetitions
- Duration
- Target muscles
- Estimated calories
- Injury-aware exercise selection
FitPlan supports users training from 3 to 7 days per week.
Meal Plans
AI-generated meal plans include:
- Breakfast
- Lunch
- Dinner
- Snacks
- Calories
- Protein
- Carbohydrates
- Fats
- Preparation time
- Ingredients
Meal plans respect:
- Diet preferences
- Allergies
- Cuisine preferences
- Calorie targets
- Meal count
- Cooking time
AI Coach
The AI Coach provides fitness guidance based on the user's FitPlan profile and data.
Users can ask questions such as:
Should I take a rest day today?

How can I improve my workout?

What should I eat after training?

Recipe Generation
Users can generate simple AI-powered recipes directly from meals in their FitPlan meal plan.
Recipes include:
- Recipe name
- Ingredients
- Preparation steps
- Preparation time
Injury Safety
FitPlan includes an injury-aware workout generation system.
Supported injury restrictions include:
- Knee
- Shoulder
- Lower back
Flow:
User selects injury
        ↓
Profile stores injury
        ↓
AI receives injury restrictions
        ↓
Gemini generates workout
        ↓
Safety validator checks exercises
        ↓
Valid plan → saved
Invalid plan → AI correction retry

The system prevents exercises that conflict with the user's injury restrictions.
Daily Logs
Users can log their daily fitness activity.
Logs can include:
- Workouts completed
- Meals
- Activity
- Notes
- Daily progress
Progress Tracking
Users can monitor fitness progress using:
- Weight
- Body fat
- Muscle mass
- Calories burned
- Progress charts
Calendar
The Calendar page helps users view their activity and fitness history by date.
Achievements
Users can track:
- Fitness streaks
- Progress milestones
- Achievement badges
Profile
Users can view and manage:
- Personal information
- Fitness information
- Health details
- Measurements
- Account data
Settings
The Settings page provides account and application options.
Weekly Plan Regeneration
FitPlan can automatically generate a new weekly plan using:
- User profile
- Previous week's plan
- Previous week's activity
- Adherence data
Flow:
Previous week's logs
        ↓
Adherence analysis
        ↓
User profile + previous plan
        ↓
Gemini generation
        ↓
Validation
        ↓
New weekly plan
        ↓
Stored in DynamoDB

Safety limit:
MAX_USERS_PER_RUN = 50

AI System
The final production version uses Google Gemini.
Current AI provider:
Gemini

Current production model:
gemini-3.5-flash-lite

The project previously experimented with AWS Bedrock and OpenRouter, but the final deployed AI provider is Gemini.
AI Reliability
FitPlan includes multiple reliability layers.
1. Schema Validation
AI responses are validated using Pydantic.
This checks:
- Correct JSON format
- Required fields
- Correct data types
- Workout structure
- Meal structure
2. Business Rule Validation
The system also checks whether the plan is actually correct for the user.
Validation includes:
- Injury restrictions
- Training days
- Equipment
- Diet preferences
- Allergies
- Meal count
- Calorie targets
- Workout safety
3. AI Correction Retry
If the first response fails validation, FitPlan sends the exact validation error back to Gemini and requests a corrected plan.
4. Safe Fallback
If Gemini is unavailable, FitPlan can generate a safe fallback plan instead of leaving the user without a plan.
Architecture
                    React + TypeScript
                         Vercel
                            |
                            |
                      HTTPS + JWT
                            |
                            v
                 API Gateway + Cognito
                            |
                            v
                       AWS Lambda
                      /          \
                     /            \
                    v              v
               DynamoDB        Gemini API
                                  |
                         gemini-3.5-flash-lite

Gemini API key storage:
Gemini API Key
      ↓
AWS Systems Manager
Parameter Store

The Gemini API key is never exposed in the frontend or Vercel.
Tech Stack
Frontend
- React 18
- TypeScript
- Vite
- React Router
- Recharts
- Lucide React
- React Icons
- Vercel
Backend
- Python 3.12
- AWS Lambda
- Amazon API Gateway
- Amazon DynamoDB
- Amazon Cognito
- AWS SAM
- CloudFormation
- Amazon CloudWatch
- AWS Systems Manager Parameter Store
AI
- Google Gemini
- gemini-3.5-flash-lite
- Pydantic validation
- Injury-safety validation
- Retry handling
- Fallback plan generation
AWS Region
FitPlan uses:
us-east-1

AWS services used:
- Amazon Cognito
- Amazon API Gateway
- AWS Lambda
- Amazon DynamoDB
- Amazon CloudWatch
- AWS SAM
- AWS Systems Manager Parameter Store
DynamoDB
Main table:
fitplan-dev-main

User partition:
PK = USER#<Cognito User ID>

Common sort keys:
PROFILE
PLAN#<weekStartDate>
DAILYLOG#<date>

Project Structure
backend/
├── common/
├── functions/
├── tests/
├── layer/
├── samconfig.toml
└── template.yaml

frontend/
├── public/
│   └── fitness-hero.jpg
├── src/
│   ├── api/
│   ├── auth/
│   ├── components/
│   ├── pages/
│   ├── styles/
│   └── types/
├── package.json
├── vercel.json
└── vite.config.ts

docs/

README.md

Local Development
Frontend
From the project root:
cd frontend
npm install
npm run dev

Local frontend:
http://localhost:5173

Create the environment file:
Copy-Item .env.example .env

Required frontend environment variables:
VITE_API_URL=https://j3svg2s5id.execute-api.us-east-1.amazonaws.com/dev

VITE_COGNITO_USER_POOL_ID=<your-user-pool-id>

VITE_COGNITO_CLIENT_ID=<your-client-id>

VITE_USER_POOL_CLIENT_ID=<your-client-id>

VITE_AWS_REGION=us-east-1

Do not place the Gemini API key in the frontend environment.
Backend
From the project root:
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements-dev.txt

Run backend tests:
python -m pytest tests -q

Build:
sam build --no-cached

Deploy:
sam deploy

Testing
Backend verification:
93 tests passing

Run:
.\backend\.venv\Scripts\python.exe -m pytest backend\tests -q

Frontend production build:
npm run build --prefix frontend

Successful build output:
frontend/dist

Production Deployment
Backend
The backend is deployed on AWS using SAM.
Main deployed Lambda functions include:
fitplan-dev-health
fitplan-dev-onboard
fitplan-dev-profile
fitplan-dev-generate-plan
fitplan-dev-get-plan
fitplan-dev-log-daily
fitplan-dev-get-logs
fitplan-dev-coach
fitplan-dev-recipes
fitplan-dev-weekly-plan-gen

Frontend
The frontend is deployed on Vercel.
Configuration:
Root Directory: frontend
Framework: Vite
Build Command: npm run build
Output Directory: dist
Production Branch: gemini-demo

Vercel environment variables:
VITE_API_URL
VITE_COGNITO_USER_POOL_ID
VITE_COGNITO_CLIENT_ID
VITE_USER_POOL_CLIENT_ID
VITE_AWS_REGION

The Gemini API key is stored only in AWS.
Important Fixes Completed
Gemini Migration
The final project was migrated from OpenRouter to Gemini.
Completed work:
- Added Gemini provider integration
- Added Gemini support to the shared AI layer
- Stored Gemini API key in AWS SSM
- Updated AWS Lambda environment configuration
- Verified Generate Plan uses Gemini
- Verified AI Coach uses Gemini
- Verified Recipe Generator uses Gemini
- Verified Weekly Plan Generator uses Gemini
7-Day Workout Fix
A user selecting 7 training days previously caused:
KeyError: 7

The training layout system was updated to support 7 days correctly.
Injury Validation Improvements
Extra lower-back injury instructions were added to prevent unsafe movements such as:
Romanian Deadlift
Dumbbell Romanian Deadlift
Good Morning
Back Extension

New User Plan Generation Fix
Previously:
Create My Plan
        ↓
Plan generated in backend
        ↓
Frontend timed out
        ↓
Nothing appeared
        ↓
User had to logout/login

Now:
Create My Plan
        ↓
Backend starts generation
        ↓
Frontend waits / polls
        ↓
Plan saved
        ↓
Plan appears automatically

Vercel Routing Fix
A vercel.json file was added so React routes work correctly when opened directly.
Examples:
/dashboard
/workout
/meals
/coach
/profile
/settings
/forgot-password

Sidebar Cleanup
The duplicate profile card at the bottom of the sidebar was removed.
Authentication UI
Login and Signup were redesigned to match the visual style of the Forgot Password page.
Landing Page Asset
The landing page hero image is stored at:
frontend/public/fitness-hero.jpg

Security
Never commit:
.env
.env.local
AWS credentials
Gemini API keys
OAuth client secrets
private tokens

The Gemini API key is stored securely using:
AWS Systems Manager Parameter Store

The frontend only receives public configuration such as:
- API Gateway URL
- Cognito User Pool ID
- Cognito Client ID
- AWS region
Team
Member	Role
Mustheer Shaikh	Tech Lead, AI layer, frontend, architecture, integration, final deployment
Ankush Raut	Backend models, DynamoDB, profile APIs and backend features
Parshuram	AWS infrastructure, SAM, deployment and cloud configuration
Sohail	Frontend authentication, onboarding and UI development
Aayan	Frontend/API types and supporting frontend work


After the original internship period, Mustheer completed the remaining frontend pages, final AI migration, production fixes, and Vercel deployment work.
Git
GitHub repository:
https://github.com/mustheers-del/fitplan-college-project

Main development branch:
dev

Final production/demo branch:
gemini-demo

Vercel production deployment tracks:
gemini-demo

Basic workflow:
Feature Branch
      ↓
Pull Request
      ↓
Review
      ↓
Merge

Current Project Status
Area	Status
Authentication	✅ Working
Onboarding	✅ Working
Dashboard	✅ Working
AI workout generation	✅ Working
AI meal generation	✅ Working
AI Coach	✅ Working
Recipe generation	✅ Working
Injury safety validation	✅ Working
7-day workout support	✅ Working
Daily logs	✅ Working
Progress tracking	✅ Working
Calendar	✅ Working
Achievements	✅ Working
Profile	✅ Working
Settings	✅ Working
Forgot password	✅ Working
Weekly generation	✅ Working
AWS backend	✅ Live
Vercel frontend	✅ Live
Frontend production build	✅ Passing
Backend tests	✅ 93 passing
End-to-end new-user flow	✅ Working


Project Goal
FitPlan provides users with a complete AI-powered fitness experience where they can:
- Create an account
- Complete a fitness profile
- Set goals
- Add injuries and restrictions
- Receive personalized workouts
- Receive personalized meal plans
- Track activities
- Monitor progress
- Ask an AI Coach for guidance
- Generate recipes
- Track achievements
- Receive updated weekly fitness plans
Project Type
FitPlan was developed as part of an academic/internship project and later completed into a fully deployed end-to-end AI fitness application.
