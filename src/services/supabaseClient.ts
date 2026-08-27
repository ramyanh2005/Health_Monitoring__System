import { createClient, SupabaseClient } from '@supabase/supabase-js';

// User's Supabase Project configuration
export const SUPABASE_PROJECT_ID = 'wgoqcnnvpgeahvqqfnjn';
export const DEFAULT_SUPABASE_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co`;

const STORAGE_ANON_KEY = 'nutritrack_supabase_anon_key';
const STORAGE_CUSTOM_URL = 'nutritrack_supabase_custom_url';

export const getSupabaseUrl = (): string => {
  const custom = localStorage.getItem(STORAGE_CUSTOM_URL);
  if (custom && custom.trim().length > 0) return custom.trim();
  return import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
};

export const getSupabaseAnonKey = (): string => {
  const custom = localStorage.getItem(STORAGE_ANON_KEY);
  if (custom && custom.trim().length > 0) return custom.trim();
  return import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';
};

export const saveSupabaseCredentials = (anonKey: string, customUrl?: string) => {
  if (anonKey) localStorage.setItem(STORAGE_ANON_KEY, anonKey.trim());
  if (customUrl) localStorage.setItem(STORAGE_CUSTOM_URL, customUrl.trim());
  // Re-instantiate client
  supabase = createClient(getSupabaseUrl(), getSupabaseAnonKey());
};

// Create live Supabase Client instance
export let supabase: SupabaseClient = createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

/**
 * Checks connection health to the Supabase backend
 */
export const checkSupabaseConnection = async (): Promise<{
  connected: boolean;
  message: string;
  projectId: string;
}> => {
  try {
    const { error } = await supabase.from('profiles').select('id').limit(1);


    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('relation "public.profiles" does not exist')) {
        return {
          connected: true,
          message: 'Connected to Supabase! (Database tables need to be created with SQL schema)',
          projectId: SUPABASE_PROJECT_ID
        };
      }
      return {
        connected: false,
        message: `Supabase reached, but responded with: ${error.message}`,
        projectId: SUPABASE_PROJECT_ID
      };
    }

    return {
      connected: true,
      message: 'Successfully connected & synchronized with Supabase cloud database!',
      projectId: SUPABASE_PROJECT_ID
    };
  } catch (err: any) {
    return {
      connected: false,
      message: err?.message || 'Could not reach Supabase endpoint',
      projectId: SUPABASE_PROJECT_ID
    };
  }
};
