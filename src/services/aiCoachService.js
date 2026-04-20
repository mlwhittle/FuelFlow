/**
 * aiCoachService.js
 * 
 * Handles bidirectional communication with the LLM provider (OpenAI by default).
 * Safely injects the user's tracked biometric data into the context window.
 */

// We look for a Vite environment variable. In production, this should ideally be 
// routed through a secure backend (like Firebase Functions or Supabase Edge) 
// to prevent API key scraping, but for the MVP / Beta, client-side is acceptable.
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export const generateCoachResponse = async (userQuery, chatHistory, userContext) => {
    // 1. If no API key is set yet, we fall back to the intelligent local simulation
    if (!OPENAI_API_KEY) {
        console.warn("No VITE_OPENAI_API_KEY found in .env file. Falling back to local simulation.");
        return simulateResponse(userQuery, userContext);
    }

    try {
        // 2. Construct the Agentic Context (The "System Prompt")
        const systemPrompt = `You are the Whittle Vitalio Adaptive Coach, a world-class AI fitness and spiritual mentor working within a "Clinical Luxury" health sanctuary app. 
You must analyze the user's real-time biometric data and provide highly specific, mathematically sound, and encouraging guidance.

CURRENT USER DATA LOGGED:
- Primary Goal: ${userContext.goal || 'General Health'}
- Average Calories Logged: ${userContext.avgCalories || 0} kcal/day
- Average Protein Logged: ${userContext.avgProtein || 0}g/day
- Target Daily Calories: ${userContext.targetCalories || 2000} kcal/day
- Target Daily Protein: ${userContext.targetProtein || 150}g/day
- Recent Weight Trend: ${userContext.weightTrend !== null ? userContext.weightTrend + ' kg/week' : 'Not enough data'}

INSTRUCTIONS:
1. Answer their specific question directly.
2. If applicable, mathematically reference their CURRENT USER DATA LOGGED (e.g., "I see you are only averaging 80g of protein...") to prove you are analyzing their unique logs.
3. Keep it concise. Max 3-4 short sentences.
4. Tone: Elite, empathetic, medical-grade, and deeply motivational.`;

        // 3. Format the chat history for the LLM
        const openAiMessages = [
            { role: 'system', content: systemPrompt }
        ];

        // Format the previous conversation logs (exclude the initial greeting if needed, or keep it)
        chatHistory.forEach(msg => {
             // ensure we only pass user or assistant roles
             if (msg.role === 'user' || msg.role === 'assistant') {
                 openAiMessages.push({ role: msg.role, content: msg.text });
             }
        });

        // Add the new query
        openAiMessages.push({ role: 'user', content: userQuery });

        // 4. Execute the Network Request
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: openAiMessages,
                max_tokens: 200,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`OpenAI API Error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;

    } catch (error) {
        console.error("AI Coach Generation Failed:", error);
        return "I'm experiencing a high volume of requests on the server right now! " + await simulateResponse(userQuery, userContext);
    }
};

// Fallback logic so the app never breaks if keys aren't configured yet.
const simulateResponse = (userQuery, userContext) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            let reply = "That's a great question. Based on your current data, ";
            const lowerCaseText = userQuery.toLowerCase();
            
            if (lowerCaseText.includes('protein') || lowerCaseText.includes('meat')) {
                reply += `you are currently averaging ${userContext.avgProtein || 0}g of protein a day. To boost this, I highly suggest adding a whey isolate shake or 1 cup of Greek yogurt to comfortably hit your ${userContext.targetProtein || 150}g goal!`;
            } else if (lowerCaseText.includes('tired') || lowerCaseText.includes('energy') || lowerCaseText.includes('sleep')) {
                reply += `your calories might be dipping too low on training days. Ensure you are getting complex carbohydrates like oatmeal 2 hours before your workout.`;
            } else if (lowerCaseText.includes('sugar') || lowerCaseText.includes('sweet') || lowerCaseText.includes('craving')) {
                reply += `cravings often indicate a lack of micronutrients or extreme calorie deficits. Try bumping your daily calories up by 100-200 utilizing fruit to satiate the sweet tooth naturally.`;
            } else if (lowerCaseText.includes('fasting') || lowerCaseText.includes('window')) {
                reply += `intermittent fasting is a tool for calorie control. A 16:8 fasting window is perfectly optimal for your goals.`;
            } else {
                reply = "I'm analyzing your macros to determine the best approach. Prioritize protein at every meal, stay hydrated, and ensure you log your meals consistently so I can give you pinpoint accuracy!";
            }
            resolve(reply);
        }, 1200);
    });
};
