-- ====================================================================
-- NutriTrack AI • Disabled Citizen Dashboard Database Schema
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/wgoqcnnvpgeahvqqfnjn/sql
-- ====================================================================

-- 1. Profiles Table (Disabled citizen health metrics & preferences)
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT NOT NULL,
  height_cm NUMERIC NOT NULL,
  weight_kg NUMERIC NOT NULL,
  previous_weight_kg NUMERIC,
  disability_type TEXT NOT NULL,
  mobility_level TEXT NOT NULL,
  activity_level TEXT NOT NULL,
  dietary_preference TEXT NOT NULL,
  daily_water_target_ml INTEGER NOT NULL,
  daily_exercise_target_mins INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Water Intake Logs Table
CREATE TABLE IF NOT EXISTS public.water_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  amount_ml INTEGER NOT NULL,
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Daily Wellness & Goal Status Table
CREATE TABLE IF NOT EXISTS public.daily_wellness_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  log_date DATE DEFAULT CURRENT_DATE NOT NULL,
  water_current_ml INTEGER DEFAULT 0,
  water_target_ml INTEGER NOT NULL,
  exercise_current_mins INTEGER DEFAULT 0,
  exercise_target_mins INTEGER NOT NULL,
  logged_meals JSONB DEFAULT '[]'::jsonb,
  active_streak_days INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, log_date)
);

-- 4. Food Photo & Meal Verification Logs Table
CREATE TABLE IF NOT EXISTS public.food_photo_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  meal_type TEXT NOT NULL,
  dish_name TEXT NOT NULL,
  photo_url TEXT,
  estimated_calories INTEGER,
  estimated_protein_g NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) & Allow Read/Write for Public App Access
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_wellness_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_photo_logs ENABLE ROW LEVEL SECURITY;

-- Anonymous / Authenticated Access Policies for Demo & Health Platform
CREATE POLICY "Allow all read access to profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow all write access to profiles" ON public.profiles FOR ALL USING (true);

CREATE POLICY "Allow all read access to water_logs" ON public.water_logs FOR SELECT USING (true);
CREATE POLICY "Allow all write access to water_logs" ON public.water_logs FOR ALL USING (true);

CREATE POLICY "Allow all read access to daily_wellness_logs" ON public.daily_wellness_logs FOR SELECT USING (true);
CREATE POLICY "Allow all write access to daily_wellness_logs" ON public.daily_wellness_logs FOR ALL USING (true);

CREATE POLICY "Allow all read access to food_photo_logs" ON public.food_photo_logs FOR SELECT USING (true);
CREATE POLICY "Allow all write access to food_photo_logs" ON public.food_photo_logs FOR ALL USING (true);
