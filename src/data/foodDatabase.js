// Curated food database with verified nutritional information
export const foodDatabase = [
    // Fruits
    {
        id: 1,
        name: 'Apple',
        category: 'fruits',
        serving: '1 medium (182g)',
        calories: 95,
        protein: 0.5,
        carbs: 25,
        fats: 0.3,
        fiber: 4.4,
        barcode: '0000000000001'
    },
    {
        id: 2,
        name: 'Banana',
        category: 'fruits',
        serving: '1 medium (118g)',
        calories: 105,
        protein: 1.3,
        carbs: 27,
        fats: 0.4,
        fiber: 3.1,
        barcode: '0000000000002'
    },
    {
        id: 3,
        name: 'Orange',
        category: 'fruits',
        serving: '1 medium (131g)',
        calories: 62,
        protein: 1.2,
        carbs: 15,
        fats: 0.2,
        fiber: 3.1,
        barcode: '0000000000003'
    },
    {
        id: 4,
        name: 'Strawberries',
        category: 'fruits',
        serving: '1 cup (152g)',
        calories: 49,
        protein: 1,
        carbs: 12,
        fats: 0.5,
        fiber: 3,
        barcode: '0000000000004'
    },
    {
        id: 5,
        name: 'Blueberries',
        category: 'fruits',
        serving: '1 cup (148g)',
        calories: 84,
        protein: 1.1,
        carbs: 21,
        fats: 0.5,
        fiber: 3.6,
        barcode: '0000000000005'
    },

    // Vegetables
    {
        id: 10,
        name: 'Broccoli',
        category: 'vegetables',
        serving: '1 cup chopped (91g)',
        calories: 31,
        protein: 2.6,
        carbs: 6,
        fats: 0.3,
        fiber: 2.4,
        barcode: '0000000000010'
    },
    {
        id: 11,
        name: 'Spinach',
        category: 'vegetables',
        serving: '1 cup raw (30g)',
        calories: 7,
        protein: 0.9,
        carbs: 1.1,
        fats: 0.1,
        fiber: 0.7,
        barcode: '0000000000011'
    },
    {
        id: 12,
        name: 'Carrots',
        category: 'vegetables',
        serving: '1 medium (61g)',
        calories: 25,
        protein: 0.6,
        carbs: 6,
        fats: 0.1,
        fiber: 1.7,
        barcode: '0000000000012'
    },
    {
        id: 13,
        name: 'Sweet Potato',
        category: 'vegetables',
        serving: '1 medium (114g)',
        calories: 103,
        protein: 2.3,
        carbs: 24,
        fats: 0.2,
        fiber: 3.8,
        barcode: '0000000000013'
    },

    // Proteins
    {
        id: 20,
        name: 'Chicken Breast',
        category: 'proteins',
        serving: '100g cooked',
        calories: 165,
        protein: 31,
        carbs: 0,
        fats: 3.6,
        fiber: 0,
        barcode: '0000000000020'
    },
    {
        id: 21,
        name: 'Salmon',
        category: 'proteins',
        serving: '100g cooked',
        calories: 206,
        protein: 22,
        carbs: 0,
        fats: 13,
        fiber: 0,
        barcode: '0000000000021'
    },
    {
        id: 22,
        name: 'Eggs',
        category: 'proteins',
        serving: '1 large (50g)',
        calories: 72,
        protein: 6.3,
        carbs: 0.4,
        fats: 4.8,
        fiber: 0,
        barcode: '0000000000022'
    },
    {
        id: 23,
        name: 'Greek Yogurt',
        category: 'proteins',
        serving: '1 cup (200g)',
        calories: 100,
        protein: 17,
        carbs: 6,
        fats: 0.7,
        fiber: 0,
        barcode: '0000000000023'
    },
    {
        id: 24,
        name: 'Tofu',
        category: 'proteins',
        serving: '100g',
        calories: 76,
        protein: 8,
        carbs: 1.9,
        fats: 4.8,
        fiber: 0.3,
        barcode: '0000000000024'
    },

    // Grains
    {
        id: 30,
        name: 'Brown Rice',
        category: 'grains',
        serving: '1 cup cooked (195g)',
        calories: 216,
        protein: 5,
        carbs: 45,
        fats: 1.8,
        fiber: 3.5,
        barcode: '0000000000030'
    },
    {
        id: 31,
        name: 'Oatmeal',
        category: 'grains',
        serving: '1 cup cooked (234g)',
        calories: 166,
        protein: 5.9,
        carbs: 28,
        fats: 3.6,
        fiber: 4,
        barcode: '0000000000031'
    },
    {
        id: 32,
        name: 'Whole Wheat Bread',
        category: 'grains',
        serving: '1 slice (28g)',
        calories: 69,
        protein: 3.6,
        carbs: 12,
        fats: 0.9,
        fiber: 1.9,
        barcode: '0000000000032'
    },
    {
        id: 33,
        name: 'Quinoa',
        category: 'grains',
        serving: '1 cup cooked (185g)',
        calories: 222,
        protein: 8.1,
        carbs: 39,
        fats: 3.6,
        fiber: 5.2,
        barcode: '0000000000033'
    },

    // Nuts & Seeds
    {
        id: 40,
        name: 'Almonds',
        category: 'nuts',
        serving: '1 oz (28g)',
        calories: 164,
        protein: 6,
        carbs: 6,
        fats: 14,
        fiber: 3.5,
        barcode: '0000000000040'
    },
    {
        id: 41,
        name: 'Peanut Butter',
        category: 'nuts',
        serving: '2 tbsp (32g)',
        calories: 188,
        protein: 8,
        carbs: 7,
        fats: 16,
        fiber: 2,
        barcode: '0000000000041'
    },
    {
        id: 42,
        name: 'Chia Seeds',
        category: 'nuts',
        serving: '1 oz (28g)',
        calories: 138,
        protein: 4.7,
        carbs: 12,
        fats: 8.7,
        fiber: 9.8,
        barcode: '0000000000042'
    },

    // Dairy
    {
        id: 50,
        name: 'Milk (2%)',
        category: 'dairy',
        serving: '1 cup (244g)',
        calories: 122,
        protein: 8,
        carbs: 12,
        fats: 4.8,
        fiber: 0,
        barcode: '0000000000050'
    },
    {
        id: 51,
        name: 'Cheddar Cheese',
        category: 'dairy',
        serving: '1 oz (28g)',
        calories: 114,
        protein: 7,
        carbs: 0.4,
        fats: 9.4,
        fiber: 0,
        barcode: '0000000000051'
    },

    // Common Meals
    {
        id: 100,
        name: 'Protein Shake',
        category: 'beverages',
        serving: '1 scoop (30g)',
        calories: 120,
        protein: 24,
        carbs: 3,
        fats: 1.5,
        fiber: 1,
        barcode: '0000000000100'
    },
    {
        id: 101,
        name: 'Avocado',
        category: 'fruits',
        serving: '1/2 medium (68g)',
        calories: 114,
        protein: 1.3,
        carbs: 6,
        fats: 10.5,
        fiber: 4.6,
        barcode: '0000000000101'
    }
];

export const categories = [
    { id: 'all', name: 'All Foods', icon: '🍽️' },
    { id: 'fruits', name: 'Fruits', icon: '🍎' },
    { id: 'vegetables', name: 'Vegetables', icon: '🥦' },
    { id: 'proteins', name: 'Proteins', icon: '🍗' },
    { id: 'grains', name: 'Grains', icon: '🌾' },
    { id: 'nuts', name: 'Nuts & Seeds', icon: '🥜' },
    { id: 'dairy', name: 'Dairy', icon: '🥛' },
    { id: 'beverages', name: 'Beverages', icon: '🥤' }
];

// Search function
export const searchFoods = (query, category = 'all') => {
    let results = foodDatabase;

    if (category !== 'all') {
        results = results.filter(food => food.category === category);
    }

    if (query) {
        const lowerQuery = query.toLowerCase();
        results = results.filter(food =>
            food.name.toLowerCase().includes(lowerQuery)
        );
    }

    return results;
};

// Get food by barcode
export const getFoodByBarcode = (barcode) => {
    return foodDatabase.find(food => food.barcode === barcode);
};

// Get food by ID
export const getFoodById = (id) => {
    return foodDatabase.find(food => food.id === id);
};
