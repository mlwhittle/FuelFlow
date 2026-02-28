import { searchFoods as searchLocalFoods, getFoodById as getLocalFoodById } from '../data/foodDatabase';
import { searchUSDAFoods, getFoodDetails, isUsingDemoKey } from '../services/usdaApi';

/**
 * Unified food search that combines local database and USDA API
 * @param {string} query - Search term
 * @param {string} category - Category filter
 * @param {boolean} useAPI - Whether to include USDA API results
 * @returns {Promise<Array>} Combined search results
 */
export const searchAllFoods = async (query, category = 'all', useAPI = true) => {
    // Always search local database first
    const localResults = searchLocalFoods(query, category);

    // If not using API or query is too short, return local results only
    if (!useAPI || !query || query.trim().length < 2) {
        return localResults;
    }

    try {
        // Search USDA API
        const usdaResults = await searchUSDAFoods(query, 30, 1);

        // Filter USDA results by category if needed
        let filteredUSDA = usdaResults;
        if (category !== 'all') {
            filteredUSDA = usdaResults.filter(food => food.category === category);
        }

        // Combine results: local first, then USDA
        // Remove duplicates based on name similarity
        const combined = [...localResults];
        const localNames = new Set(localResults.map(f => f.name.toLowerCase()));

        filteredUSDA.forEach(usdaFood => {
            const nameLower = usdaFood.name.toLowerCase();
            // Only add if not similar to existing local food
            if (!localNames.has(nameLower)) {
                combined.push(usdaFood);
            }
        });

        return combined;
    } catch (error) {
        console.error('Error searching USDA API:', error);
        // Fallback to local results if API fails
        return localResults;
    }
};

/**
 * Get food by ID (supports both local and USDA foods)
 * @param {string|number} id - Food ID
 * @returns {Promise<Object|null>} Food object or null
 */
export const getFoodById = async (id) => {
    // Check if it's a USDA food
    if (typeof id === 'string' && id.startsWith('usda-')) {
        const fdcId = parseInt(id.replace('usda-', ''));
        return await getFoodDetails(fdcId);
    }

    // Otherwise, search local database
    return getLocalFoodById(id);
};

/**
 * Check if enhanced search is available
 * @returns {boolean}
 */
export const isEnhancedSearchAvailable = () => {
    return !isUsingDemoKey();
};
