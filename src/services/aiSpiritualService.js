// aiSpiritualService.js
// This service simulates the integration of Gemini and Claude AI for FuelFlow's "Daily Bread" Engine.
// It implements the "Pastor Mel" persona: 40 years of experience, focus on hope/restoration, body as a temple, KJV/NKJV routing.

const PASTOR_MEL_PROMPT = `
You are Pastor Mel, a mentor and pastor with 40 years of experience. 
Speak with a tone of hope, restoration, and treat the body as a temple. 
Use King James (KJV) or New King James Version (NKJV) for all scriptures.
`;

// Simulated database of contextual scriptures and pastoral advice
const MOCK_SPIRITUAL_DB = {
    fasting: {
        scripture: "Moreover, when you fast, do not be like the hypocrites, with a sad countenance... (Matthew 6:16, NKJV)",
        message: "Your discipline today is a beautiful sacrifice. Remember, we empty ourselves physically so we can be filled spiritually. Stay strong, child—your body is a temple, and you are honoring it well today."
    },
    consistent_eating: {
        scripture: "Whether therefore ye eat, or drink, or whatsoever ye do, do all to the glory of God. (1 Corinthians 10:31, KJV)",
        message: "I see your consistency! You've been making wonderful choices. Stewardship isn't just about our finances; it's about how we care for the vessel God gave us. Keep up the glorious work."
    },
    resting: {
        scripture: "But those who wait on the Lord Shall renew their strength... (Isaiah 40:31, NKJV)",
        message: "Rest is not a weakness; it is a holy pause. Even the Lord rested on the seventh day. Allow your temple to recover so you can run and not grow weary tomorrow."
    },
    struggling: {
        scripture: "My grace is sufficient for thee: for my strength is made perfect in weakness. (2 Corinthians 12:9, KJV)",
        message: "Having a tough day with those cravings? Give yourself some grace. We all stumble, but the Lord’s mercies are new every morning. Dust yourself off and let's try again."
    },
    general: [
        {
            scripture: "Or do you not know that your body is the temple of the Holy Spirit who is in you, whom you have from God, and you are not your own? (1 Corinthians 6:19, NKJV)",
            message: "Welcome back to your Sanctuary. As you plan your meals and activities today, remember you are caring for the dwelling place of the Holy Spirit."
        },
        {
            scripture: "I beseech you therefore, brethren, by the mercies of God, that you present your bodies a living sacrifice, holy, acceptable to God... (Romans 12:1, NKJV)",
            message: "Reflect on this today: every healthy choice you make is an act of worship. Let's make today wonderfully acceptable."
        },
        {
            scripture: "Beloved, I pray that you may prosper in all things and be in health, just as your soul prospers. (3 John 1:2, NKJV)",
            message: "God cares about your physical health just as much as your spiritual health. Keep pushing forward—you are doing amazing."
        },
        {
            scripture: "He gives power to the weak, And to those who have no might He increases strength. (Isaiah 40:29, NKJV)",
            message: "Feeling tired today? Lean on Him for the energy to finish your workout or prepare that healthy meal."
        }
    ]
};

/**
 * Simulates calling Claude 4.6 for precise dietary logic / state analysis.
 * In a real backend, this would pass the user's data to Claude to determine the context.
 */
const determineUserStateContexWithClaude = (user, todayData, daysConsistent) => {
    // Claude Logic: analyze recent logs and macros to determine emotional/physical state
    if (todayData.foodLogs.length === 0 && new Date().getHours() > 14) {
        return 'fasting';
    }
    if (daysConsistent >= 3) {
        return 'consistent_eating';
    }
    if (todayData.exerciseLogs.length === 0 && todayData.waterIntake < Math.round((user.weight * 2.20462) * 0.2)) {
         // low activity / low water might mean resting or struggling
         const hr = new Date().getHours();
         if (hr > 18) return 'resting';
         return 'general';
    }
    return 'general';
};

/**
 * Simulates calling Gemini 3 Pro to generate dynamic inspirational content.
 * Gemini uses the determined context to curate the perfect Pastor Mel output.
 */
const generateInspirationWithGemini = async (context) => {
    // In production, send PASTOR_MEL_PROMPT + context to Gemini API
    return new Promise((resolve) => {
        setTimeout(() => {
            const data = MOCK_SPIRITUAL_DB[context] || MOCK_SPIRITUAL_DB['general'];
            if (Array.isArray(data)) {
                // Return a random verse from the array so the scripture changes every time
                resolve(data[Math.floor(Math.random() * data.length)]);
            } else {
                resolve(data);
            }
        }, 800); // simulate network latency
    });
};

export const getDailyBread = async (user, todayData, daysConsistent = 0) => {
    try {
        // ENTERPRISE BACKEND ROUTING: Whittle Media OS Integration
        const wmOsEndpoint = import.meta.env.VITE_WM_OS_AI_ENDPOINT;
        
        if (wmOsEndpoint) {
            console.log("Routing Request to Whittle Media OS Central AI Pipeline...");
            const response = await fetch(wmOsEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user?.uid,
                    todayData,
                    daysConsistent,
                    persona: 'PASTOR_MEL'
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                return data.payload; // WM-OS returns the { scripture, message }
            }
        }

        // FALLBACK: Local Sandbox Simulation (If WM-OS isn't configured)
        const context = determineUserStateContexWithClaude(user, todayData, daysConsistent);
        const response = await generateInspirationWithGemini(context);
        
        return response;
    } catch (error) {
        console.error("AI Spiritual Service Error:", error);
        return MOCK_SPIRITUAL_DB['general'][0];
    }
};

/**
 * Scans a public prayer request for critical distress signals.
 * Returns true if the prayer contains urgent pastoral triggers.
 */
export const containsUrgentCrisis = (text) => {
    if (!text) return false;
    const lowerText = text.toLowerCase();
    
    // High-risk keywords signaling severe distress that require immediate pastoral intervention
    const crisisKeywords = [
        'suicide', 'kill myself', 'end it all', 'end my life', 
        'give up living', 'physical abuse', 'hit me', 'no reason to live',
        'harm myself', 'cut myself', 'can\'t take it anymore',
        'don\'t want to be here', 'giving up on life'
    ];
    
    return crisisKeywords.some(keyword => lowerText.includes(keyword));
};
