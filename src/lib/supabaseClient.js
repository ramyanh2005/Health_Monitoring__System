import { createClient } from '@supabase/supabase-js';

// Retrieve credentials from Vite env or runtime localStorage
export const getStoredCredentials = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const localUrl = localStorage.getItem('vitality_supabase_url');
  const localKey = localStorage.getItem('vitality_supabase_key');

  const url = (localUrl && localUrl.trim()) || (envUrl && envUrl.trim()) || '';
  const key = (localKey && localKey.trim()) || (envKey && envKey.trim()) || '';

  return { url, key };
};

let supabaseInstance = null;

export const initSupabase = () => {
  const { url, key } = getStoredCredentials();

  if (url && key && url.startsWith('http')) {
    try {
      supabaseInstance = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true
        }
      });
      return supabaseInstance;
    } catch (err) {
      console.warn('Error initializing Supabase client:', err);
      supabaseInstance = null;
      return null;
    }
  }

  supabaseInstance = null;
  return null;
};

// Singleton getter
export const getSupabase = () => {
  if (!supabaseInstance) {
    initSupabase();
  }
  return supabaseInstance;
};

export const isSupabaseConfigured = () => {
  const { url, key } = getStoredCredentials();
  return Boolean(url && key && url.startsWith('http') && key.length > 20);
};

// Live connection test utility
export const testSupabaseConnection = async (url, key) => {
  if (!url || !key || !url.startsWith('http')) {
    return { success: false, message: 'Please provide a valid Supabase Project URL and Anon API key.' };
  }

  try {
    const testClient = createClient(url.trim(), key.trim());
    // Query a lightweight table or check auth settings
    const { data, error } = await testClient
      .from('profiles')
      .select('id, name')
      .limit(1);

    if (error) {
      // If table doesn't exist yet (42P01, PGRST204, PGRST200, or schema cache message), credentials are valid!
      const isMissingTable = 
        error.code === '42P01' || 
        error.code === 'PGRST204' || 
        error.code === 'PGRST200' ||
        error.message?.toLowerCase().includes('schema cache') ||
        error.message?.toLowerCase().includes('does not exist');

      if (isMissingTable) {
        return { 
          success: true, 
          needsSchema: true, 
          message: 'Connected to Supabase Project! Next step: Run the SQL script in your Supabase SQL Editor to create the tables.' 
        };
      }
      return { success: false, message: error.message || 'Failed to authenticate with Supabase.' };
    }

    return { success: true, needsSchema: false, message: 'Successfully connected and verified Supabase database!' };
  } catch (err) {
    return { success: false, message: err.message || 'Network connection to Supabase failed.' };
  }
};

export const saveSupabaseCredentials = (url, key) => {
  localStorage.setItem('vitality_supabase_url', url.trim());
  localStorage.setItem('vitality_supabase_key', key.trim());
  initSupabase();
};

export const clearSupabaseCredentials = () => {
  localStorage.removeItem('vitality_supabase_url');
  localStorage.removeItem('vitality_supabase_key');
  supabaseInstance = null;
};
