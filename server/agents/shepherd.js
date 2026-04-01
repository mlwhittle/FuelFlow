import { Resend } from 'resend';

// Note: Ensure RESEND_API_KEY is in .env
const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy');

export const handleShepherdTask = async (record, supabase) => {
    console.log('🙏 [The Shepherd] Analyzing prayer request or escalation...');

    // Scenario A: Coach escalated a user ("The Recovery Scenario")
    if (record.isEscalation) {
        const userId = record.user_id;
        console.log(`[The Shepherd] Received escalation from The Coach for User ${userId}.`);

        // Check recent prayer requests for context
        const { data: prayers } = await supabase
            .from('spiritual_logs')
            .select('content')
            .eq('user_id', userId)
            .eq('type', 'prayer_request')
            .order('created_at', { ascending: false })
            .limit(1);

        let contextualMessage = "I noticed you haven't logged meals recently. Is everything okay? 'The Lord is the strength of my life.'";

        if (prayers && prayers.length > 0) {
            const lastPrayer = prayers[0].content;
            console.log(`[The Shepherd] Found recent prayer context: "${lastPrayer}"`);
            
            // In a real ADK setup, this is passed to an LLM to generate the perfect response.
            // For now, we simulate finding "sick relative" in the prayer.
            if (lastPrayer.toLowerCase().includes('sick')) {
                contextualMessage = `I know your heart is heavy with family right now. Don't forget to fuel your own temple so you have the strength to care for them. 'The Lord is the strength of my life.' How can I pray for you today?`;
            }
        }

        console.log(`[The Shepherd] Drafting message: "${contextualMessage}"`);
        
        // Trigger Resend Email if user is in crisis to keep costs down compared to calls
        if (record.payload?.crisis_level === 'HIGH') {
            console.log(`[The Shepherd] 🚨 CRISIS DETECTED. Sending care email via Resend...`);
            /*
            await resend.emails.send({
                from: 'care@fuelflow.app',
                to: 'user@example.com', // Would pull from user_profiles in production
                subject: 'Checking in on you - Pastor Mel',
                html: '<p>Hello, this is The Shepherd from FuelFlow. We saw your prayer request and Pastor Mel wanted to send some extra encouragement your way. Call our support line if you need immediate prayer.</p>'
            });
            */
        }
    } 
    // Scenario B: Standard Prayer Request Received
    else if (record.type === 'prayer_request') {
        console.log(`[The Shepherd] Reading new prayer request: "${record.content}"`);
        // AI Logic: Detect emotional weight, extract themes
        // Action: Save tailored response to DB for user to see when they open app
        await supabase.from('spiritual_logs').insert({
            user_id: record.user_id,
            type: 'encouragement',
            content: `I am praying with you about this. 'Cast all your anxiety on Him because He cares for you.' (1 Peter 5:7)`,
            is_public: false
        });
    }

    console.log('🙏 [The Shepherd] Task complete.');
};
