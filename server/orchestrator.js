import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Import our Digital Staff (Agents)
import { handleShepherdTask } from './agents/shepherd.js';
import { handleCoachTask } from './agents/coach.js';
import { handleWatchmanTask } from './agents/watchman.js';
import { handleScribeTask } from './agents/scribe.js';
import { handleClerkTask } from './agents/clerk.js';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;
const supabase = createClient(
  process.env.SUPABASE_URL || 'http://localhost:54321', 
  process.env.SUPABASE_ANON_KEY || 'dummy_key'
);

console.log('🔥 Initializing Whittle Vitalio Digital Staff Orchestrator...');

/**
 * The unified Webhook endpoint for all Supabase Database Triggers.
 * This is the "brain" routing events to the correct "staff member".
 */
app.post('/webhook/supabase', async (req, res) => {
    const { type, table, record, old_record } = req.body;
    console.log(`[Orchestrator] Received event: ${type} on ${table}`);

    try {
        // 1. New Community Post -> Wake up Watchman
        if (table === 'spiritual_logs' && type === 'INSERT') {
            await handleWatchmanTask(record, supabase);
            
            // If it's a prayer request, ping the Shepherd
            if (record.type === 'prayer_request') {
                await handleShepherdTask(record, supabase);
            }
        }

        // 2. Health Metrics Update -> Wake up Coach
        if (table === 'user_metrics' && (type === 'INSERT' || type === 'UPDATE')) {
            await handleCoachTask(record, supabase);
        }

        // 3. Command Line Directives -> Wake up Scribe or Clerk
        if (table === 'agent_ledger' && type === 'INSERT') {
            const eventType = record.event_type;
            
            if (eventType === 'COACH_ESCALATION') {
                // Coach asked Shepherd for help ("The Recovery Scenario")
                await handleShepherdTask({ ...record, isEscalation: true }, supabase);
            } else if (eventType === 'GLOBAL_DIRECTIVE') {
                // Pastor Mel sent a global command
                await handleScribeTask(record.payload, supabase);
            } else if (eventType === 'SUPPORT_TICKET') {
                await handleClerkTask(record, supabase);
            }
            
            // Mark ledger processed
            await supabase.from('agent_ledger').update({ processed: true, processed_at: new Date() }).eq('id', record.id);
        }

        res.status(200).json({ status: 'Orchestrated successfully' });
    } catch (error) {
        console.error('[Orchestrator] Error delegating task:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Orchestrator running on port ${PORT}`);
    console.log(`👩‍💼 Digital Staff is online and awaiting events.`);
});
