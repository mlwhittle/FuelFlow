// Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor Equation
export const calculateBMR = (weight, height, age, gender) => {
    // weight in kg, height in cm
    if (gender === 'male') {
        return 10 * weight + 6.25 * height - 5 * age + 5;
    } else if (gender === 'female') {
        return 10 * weight + 6.25 * height - 5 * age - 161;
    } else {
        // Average for other
        return 10 * weight + 6.25 * height - 5 * age - 78;
    }
};

// Calculate TDEE (Total Daily Energy Expenditure)
export const calculateTDEE = (bmr, activityLevel) => {
    const activityMultipliers = {
        sedentary: 1.2,      // Little or no exercise
        light: 1.375,        // Light exercise 1-3 days/week
        moderate: 1.55,      // Moderate exercise 3-5 days/week
        active: 1.725,       // Hard exercise 6-7 days/week
        veryActive: 1.9      // Very hard exercise & physical job
    };

    return Math.round(bmr * (activityMultipliers[activityLevel] || 1.55));
};

// Calculate daily calorie goal based on weight goal
export const calculateCalorieGoal = (tdee, goal) => {
    switch (goal) {
        case 'lose':
            return Math.round(tdee - 500); // 500 calorie deficit for ~1 lb/week loss
        case 'gain':
            return Math.round(tdee + 300); // 300 calorie surplus for lean gain
        case 'maintain':
        default:
            return tdee;
    }
};

// Calculate recommended macros based on goal
export const calculateMacros = (calories, goal) => {
    let proteinPercent, carbsPercent, fatsPercent;

    switch (goal) {
        case 'lose':
            proteinPercent = 0.35; // Higher protein for muscle preservation
            fatsPercent = 0.25;
            carbsPercent = 0.40;
            break;
        case 'gain':
            proteinPercent = 0.30;
            fatsPercent = 0.25;
            carbsPercent = 0.45;
            break;
        case 'maintain':
        default:
            proteinPercent = 0.30;
            fatsPercent = 0.30;
            carbsPercent = 0.40;
    }

    return {
        protein: Math.round((calories * proteinPercent) / 4), // 4 cal per gram
        carbs: Math.round((calories * carbsPercent) / 4),
        fats: Math.round((calories * fatsPercent) / 9) // 9 cal per gram
    };
};

// Calculate calories burned from exercise
export const calculateExerciseCalories = (activity, duration, weight) => {
    // MET values (Metabolic Equivalent of Task)
    const metValues = {
        walking: 3.5,
        jogging: 7.0,
        running: 9.8,
        cycling: 7.5,
        swimming: 8.0,
        weightlifting: 6.0,
        yoga: 2.5,
        hiit: 8.0,
        dancing: 5.0,
        sports: 6.5
    };

    const met = metValues[activity] || 5.0;
    // Calories = MET × weight(kg) × duration(hours)
    return Math.round(met * weight * (duration / 60));
};

// Calculate percentage of goal
export const calculatePercentage = (current, goal) => {
    if (goal === 0) return 0;
    return Math.min(Math.round((current / goal) * 100), 100);
};

// Calculate remaining calories
export const calculateRemaining = (goal, consumed, burned = 0) => {
    return goal - consumed + burned;
};

// Format number with commas
export const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Calculate BMI
export const calculateBMI = (weight, height) => {
    // weight in kg, height in cm
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
};

// Get BMI category
export const getBMICategory = (bmi) => {
    if (bmi < 18.5) return { category: 'Underweight', color: 'var(--warning)' };
    if (bmi < 25) return { category: 'Normal', color: 'var(--success)' };
    if (bmi < 30) return { category: 'Overweight', color: 'var(--warning)' };
    return { category: 'Obese', color: 'var(--error)' };
};
