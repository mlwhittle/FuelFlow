// Fitness Device Integration Service
// Supports Google Fit, Apple Health (via Web APIs), and manual entry

// Exercise database with MET values (Metabolic Equivalent of Task)
// MET = ratio of working metabolic rate to resting metabolic rate
export const exerciseDatabase = [
    // Cardio
    { id: 'walking-slow', name: 'Walking (2 mph, slow)', category: 'cardio', met: 2.5, icon: '🚶' },
    { id: 'walking-moderate', name: 'Walking (3.5 mph, moderate)', category: 'cardio', met: 4.3, icon: '🚶‍♂️' },
    { id: 'walking-brisk', name: 'Walking (4.5 mph, brisk)', category: 'cardio', met: 5.0, icon: '🚶‍♀️' },
    { id: 'jogging', name: 'Jogging (5 mph)', category: 'cardio', met: 8.0, icon: '🏃' },
    { id: 'running-6mph', name: 'Running (6 mph)', category: 'cardio', met: 9.8, icon: '🏃‍♂️' },
    { id: 'running-7mph', name: 'Running (7 mph)', category: 'cardio', met: 11.0, icon: '🏃‍♀️' },
    { id: 'running-8mph', name: 'Running (8 mph)', category: 'cardio', met: 11.8, icon: '🏃' },
    { id: 'cycling-leisure', name: 'Cycling (leisure, <10 mph)', category: 'cardio', met: 4.0, icon: '🚴' },
    { id: 'cycling-moderate', name: 'Cycling (moderate, 12-14 mph)', category: 'cardio', met: 8.0, icon: '🚴‍♂️' },
    { id: 'cycling-vigorous', name: 'Cycling (vigorous, 14-16 mph)', category: 'cardio', met: 10.0, icon: '🚴‍♀️' },
    { id: 'swimming-leisure', name: 'Swimming (leisure)', category: 'cardio', met: 6.0, icon: '🏊' },
    { id: 'swimming-laps', name: 'Swimming (laps, moderate)', category: 'cardio', met: 8.0, icon: '🏊‍♂️' },
    { id: 'swimming-vigorous', name: 'Swimming (vigorous)', category: 'cardio', met: 10.0, icon: '🏊‍♀️' },
    { id: 'elliptical', name: 'Elliptical Trainer', category: 'cardio', met: 5.0, icon: '🏋️' },
    { id: 'rowing', name: 'Rowing Machine', category: 'cardio', met: 7.0, icon: '🚣' },
    { id: 'stair-climbing', name: 'Stair Climbing', category: 'cardio', met: 8.0, icon: '🪜' },
    { id: 'jump-rope', name: 'Jump Rope', category: 'cardio', met: 12.0, icon: '🪢' },
    { id: 'dancing', name: 'Dancing (general)', category: 'cardio', met: 4.5, icon: '💃' },
    { id: 'aerobics', name: 'Aerobics (high impact)', category: 'cardio', met: 7.0, icon: '🤸' },
    { id: 'hiking', name: 'Hiking (cross-country)', category: 'cardio', met: 6.0, icon: '🥾' },

    // Strength Training
    { id: 'weight-lifting-light', name: 'Weight Lifting (light)', category: 'strength', met: 3.0, icon: '🏋️' },
    { id: 'weight-lifting-moderate', name: 'Weight Lifting (moderate)', category: 'strength', met: 5.0, icon: '🏋️‍♂️' },
    { id: 'weight-lifting-vigorous', name: 'Weight Lifting (vigorous)', category: 'strength', met: 6.0, icon: '🏋️‍♀️' },
    { id: 'bodyweight', name: 'Bodyweight Exercises', category: 'strength', met: 3.8, icon: '💪' },
    { id: 'pushups', name: 'Push-ups', category: 'strength', met: 3.8, icon: '🤸‍♂️' },
    { id: 'pullups', name: 'Pull-ups', category: 'strength', met: 8.0, icon: '🤸‍♀️' },
    { id: 'squats', name: 'Squats', category: 'strength', met: 5.0, icon: '🦵' },
    { id: 'lunges', name: 'Lunges', category: 'strength', met: 4.0, icon: '🦵' },
    { id: 'planks', name: 'Planks', category: 'strength', met: 4.0, icon: '🧘' },

    // Sports
    { id: 'basketball', name: 'Basketball (game)', category: 'sports', met: 8.0, icon: '🏀' },
    { id: 'soccer', name: 'Soccer (game)', category: 'sports', met: 10.0, icon: '⚽' },
    { id: 'tennis', name: 'Tennis (singles)', category: 'sports', met: 8.0, icon: '🎾' },
    { id: 'volleyball', name: 'Volleyball (game)', category: 'sports', met: 4.0, icon: '🏐' },
    { id: 'golf', name: 'Golf (walking, carrying clubs)', category: 'sports', met: 4.3, icon: '⛳' },
    { id: 'baseball', name: 'Baseball/Softball', category: 'sports', met: 5.0, icon: '⚾' },
    { id: 'football', name: 'Football (game)', category: 'sports', met: 8.0, icon: '🏈' },
    { id: 'hockey', name: 'Ice Hockey', category: 'sports', met: 8.0, icon: '🏒' },
    { id: 'martial-arts', name: 'Martial Arts', category: 'sports', met: 10.0, icon: '🥋' },
    { id: 'boxing', name: 'Boxing (sparring)', category: 'sports', met: 9.0, icon: '🥊' },

    // Flexibility & Mind-Body
    { id: 'yoga-hatha', name: 'Yoga (Hatha)', category: 'flexibility', met: 2.5, icon: '🧘' },
    { id: 'yoga-power', name: 'Yoga (Power)', category: 'flexibility', met: 4.0, icon: '🧘‍♂️' },
    { id: 'pilates', name: 'Pilates', category: 'flexibility', met: 3.0, icon: '🧘‍♀️' },
    { id: 'stretching', name: 'Stretching (light)', category: 'flexibility', met: 2.3, icon: '🤸' },
    { id: 'tai-chi', name: 'Tai Chi', category: 'flexibility', met: 3.0, icon: '🥋' },

    // Daily Activities
    { id: 'cleaning', name: 'House Cleaning', category: 'daily', met: 3.5, icon: '🧹' },
    { id: 'gardening', name: 'Gardening', category: 'daily', met: 4.0, icon: '🌱' },
    { id: 'mowing', name: 'Mowing Lawn', category: 'daily', met: 5.5, icon: '🚜' },
    { id: 'stairs', name: 'Climbing Stairs', category: 'daily', met: 8.0, icon: '🪜' },
    { id: 'carrying-groceries', name: 'Carrying Groceries', category: 'daily', met: 3.0, icon: '🛒' },
];

export const exerciseCategories = [
    { id: 'all', name: 'All', icon: '🏃' },
    { id: 'cardio', name: 'Cardio', icon: '❤️' },
    { id: 'strength', name: 'Strength', icon: '💪' },
    { id: 'sports', name: 'Sports', icon: '⚽' },
    { id: 'flexibility', name: 'Flexibility', icon: '🧘' },
    { id: 'daily', name: 'Daily Activities', icon: '🏠' },
];

/**
 * Calculate calories burned based on MET, weight, and duration
 * Formula: Calories = MET × weight(kg) × duration(hours)
 * @param {number} met - Metabolic Equivalent of Task
 * @param {number} weightLbs - User weight in pounds
 * @param {number} durationMinutes - Exercise duration in minutes
 * @returns {number} Calories burned
 */
export const calculateCaloriesBurned = (met, weightLbs, durationMinutes) => {
    const weightKg = weightLbs * 0.453592; // Convert lbs to kg
    const durationHours = durationMinutes / 60;
    return Math.round(met * weightKg * durationHours);
};

/**
 * Search exercises by name or category
 * @param {string} query - Search query
 * @param {string} category - Category filter
 * @returns {Array} Filtered exercises
 */
export const searchExercises = (query = '', category = 'all') => {
    let results = exerciseDatabase;

    // Filter by category
    if (category !== 'all') {
        results = results.filter(ex => ex.category === category);
    }

    // Filter by search query
    if (query && query.trim()) {
        const lowerQuery = query.toLowerCase();
        results = results.filter(ex =>
            ex.name.toLowerCase().includes(lowerQuery)
        );
    }

    return results;
};

/**
 * Get exercise by ID
 * @param {string} id - Exercise ID
 * @returns {Object|null} Exercise object or null
 */
export const getExerciseById = (id) => {
    return exerciseDatabase.find(ex => ex.id === id) || null;
};

/**
 * Calculate steps to calories
 * Average: 100 steps = ~5 calories (varies by weight and pace)
 * @param {number} steps - Number of steps
 * @param {number} weightLbs - User weight in pounds
 * @returns {number} Estimated calories burned
 */
export const stepsToCalories = (steps, weightLbs = 150) => {
    // More accurate formula based on weight
    const caloriesPerStep = (weightLbs * 0.57) / 1000;
    return Math.round(steps * caloriesPerStep);
};

/**
 * Check if Web Bluetooth is supported
 * @returns {boolean}
 */
export const isBluetoothSupported = () => {
    return 'bluetooth' in navigator;
};

/**
 * Request Bluetooth device connection (for future implementation)
 * This would connect to fitness trackers via Web Bluetooth API
 */
export const connectBluetoothDevice = async () => {
    if (!isBluetoothSupported()) {
        throw new Error('Web Bluetooth is not supported in this browser');
    }

    try {
        // Request device with heart rate service
        const device = await navigator.bluetooth.requestDevice({
            filters: [{ services: ['heart_rate'] }],
            optionalServices: ['battery_service']
        });

        return device;
    } catch (error) {
        console.error('Bluetooth connection error:', error);
        throw error;
    }
};

/**
 * Google Fit integration placeholder
 * In production, this would use Google Fit REST API
 */
export const syncGoogleFit = async () => {
    // Placeholder for Google Fit OAuth and data sync
    console.log('Google Fit sync would happen here');
    return {
        steps: 0,
        calories: 0,
        activities: []
    };
};

/**
 * Apple Health integration placeholder
 * In production, this would use HealthKit via native bridge or Web API
 */
export const syncAppleHealth = async () => {
    // Placeholder for Apple Health data sync
    console.log('Apple Health sync would happen here');
    return {
        steps: 0,
        calories: 0,
        activities: []
    };
};
