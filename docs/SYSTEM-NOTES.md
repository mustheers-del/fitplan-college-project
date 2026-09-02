POST /onboard receives the onboarding form from the frontend through the API client.
The Lambda validates the profile, calculates the calorie target, and delegates saving to the DynamoDB layer.
DynamoDB stores the profile using PK=USER#<userId> and SK=PROFILE.
