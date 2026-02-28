// AI-Powered Food Photo Recognition Service
// Uses Google Gemini Vision API for real food identification

import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI = null;
let model = null;

/**
 * Get or set the Gemini API key
 */
export const getGeminiApiKey = () => {
    return localStorage.getItem('fuelflow_gemini_key') || '';
};

export const setGeminiApiKey = (key) => {
    localStorage.setItem('fuelflow_gemini_key', key);
    // Reset model so it picks up the new key
    genAI = null;
    model = null;
};

export const hasGeminiApiKey = () => {
    return !!getGeminiApiKey();
};

const getModel = () => {
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
        throw new Error('NO_API_KEY');
    }
    if (!model) {
        genAI = new GoogleGenerativeAI(apiKey);
        model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    }
    return model;
};

/**
 * Convert an image file to base64 for Gemini API
 */
const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

/**
 * Analyze a food photo using Gemini Vision API
 * Sends the actual image to Gemini for real food recognition
 * 
 * @param {File|Blob} imageFile - The image file to analyze
 * @returns {Promise<Array>} Array of detected food items with nutrition
 */
export const analyzePhotoAI = async (imageFile) => {
    const visionModel = getModel();
    const base64Data = await fileToBase64(imageFile);

    const prompt = `You are a nutrition expert. Analyze this food photo and identify ALL food items visible.

For EACH food item, provide:
- name: Common food name
- calories: Estimated calories per serving
- protein: Grams of protein per serving
- carbs: Grams of carbs per serving
- fats: Grams of fat per serving
- serving: Serving size description (e.g., "1 cup", "1 medium", "3 oz")
- confidence: Your confidence 0.0-1.0 in the identification

Respond ONLY with valid JSON in this exact format, no other text:
{
  "foods": [
    {
      "name": "Grilled Chicken Breast",
      "calories": 165,
      "protein": 31,
      "carbs": 0,
      "fats": 3.6,
      "serving": "3 oz",
      "confidence": 0.95
    }
  ]
}

If you cannot identify any food items, return: {"foods": []}
Be realistic with nutritional estimates. Use USDA standard values when possible.`;

    const result = await visionModel.generateContent([
        prompt,
        {
            inlineData: {
                mimeType: imageFile.type || 'image/jpeg',
                data: base64Data
            }
        }
    ]);

    const response = result.response;
    const text = response.text();

    // Parse the JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        console.error('No JSON found in Gemini response:', text);
        return [];
    }

    const parsed = JSON.parse(jsonMatch[0]);
    if (!parsed.foods || !Array.isArray(parsed.foods)) {
        return [];
    }

    // Format the results
    return parsed.foods.map((food, index) => ({
        id: `ai-${Date.now()}-${index}`,
        name: food.name,
        calories: Math.round(food.calories) || 0,
        protein: Math.round(food.protein * 10) / 10 || 0,
        carbs: Math.round(food.carbs * 10) / 10 || 0,
        fats: Math.round(food.fats * 10) / 10 || 0,
        serving: food.serving || '1 serving',
        confidence: Math.round((food.confidence || 0.8) * 100),
        source: 'Gemini Vision AI'
    }));
};

/**
 * Search for a food item by name (for adjustments after AI detection)
 */
export const searchFoodByName = async (query) => {
    const { searchAllFoods } = await import('./foodService');
    return searchAllFoods(query, 'all', true);
};
