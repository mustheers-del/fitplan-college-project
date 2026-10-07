FitPlan
AI-Powered Fitness & Nutrition Planner
FitPlan is a full-stack fitness application that creates personalized workout and nutrition plans using AI. It helps users track daily activity, monitor progress, receive fitness guidance, generate recipes, and safely adapt workout recommendations based on injuries and user preferences.
The final production application uses a React + TypeScript frontend deployed on Vercel, an AWS serverless backend, Amazon Cognito authentication, DynamoDB, and Google Gemini for AI-powered features.
Features
Authentication
- User signup and login
- Email confirmation
- Forgot password / password reset
- Secure authentication using Amazon Cognito
- Logout and session handling
Fitness
- AI-generated weekly workout plans
- 3–7 training days per week
- Muscle-focus selection
- Injury-aware workout recommendations
- Injury safety validation
- Daily workout logging
- Progress tracking
- Calendar
- Achievements
AI Fitness Coach
- Context-aware AI fitness guidance
- Uses the user's profile and FitPlan data
- Powered by Gemini through the AWS backend
Nutrition
- AI-generated meal plans
- Nutrition recommendations
- Recipe generation
- Calories and macro information
Weekly Automation
- Weekly plan regeneration
- Previous-week activity used for the next plan
- Maximum 50 users per scheduled run
Production Reliability
- Pydantic schema validation
- Injury-safety business-rule validation
- Automatic AI correction retry
- Deterministic fallback plan if AI is unavailable
- Frontend polling when AI generation takes longer than the HTTP request
- SPA routing support on Vercel
Tech Stack
Frontend
- React 18
- TypeScript
- Vite
- React Router
- Recharts
- Lucide React / React Icons
- Vercel
Backend
- Python 3.12
- AWS Lambda
- Amazon API Gateway
- Amazon DynamoDB
- Amazon Cognito
- AWS SAM / CloudFormation
- Amazon CloudWatch
- AWS Systems Manager Parameter Store
AI
- Google Gemini
- Production model: gemini-3.5-flash-lite
- Shared AI provider abstraction
- Pydantic validation
- Injury-safety validation
- Retry handling
- Deterministic fallback generation
The application previously used AWS Bedrock and OpenRouter during development. The final production AI provider is Gemini.
Architecture
                    React + TypeScript
                       Vercel
                          |
                          | HTTPS + JWT
                          v
                 API Gateway + Cognito
                          |
                          v
                     AWS Lambda
                    /          \
                   /            \
                  v              v
             DynamoDB         Gemini API
                                 |
                      gemini-3.5-flash-lite

Gemini API key
      |
      v
AWS Systems Manager
Parameter Store
The Gemini API key is stored securely in AWS Systems Manager Parameter Store and is never exposed in the frontend or Vercel.
AWS Region
The project uses:
us-east-1
Main AWS services:
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
Injury Safety
FitPlan includes an injury-aware workout generation system.
User selects injury
        ↓
Profile stores injury
        ↓
AI prompt includes restrictions
        ↓
Gemini generates workout
        ↓
Safety validator checks exercises
        ↓
Valid plan → returned to user
Invalid plan → AI correction retry
AI unavailable → safe fallback plan
Supported injury restrictions include:
- Knee
- Shoulder
- Lower back
The safety system prevents exercises that conflict with the selected injury.
Additional lower-back guidance was added to prevent unsafe movements such as Romanian deadlifts when the user's profile contains a lower-back injury.
Plan Validation
FitPlan validates AI plans in two layers.
1. Schema Validation
Pydantic verifies:
- required fields
- data types
- workout/meal structure
- JSON format
2. Business-Rule Validation
FitPlan checks:
- injury restrictions
- dietary preferences
- allergies
- equipment restrictions
- training-day count
- calorie targets
- meal count
- workout safety
If the first Gemini response fails validation, FitPlan sends the validation problem back to the AI for one correction attempt.
Weekly Plan Generation
FitPlan uses previous-week activity when generating the next weekly plan.
Previous week's logs
        ↓
Adherence parsing
        ↓
Profile + previous plan + adherence
        ↓
Gemini generation
        ↓
Validation
        ↓
New weekly plan
        ↓
Stored in DynamoDB
Safety limit:
MAX_USERS_PER_RUN=50
API
Development / live backend API:
https://j3svg2s5id.execute-api.us-east-1.amazonaws.com/dev
Health endpoint:
GET /health
PowerShell example:
Invoke-RestMethod "https://j3svg2s5id.execute-api.us-east-1.amazonaws.com/dev/health"
Frontend Deployment
The production frontend is deployed on Vercel.
Production project:
https://fitplan-college-project-azbh.vercel.app
Vercel configuration:
Root Directory: frontend
Framework: Vite
Build Command: npm run build
Output Directory: dist
Production Branch: gemini-demo
The frontend uses Vercel environment variables for public configuration only:
VITE_API_URL
VITE_COGNITO_USER_POOL_ID
VITE_COGNITO_CLIENT_ID
VITE_USER_POOL_CLIENT_ID
VITE_AWS_REGION
The Gemini API key is not stored in Vercel.
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
Frontend:
http://localhost:5173
Create the local environment file:
Copy-Item .env.example .env
Example frontend environment variables:
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
Build the AWS SAM application:
sam build --no-cached
Deploy:
sam deploy
Testing
Current backend verification:
93 tests passing
Run:
.\backend\.venv\Scripts\python.exe -m pytest backend\tests -q
Frontend production build:
npm run build --prefix frontend
A successful build produces the frontend/dist directory.
Important Production Fixes
The final project includes fixes completed after the original internship implementation.
Gemini Migration
- Replaced the production OpenRouter provider with Gemini
- Added gemini.py
- Added Gemini support to the shared AI provider selector
- Stored the Gemini API key securely in AWS SSM
- Verified Generate Plan, AI Coach, Recipes and Weekly Plan Generator use Gemini
Model Reliability
The production model was changed to:
gemini-3.5-flash-lite
This reduced delays caused by unavailable Gemini model variants.
7-Day Training Support
The deterministic workout layout was extended to support:
daysPerWeek = 7
This fixed the previous KeyError: 7 issue.
New-User Plan Generation
The frontend now continues checking for a saved plan when the initial AI generation HTTP request finishes before the backend completes.
This prevents users from needing to sign out and log back in before seeing their newly generated plan.
Authentication UI
Login and Signup were refined to match the visual language of the Forgot Password page while preserving Cognito functionality.
Sidebar Cleanup
The duplicate profile/user card in the sidebar was removed.
Vercel Routing
frontend/vercel.json provides SPA rewrites so direct routes work correctly after deployment.
Landing Page Asset
The production landing-page hero image is stored at:
frontend/public/fitness-hero.jpg
Security
Secrets and credentials must never be committed to Git.
Never commit:
.env
.env.local
AWS credentials
Gemini API keys
OAuth client secrets
private tokens
The Gemini API key is stored outside the Git repository using AWS Systems Manager Parameter Store.
The browser only receives public Cognito identifiers and the API Gateway URL.
Team
Member	Role
Mustheer	Tech Lead, AI layer, frontend foundations, architecture, integration and reviews
Ankush	Backend models, DynamoDB, profile APIs and backend features
Parshuram	AWS infrastructure, SAM, deployment and cloud configuration
Sohail	Frontend authentication, onboarding and UI development
Aayan	Frontend/API types and supporting frontend development


After the original internship period, Mustheer completed the remaining frontend pages, final AI migration, production fixes and Vercel deployment work.
Git
GitHub repository:
https://github.com/mustheers-del/fitplan-college-project
Main team development branch:
dev
Final production/demo branch:
gemini-demo
The current Vercel deployment tracks:
gemini-demo
Basic workflow:
Feature branch
      ↓
Pull Request
      ↓
Review
      ↓
Merge into dev
Never commit secrets or credentials to Git.
Current Project Status
The main FitPlan application is implemented, tested and deployed.
Completed
- Authentication
- Signup
- Login
- Email confirmation
- Forgot password
- Onboarding
- Dashboard
- Weekly AI workout plans
- 3–7 day workout support
- Muscle focus
- AI meal plans
- Recipe generation
- Daily logs
- Progress tracking
- Calendar
- Achievements
- Profile
- Settings
- AI Coach
- Injury-aware workout generation
- Weekly plan regeneration
- Landing page
- AWS backend deployment
- Vercel frontend deployment
- Gemini AI migration
- Frontend slow-generation polling
- Production SPA routing
Verification
Area	Status
Backend tests	93 passing
Frontend production build	Passing
AWS health check	Passing
Gemini plan generation	Working
AI Coach	Working
Recipe Lambda	Gemini configured
Weekly Plan Generator	Gemini configured
Injury safety flow	Tested
Vercel frontend	Live
End-to-end new-user flow	Working


Project Goal
FitPlan provides users with an AI-powered fitness experience where they can:
- Create an account
- Complete their fitness profile
- Set fitness goals and injuries
- Receive personalized workout and nutrition plans
- Track workouts and meals
- Monitor progress
- Ask the AI Coach for guidance
- Generate recipes
- Track achievements
- Receive updated weekly plans based on previous activity
Project Type
This project was developed as part of an academic/internship project and later completed into a fully deployed end-to-end application.
