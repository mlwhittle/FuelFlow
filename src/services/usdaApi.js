// USDA FoodData Central API Service
// API Documentation: https://fdc.nal.usda.gov/api-guide.html

const USDA_API_KEY = 'scOpA38fQHvQmUNE2eWhsXtp8RXiJ5oPWQ958zda';
const USDA_API_BASE = 'https://api.nal.usda.gov/fdc/v1';

// Cache for API responses to reduce API calls
const searchCache = new Map();
const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

/**
 * Search foods in USDA database
 * @param {string} query - Search term
 * @param {number} pageSize - Number of results (max 200)
 * @param {number} pageNumber - Page number for pagination
 * @returns {Promise<Array>} Array of food items
 */
export const searchUSDAFoods = async (query, pageSize = 50, pageNumber = 1) => {
    if (!query || query.trim().length < 2) {
        return [];
    }

    const cacheKey = `${query}-${pageSize}-${pageNumber}`;

    // Check cache first
    const cached = searchCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
    }

    try {
        const response = await fetch(`${USDA_API_BASE}/foods/search?api_key=${USDA_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: query,
                pageSize: pageSize,
                pageNumber: pageNumber,
                dataType: ['Foundation', 'SR Legacy', 'Branded'], // Include all food types
            }),
        });

        if (!response.ok) {
            throw new Error(`USDA API error: ${response.status}`);
        }

        const data = await response.json();
        const foods = data.foods || [];

        // Transform USDA format to our app format
        const transformedFoods = foods.map(food => transformUSDAFood(food));

        // Cache the results
        searchCache.set(cacheKey, {
            data: transformedFoods,
            timestamp: Date.now(),
        });

        return transformedFoods;
    } catch (error) {
        console.error('Error fetching from USDA API:', error);
        return [];
    }
};

/**
 * Get detailed food information by FDC ID
 * @param {number} fdcId - USDA FDC ID
 * @returns {Promise<Object>} Detailed food information
 */
export const getFoodDetails = async (fdcId) => {
    try {
        const response = await fetch(
            `${USDA_API_BASE}/food/${fdcId}?api_key=${USDA_API_KEY}`
        );

        if (!response.ok) {
            throw new Error(`USDA API error: ${response.status}`);
        }

        const data = await response.json();
        return transformUSDAFood(data);
    } catch (error) {
        console.error('Error fetching food details:', error);
        return null;
    }
};

/**
 * Transform USDA food data to our app format
 * @param {Object} usdaFood - USDA food object
 * @returns {Object} Transformed food object
 */
const transformUSDAFood = (usdaFood) => {
    // Extract nutrients
    const nutrients = usdaFood.foodNutrients || [];

    const getNutrient = (nutrientId) => {
        const nutrient = nutrients.find(n => n.nutrientId === nutrientId);
        return nutrient ? nutrient.value : 0;
    };

    // USDA Nutrient IDs
    const ENERGY_KCAL = 1008;      // Calories
    const PROTEIN = 1003;          // Protein (g)
    const CARBS = 1005;            // Carbohydrates (g)
    const FAT = 1004;              // Total fat (g)
    const FIBER = 1079;            // Fiber (g)
    const SUGAR = 2000;            // Sugars (g)
    const SODIUM = 1093;           // Sodium (mg)

    // Determine category based on food category or data type
    let category = 'other';
    const foodCategory = (usdaFood.foodCategory || '').toLowerCase();
    const description = (usdaFood.description || '').toLowerCase();

    if (foodCategory.includes('fruit') || description.includes('fruit')) {
        category = 'fruits';
    } else if (foodCategory.includes('vegetable') || description.includes('vegetable')) {
        category = 'vegetables';
    } else if (foodCategory.includes('protein') || foodCategory.includes('meat') ||
        foodCategory.includes('poultry') || foodCategory.includes('fish') ||
        description.includes('chicken') || description.includes('beef') ||
        description.includes('fish')) {
        category = 'proteins';
    } else if (foodCategory.includes('grain') || foodCategory.includes('cereal') ||
        description.includes('bread') || description.includes('rice')) {
        category = 'grains';
    } else if (foodCategory.includes('dairy') || description.includes('milk') ||
        description.includes('cheese') || description.includes('yogurt')) {
        category = 'dairy';
    } else if (foodCategory.includes('nut') || foodCategory.includes('seed')) {
        category = 'nuts';
    } else if (foodCategory.includes('beverage') || description.includes('drink')) {
        category = 'beverages';
    }

    // Determine serving size
    let serving = '100g';
    if (usdaFood.servingSize && usdaFood.servingSizeUnit) {
        serving = `${usdaFood.servingSize}${usdaFood.servingSizeUnit}`;
    } else if (usdaFood.householdServingFullText) {
        serving = usdaFood.householdServingFullText;
    }

    return {
        id: `usda-${usdaFood.fdcId}`,
        fdcId: usdaFood.fdcId,
        name: usdaFood.description || 'Unknown Food',
        brandName: usdaFood.brandName || usdaFood.brandOwner || null,
        category: category,
        serving: serving,
        calories: Math.round(getNutrient(ENERGY_KCAL)),
        protein: Math.round(getNutrient(PROTEIN) * 10) / 10,
        carbs: Math.round(getNutrient(CARBS) * 10) / 10,
        fats: Math.round(getNutrient(FAT) * 10) / 10,
        fiber: Math.round(getNutrient(FIBER) * 10) / 10,
        sugar: Math.round(getNutrient(SUGAR) * 10) / 10,
        sodium: Math.round(getNutrient(SODIUM)),
        dataType: usdaFood.dataType,
        source: 'USDA',
    };
};

/**
 * Get autocomplete suggestions
 * @param {string} query - Search term
 * @returns {Promise<Array>} Array of food names
 */
export const getAutocompleteSuggestions = async (query) => {
    if (!query || query.trim().length < 2) {
        return [];
    }

    try {
        const foods = await searchUSDAFoods(query, 10, 1);
        return foods.map(food => ({
            name: food.name,
            brandName: food.brandName,
            fdcId: food.fdcId,
        }));
    } catch (error) {
        console.error('Error getting autocomplete suggestions:', error);
        return [];
    }
};

/**
 * Clear search cache
 */
export const clearSearchCache = () => {
    searchCache.clear();
};

/**
 * Check if using demo API key
 */
export const isUsingDemoKey = () => {
    return USDA_API_KEY === 'DEMO_KEY';
};
