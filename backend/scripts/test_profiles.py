"""
The five fixture profiles from docs/05-AI-LAYER-GUIDE.md.
Each one exists to break a different constraint in the prompt.
"""

PROFILES = {
    "beginner_cut_home": dict(
        age=24, sex="male", heightCm=175, weightKg=85, goal="lose_weight",
        activityLevel="sedentary", experience="beginner", daysPerWeek=3,
        equipment=["bodyweight"], mealsPerDay=3, cookingTime=20,
    ),
    "advanced_bulk_gym": dict(
        age=28, sex="male", heightCm=180, weightKg=75, goal="build_muscle",
        activityLevel="active", experience="advanced", daysPerWeek=6,
        equipment=["barbell", "dumbbell", "machines", "cables"],
        split="push_pull_legs", mealsPerDay=5, cookingTime=45,
    ),
    # tests the injury constraint -- no squats, lunges, or jumping
    "knee_injury": dict(
        age=35, sex="female", heightCm=163, weightKg=68, goal="stay_fit",
        activityLevel="light", experience="intermediate", daysPerWeek=4,
        equipment=["dumbbell", "resistance_band"], injuries=["left knee - ACL"],
        mealsPerDay=3, cookingTime=30,
    ),
    # tests the dietary constraint -- absolutely no meat
    "vegetarian_high_protein": dict(
        age=22, sex="male", heightCm=170, weightKg=60, goal="build_muscle",
        activityLevel="moderate", experience="beginner", daysPerWeek=4,
        equipment=["dumbbell", "barbell"], mealPref="vegetarian",
        cuisine=["indian"], allergies=["peanuts"], mealsPerDay=4, cookingTime=30,
    ),
    # tests the time constraint
    "time_limited": dict(
        age=41, sex="female", heightCm=158, weightKg=72, goal="lose_weight",
        activityLevel="sedentary", experience="beginner", daysPerWeek=3,
        equipment=["bodyweight", "resistance_band"], mealsPerDay=3, cookingTime=20,
    ),
}
