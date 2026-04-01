-- 001_initial_schema.sql
-- Run this in your Supabase SQL Editor to set up the Digital Staff's Brain

-- Extended user profiles including phone for Twilio outreach
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY, -- links to auth.users
    display_name TEXT NOT NULL,
    phone_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Health Metrics (The Coach monitors this)
CREATE TABLE IF NOT EXISTS public.user_metrics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    calories_logged INTEGER DEFAULT 0,
    water_intake_oz INTEGER DEFAULT 0,
    workout_minutes INTEGER DEFAULT 0,
    missed_day BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Spiritual Logs / Community Posts (The Shepherd and Watchman monitor this)
CREATE TABLE IF NOT EXISTS public.spiritual_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'prayer_request', 'scripture_share', 'encouragement'
    content TEXT NOT NULL,
    is_public BOOLEAN DEFAULT true,
    flagged_by_watchman BOOLEAN DEFAULT false, -- For Watchman moderation
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Agent Ledger (Event sourcing for multi-agent workflows)
CREATE TABLE IF NOT EXISTS public.agent_ledger (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_type TEXT NOT NULL, -- e.g., 'COACH_ESCALATION', 'PRAYER_RECEIVED', 'TOXICITY_DETECTED'
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    payload JSONB NOT NULL,
    processed BOOLEAN DEFAULT false,
    processed_by TEXT, -- Which agent picked it up (e.g., 'SHEPHERD')
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE
);

-- Scheduled Directives (The Scribe reads this to automate series)
CREATE TABLE IF NOT EXISTS public.scheduled_directives (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    theme TEXT NOT NULL,
    activation_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Realtime triggers (Watchman / Orchestrator will listen to these inserts)
alter publication supabase_realtime add table public.agent_ledger;
alter publication supabase_realtime add table public.spiritual_logs;
