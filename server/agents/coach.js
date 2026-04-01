export const handleCoachTask = async (metricsRecord, supabase) => {
    console.log('💪 [The Coach] Reviewing physical metrics...');

    const userId = metricsRecord.user_id;

    // Check for 3 days of missed logs
    const { data: recentLogs, error } = await supabase
        .from('user_metrics')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(3);

    if (error) {
        console.error('[The Coach] Error fetching metrics:', error);
        return;
    }

    const missedDaysCount = recentLogs?.filter(log => log.missed_day || log.calories_logged === 0).length || 0;

    if (missedDaysCount >= 3) {
        console.log(`[The Coach] ⚠️ User ${userId} has missed 3 days of logging.`);
        console.log('[The Coach] Pinging The Shepherd for spiritual backup. Inserting event into ledger.');

        // The "Recovery" Scenario Workflow
        // Instead of shaming the user, Coach asks Shepherd to check spiritual pulse
        await supabase.from('agent_ledger').insert({
            event_type: 'COACH_ESCALATION',
            user_id: userId,
            payload: {
                reason: 'Missed 3 days of physical logging',
                action_requested: 'Check spiritual pulse'
            }
        });
    } else {
        console.log(`[The Coach] User ${userId} is on track. Giving a high-five!`);
        // We could insert an encouragement push notification here
    }

    console.log('💪 [The Coach] Task complete.');
};
