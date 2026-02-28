// Barcode Scanning + Open Food Facts API Service

const OPENFOODFACTS_API = 'https://world.openfoodfacts.org/api/v2/product';

/**
 * Look up a product by barcode using Open Food Facts API
 * @param {string} barcode - Product barcode (EAN, UPC, etc.)
 * @returns {Promise<Object|null>} Product nutritional data or null
 */
export const lookupBarcode = async (barcode) => {
    try {
        const response = await fetch(`${OPENFOODFACTS_API}/${barcode}.json`, {
            headers: {
                'User-Agent': 'FuelFlow/1.0 (nutrition tracking app)'
            }
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();

        if (data.status !== 1 || !data.product) {
            return null;
        }

        return transformOpenFoodFactsProduct(data.product);
    } catch (error) {
        console.error('Barcode lookup error:', error);
        return null;
    }
};

/**
 * Transform Open Food Facts product data to our app format
 */
const transformOpenFoodFactsProduct = (product) => {
    const nutriments = product.nutriments || {};

    // Get per serving or per 100g values
    const servingSize = product.serving_size || '100g';
    const hasServingData = nutriments['energy-kcal_serving'] != null;

    const calories = hasServingData
        ? Math.round(nutriments['energy-kcal_serving'] || 0)
        : Math.round(nutriments['energy-kcal_100g'] || 0);

    const protein = hasServingData
        ? Math.round((nutriments.proteins_serving || 0) * 10) / 10
        : Math.round((nutriments.proteins_100g || 0) * 10) / 10;

    const carbs = hasServingData
        ? Math.round((nutriments.carbohydrates_serving || 0) * 10) / 10
        : Math.round((nutriments.carbohydrates_100g || 0) * 10) / 10;

    const fats = hasServingData
        ? Math.round((nutriments.fat_serving || 0) * 10) / 10
        : Math.round((nutriments.fat_100g || 0) * 10) / 10;

    const fiber = hasServingData
        ? Math.round((nutriments.fiber_serving || 0) * 10) / 10
        : Math.round((nutriments.fiber_100g || 0) * 10) / 10;

    const sodium = hasServingData
        ? Math.round(nutriments.sodium_serving || 0)
        : Math.round(nutriments.sodium_100g || 0);

    const sugar = hasServingData
        ? Math.round((nutriments.sugars_serving || 0) * 10) / 10
        : Math.round((nutriments.sugars_100g || 0) * 10) / 10;

    return {
        id: `barcode-${product.code}`,
        barcode: product.code,
        name: product.product_name || product.product_name_en || 'Unknown Product',
        brandName: product.brands || null,
        category: mapCategory(product.categories_tags || []),
        serving: hasServingData ? servingSize : '100g',
        calories,
        protein,
        carbs,
        fats,
        fiber,
        sodium,
        sugar,
        imageUrl: product.image_front_small_url || product.image_url || null,
        nutriScore: product.nutriscore_grade || null,
        source: 'OpenFoodFacts'
    };
};

/**
 * Map Open Food Facts categories to our app categories
 */
const mapCategory = (categoryTags) => {
    const tags = categoryTags.join(' ').toLowerCase();
    if (tags.includes('fruit')) return 'fruits';
    if (tags.includes('vegetable')) return 'vegetables';
    if (tags.includes('meat') || tags.includes('poultry') || tags.includes('fish') || tags.includes('protein')) return 'proteins';
    if (tags.includes('grain') || tags.includes('cereal') || tags.includes('bread')) return 'grains';
    if (tags.includes('dairy') || tags.includes('milk') || tags.includes('cheese')) return 'dairy';
    if (tags.includes('nut') || tags.includes('seed')) return 'nuts';
    if (tags.includes('beverage') || tags.includes('drink') || tags.includes('juice')) return 'beverages';
    return 'other';
};
