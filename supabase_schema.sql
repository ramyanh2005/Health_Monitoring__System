-- ============================================================================
-- VITALITY: SENIOR WELLNESS COMPANION — SUPABASE DATABASE SCHEMA
-- Run this complete script in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (Senior Member Profile & Medical ID)
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY DEFAULT 'member-1',
    name TEXT NOT NULL DEFAULT 'Margaret Thompson',
    age INTEGER DEFAULT 72,
    tier TEXT DEFAULT 'Senior Member',
    avatar TEXT DEFAULT 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250',
    doctor TEXT DEFAULT 'Dr. Elizabeth Vance, MD (Geriatric Wellness)',
    primary_clinic TEXT DEFAULT 'Evergreen Community Health',
    medical_conditions TEXT[] DEFAULT ARRAY['Mild Hypertension', 'Knee Osteoarthritis'],
    allergies TEXT[] DEFAULT ARRAY['Penicillin', 'Sulfa drugs'],
    blood_type TEXT DEFAULT 'A+',
    emergency_contact JSONB DEFAULT '{"name": "Sarah Miller", "relation": "Daughter", "phone": "(555) 382-9912", "altPhone": "(555) 714-2200", "notifyOnSOS": true}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Daily Goals Table (Steps, Water, Calorie Burn, Active Minutes)
CREATE TABLE IF NOT EXISTS public.daily_goals (
    id TEXT PRIMARY KEY DEFAULT 'goals-1',
    user_id TEXT DEFAULT 'member-1',
    date DATE DEFAULT CURRENT_DATE,
    steps_goal INTEGER DEFAULT 6000,
    steps_current INTEGER DEFAULT 4250,
    calories_burn_goal INTEGER DEFAULT 450,
    calories_burn_current INTEGER DEFAULT 310,
    water_glasses_goal INTEGER DEFAULT 8,
    water_glasses_current INTEGER DEFAULT 5,
    active_minutes_goal INTEGER DEFAULT 30,
    active_minutes_current INTEGER DEFAULT 18,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Meals Table (Plate Scans, Logged Nutrition & Full Recipes)
CREATE TABLE IF NOT EXISTS public.meals (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT DEFAULT 'member-1',
    type TEXT NOT NULL, -- Breakfast, Lunch, Dinner, Snack
    time TEXT,
    title TEXT NOT NULL,
    description TEXT,
    calories INTEGER DEFAULT 0,
    protein INTEGER DEFAULT 0,
    carbs INTEGER DEFAULT 0,
    fat INTEGER DEFAULT 0,
    fiber INTEGER DEFAULT 0,
    image TEXT,
    recipe JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Exercises Table (Senior Curated & Catalog Routines)
CREATE TABLE IF NOT EXISTS public.exercises (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    duration INTEGER NOT NULL, -- in minutes
    difficulty TEXT NOT NULL, -- Gentle, Moderate
    difficulty_level TEXT DEFAULT 'easy',
    calories_burn INTEGER DEFAULT 50,
    is_suggested BOOLEAN DEFAULT true,
    image TEXT,
    benefits TEXT,
    safety_tip TEXT,
    steps JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Medications Table (Daily Prescriptions & Schedule)
CREATE TABLE IF NOT EXISTS public.medications (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT DEFAULT 'member-1',
    name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    time TEXT NOT NULL,
    slot TEXT NOT NULL, -- Morning, Afternoon, Evening, Bedtime
    purpose TEXT,
    instructions TEXT,
    taken BOOLEAN DEFAULT false,
    refill_days_left INTEGER DEFAULT 30,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Vitals Logs Table (Heart Rate Pulse, Blood Pressure, SpO2)
CREATE TABLE IF NOT EXISTS public.vitals_logs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT DEFAULT 'member-1',
    heart_rate INTEGER DEFAULT 72,
    blood_pressure TEXT DEFAULT '122/78',
    spo2 INTEGER DEFAULT 98,
    status TEXT DEFAULT 'Optimal',
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Milestones Table (Achievements & Streaks)
CREATE TABLE IF NOT EXISTS public.milestones (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT DEFAULT 'member-1',
    title TEXT NOT NULL,
    "desc" TEXT,
    date TEXT,
    category TEXT,
    icon TEXT,
    achieved BOOLEAN DEFAULT true,
    reward_text TEXT
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Enable easy read/write access for application users
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vitals_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Public access profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public access daily_goals" ON public.daily_goals;
DROP POLICY IF EXISTS "Public access meals" ON public.meals;
DROP POLICY IF EXISTS "Public access exercises" ON public.exercises;
DROP POLICY IF EXISTS "Public access medications" ON public.medications;
DROP POLICY IF EXISTS "Public access vitals_logs" ON public.vitals_logs;
DROP POLICY IF EXISTS "Public access milestones" ON public.milestones;

-- Create open access policies for web app operations
CREATE POLICY "Public access profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access daily_goals" ON public.daily_goals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access meals" ON public.meals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access exercises" ON public.exercises FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access medications" ON public.medications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access vitals_logs" ON public.vitals_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access milestones" ON public.milestones FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- INITIAL SEED DATA POPULATION
-- ============================================================================

-- Insert Member Profile
INSERT INTO public.profiles (id, name, age, tier, doctor, emergency_contact)
VALUES (
    'member-1',
    'Margaret Thompson',
    72,
    'Senior Member',
    'Dr. Elizabeth Vance, MD (Geriatric Wellness)',
    '{"name": "Sarah Miller", "relation": "Daughter", "phone": "(555) 382-9912", "altPhone": "(555) 714-2200", "notifyOnSOS": true}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Insert Initial Daily Goals
INSERT INTO public.daily_goals (id, user_id, steps_goal, steps_current, calories_burn_goal, calories_burn_current, water_glasses_goal, water_glasses_current, active_minutes_goal, active_minutes_current)
VALUES (
    'goals-1',
    'member-1',
    6000,
    4250,
    450,
    310,
    8,
    5,
    30,
    18
) ON CONFLICT (id) DO NOTHING;

-- Insert Initial Meals
INSERT INTO public.meals (id, user_id, type, time, title, description, calories, protein, carbs, fat, fiber, image, recipe)
VALUES 
(
    'meal-1',
    'member-1',
    'Breakfast',
    '8:15 AM',
    'Warm Berry Oatmeal & Toasted Walnuts',
    'Steel-cut rolled oats simmered with almond milk, topped with wild blueberries, cinnamon, and omega-rich walnuts.',
    340, 12, 52, 10, 9,
    'https://images.unsplash.com/photo-1584776296944-ab6fb57b0bdd?auto=format&fit=crop&q=80&w=600',
    '{"prepTime": "5 mins", "cookTime": "10 mins", "servings": 1, "seniorBenefits": "High soluble fiber helps maintain healthy cholesterol levels and supports smooth digestion.", "ingredients": ["1/2 cup rolled oats", "1 cup almond milk", "1/2 cup blueberries", "1 tbsp walnuts", "1/4 tsp cinnamon"], "instructions": ["Combine oats and milk in saucepan over medium heat.", "Simmer for 5-7 mins.", "Stir in cinnamon and blueberries.", "Serve warm with walnuts."]}'::jsonb
),
(
    'meal-2',
    'member-1',
    'Lunch',
    '12:45 PM',
    'Mediterranean Salmon & Quinoa Bowl',
    'Pan-seared Alaskan salmon fillet served over fluffy herb quinoa, cucumber, cherry tomatoes, and lemon-tahini dressing.',
    490, 34, 38, 18, 7,
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600',
    '{"prepTime": "10 mins", "cookTime": "12 mins", "servings": 1, "seniorBenefits": "Rich in Omega-3 fatty acids to soothe joint inflammation and nurture cognitive memory.", "ingredients": ["4 oz salmon", "3/4 cup cooked quinoa", "1/2 cup cucumber", "1/2 cup tomatoes", "1 cup spinach", "1 tbsp olive oil"], "instructions": ["Season salmon with lemon and olive oil.", "Sear 4 mins each side.", "Assemble quinoa, spinach, tomatoes, and top with salmon."]}'::jsonb
),
(
    'meal-3',
    'member-1',
    'Dinner',
    '6:15 PM',
    'Hearty Lentil & Garden Vegetable Stew',
    'Slow-simmered brown lentils with sweet carrots, celery, zucchini, and aromatic rosemary in rich vegetable broth.',
    360, 18, 54, 5, 14,
    'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=600',
    '{"prepTime": "15 mins", "cookTime": "30 mins", "servings": 2, "seniorBenefits": "Plant-based potassium and magnesium help naturally regulate blood pressure.", "ingredients": ["1 cup lentils", "2 carrots", "2 celery stalks", "1 zucchini", "3 cups low-sodium broth", "1 sprig rosemary"], "instructions": ["Sauté vegetables in olive oil.", "Add lentils and broth.", "Simmer covered for 25 mins until tender."]}'::jsonb
),
(
    'meal-4',
    'member-1',
    'Snack',
    '3:30 PM',
    'Greek Yogurt with Golden Honey & Almonds',
    'Creamy probiotic Greek yogurt with a drizzle of wildflower honey and lightly toasted sliced almonds.',
    170, 14, 16, 5, 2,
    'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&q=80&w=600',
    '{"prepTime": "3 mins", "cookTime": "0 mins", "servings": 1, "seniorBenefits": "Packed with active live probiotics for digestive comfort and bioavailable calcium for strong bones.", "ingredients": ["3/4 cup Greek yogurt", "1 tsp honey", "1 tbsp sliced almonds", "Pinch of cinnamon"], "instructions": ["Spoon yogurt into bowl.", "Drizzle honey and top with toasted almonds."]}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Insert Initial Medications
INSERT INTO public.medications (id, user_id, name, dosage, time, slot, purpose, instructions, taken, refill_days_left)
VALUES
('med-1', 'member-1', 'Lisinopril', '10 mg (1 tablet)', '8:00 AM', 'Morning', 'Blood Pressure Regulation', 'Take with a full glass of water with breakfast', true, 18),
('med-2', 'member-1', 'Vitamin D3 + Calcium', '2000 IU / 600 mg', '8:00 AM', 'Morning', 'Bone & Joint Strength', 'Take with meal for optimal absorption', true, 45),
('med-3', 'member-1', 'CoQ10 (Ubiquinol)', '100 mg (1 softgel)', '1:00 PM', 'Afternoon', 'Cardiovascular Energy', 'Take after lunch', true, 30),
('med-4', 'member-1', 'Metformin ER', '500 mg (1 tablet)', '6:30 PM', 'Evening', 'Blood Sugar Balance', 'Take with dinner', false, 12),
('med-5', 'member-1', 'Melatonin Gentle Sleep', '3 mg (1 gummy)', '9:30 PM', 'Bedtime', 'Restful Night Sleep', 'Take 30 minutes before sleep', false, 22)
ON CONFLICT (id) DO NOTHING;

-- Insert Initial Vitals Log
INSERT INTO public.vitals_logs (user_id, heart_rate, blood_pressure, spo2, status)
VALUES ('member-1', 72, '122/78', 98, 'Optimal');

-- Insert Initial Milestones
INSERT INTO public.milestones (id, user_id, title, "desc", date, category, icon, achieved, reward_text)
VALUES
('ms-1', 'member-1', '7-Day Step Streak', 'Achieved daily walking goal 7 days in a row!', 'August 24, 2026', 'Steps', 'Footprints', true, 'Gold Walking Star'),
('ms-2', 'member-1', 'Hydration Champion', 'Drank all 8 glasses of water for 5 consecutive days.', 'August 22, 2026', 'Hydration', 'Droplets', true, 'Blue Water Drop'),
('ms-3', 'member-1', 'Gentle Yogi Master', 'Completed 10 Chair Yoga and mobility sessions this month.', 'August 19, 2026', 'Exercise', 'Sparkles', true, 'Silver Lotus'),
('ms-4', 'member-1', 'Nutrition Explorer', 'Logged 20 colorful, balanced home-cooked meals with photos.', 'August 15, 2026', 'Nutrition', 'Utensils', true, 'Golden Plate'),
('ms-5', 'member-1', '30-Day Vitality Hero', 'Stay active 25 out of 30 days.', 'In Progress (21/25 days)', 'Streak', 'Award', false, 'Grand Vitality Medal')
ON CONFLICT (id) DO NOTHING;

-- Grant schema permissions to public roles
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

-- Force PostgREST schema cache to reload immediately
NOTIFY pgrst, 'reload schema';

