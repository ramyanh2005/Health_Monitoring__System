import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useWellness } from '../../context/WellnessContext';
import {
  SUPABASE_PROJECT_ID,
  getSupabaseUrl,
  getSupabaseAnonKey,
  saveSupabaseCredentials,
  checkSupabaseConnection
} from '../../services/supabaseClient';
import { supabaseDbService } from '../../services/supabaseDbService';
import { Database, CheckCircle2, AlertCircle, RefreshCw, ExternalLink, Copy, Check, Cloud } from 'lucide-react';

interface SupabaseSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseSyncModal: React.FC<SupabaseSyncModalProps> = ({ isOpen, onClose }) => {
  const { userProfile, dailyGoalStatus, loggedMeals, streakData, waterLogs } = useWellness();

  const [connectionStatus, setConnectionStatus] = useState<{
    tested: boolean;
    loading: boolean;
    connected: boolean;
    message: string;
  }>({
    tested: false,
    loading: false,
    connected: false,
    message: ''
  });

  const [anonKeyInput, setAnonKeyInput] = useState<string>(getSupabaseAnonKey());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncSuccessMessage, setSyncSuccessMessage] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);

  const supabaseUrl = getSupabaseUrl();
  const supabaseDashboardUrl = `https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}`;
  const supabaseSqlEditorUrl = `https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/sql`;

  const runConnectionCheck = async () => {
    setConnectionStatus((prev) => ({ ...prev, loading: true }));
    const result = await checkSupabaseConnection();
    setConnectionStatus({
      tested: true,
      loading: false,
      connected: result.connected,
      message: result.message
    });
  };

  useEffect(() => {
    if (isOpen) {
      runConnectionCheck();
    }
  }, [isOpen]);

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseCredentials(anonKeyInput);
    runConnectionCheck();
  };

  const handleSyncAllToSupabase = async () => {
    setIsSyncing(true);
    setSyncSuccessMessage(null);

    try {
      // 1. Sync profile
      await supabaseDbService.syncUserProfile(userProfile);

      // 2. Sync daily status
      await supabaseDbService.syncDailyStatus(
        userProfile.id,
        dailyGoalStatus,
        loggedMeals,
        streakData.currentStreak
      );

      // 3. Sync recent water logs
      for (const log of waterLogs.slice(0, 5)) {
        await supabaseDbService.syncWaterLog(userProfile.id, log);
      }

      setSyncSuccessMessage('All profile metrics, water logs, and goal data successfully sent to Supabase!');
    } catch (err: any) {
      setSyncSuccessMessage(`Sync attempted. (${err.message || 'Local state active'})`);
    } finally {
      setIsSyncing(false);
    }
  };

  const sqlSchemaSnippet = `-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT NOT NULL,
  height_cm NUMERIC NOT NULL,
  weight_kg NUMERIC NOT NULL,
  disability_type TEXT NOT NULL,
  mobility_level TEXT NOT NULL,
  dietary_preference TEXT NOT NULL,
  daily_water_target_ml INTEGER NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Water Logs Table
CREATE TABLE IF NOT EXISTS public.water_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  amount_ml INTEGER NOT NULL,
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Daily Wellness Logs
CREATE TABLE IF NOT EXISTS public.daily_wellness_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  log_date DATE DEFAULT CURRENT_DATE NOT NULL,
  water_current_ml INTEGER DEFAULT 0,
  water_target_ml INTEGER NOT NULL,
  exercise_current_mins INTEGER DEFAULT 0,
  logged_meals JSONB DEFAULT '[]'::jsonb,
  active_streak_days INTEGER DEFAULT 1,
  UNIQUE(user_id, log_date)
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_wellness_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all to profiles" ON public.profiles FOR ALL USING (true);
CREATE POLICY "Allow all to water_logs" ON public.water_logs FOR ALL USING (true);
CREATE POLICY "Allow all to daily_wellness_logs" ON public.daily_wellness_logs FOR ALL USING (true);`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlSchemaSnippet);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Supabase Cloud Database Connection"
      maxWidth="620px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Project Info Header */}
        <div
          style={{
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--color-bg-card-subtle)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#3ecf8e',
                color: '#121212',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '18px'
              }}
            >
              <Database size={22} color="#000" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 800, color: 'var(--color-text-main)' }}>
                  Supabase Project:
                </span>
                <code style={{ backgroundColor: 'var(--color-bg-card)', padding: '0.15rem 0.45rem', borderRadius: '4px', border: '1px solid var(--color-border)', fontSize: '11px', color: 'var(--color-primary-text)' }}>
                  {SUPABASE_PROJECT_ID}
                </code>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                {supabaseUrl}
              </span>
            </div>
          </div>

          <a
            href={supabaseDashboardUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-secondary"
            style={{ fontSize: '11px', padding: '0.35rem 0.65rem', minHeight: 'auto' }}
          >
            <ExternalLink size={12} />
            <span>Open Dashboard</span>
          </a>
        </div>

        {/* Connection Status Box */}
        <div
          style={{
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: connectionStatus.connected ? 'var(--color-healthy-bg)' : 'var(--color-bg-card)',
            border: `1px solid ${connectionStatus.connected ? 'var(--color-healthy)' : 'var(--color-border)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            {connectionStatus.loading ? (
              <RefreshCw size={18} className="animate-spin" color="var(--color-primary)" />
            ) : connectionStatus.connected ? (
              <CheckCircle2 size={20} color="var(--color-healthy)" />
            ) : (
              <AlertCircle size={20} color="var(--color-notice)" />
            )}

            <div>
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-main)', display: 'block' }}>
                {connectionStatus.loading
                  ? 'Testing Supabase connection ping...'
                  : connectionStatus.connected
                  ? 'Cloud Connection Ready & Active'
                  : 'Supabase Configured (Local Cache Fallback Active)'}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                {connectionStatus.message || 'Connecting to project wgoqcnnvpgeahvqqfnjn...'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={runConnectionCheck}
            disabled={connectionStatus.loading}
            className="btn-secondary"
            style={{ fontSize: '11px', padding: '0.35rem 0.6rem', minHeight: 'auto' }}
          >
            <RefreshCw size={12} /> Test Ping
          </button>
        </div>

        {/* Sync Now Action */}
        <div
          style={{
            padding: '1.25rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-primary-light)',
            border: '1px solid var(--color-primary-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 800, color: 'var(--color-primary-text)', display: 'block' }}>
                Synchronize Wellness Data with Supabase
              </span>
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                Upload current profile ({userProfile.name}, {userProfile.weightKg}kg), water logs, and goal progress to your cloud database.
              </span>
            </div>

            <button
              type="button"
              onClick={handleSyncAllToSupabase}
              disabled={isSyncing}
              className="btn-primary"
              style={{ padding: '0.5rem 1rem', fontSize: 'var(--text-xs)', minHeight: 'auto', flexShrink: 0 }}
            >
              {isSyncing ? <RefreshCw size={14} className="animate-spin" /> : <Cloud size={14} />}
              <span>{isSyncing ? 'Syncing...' : 'Sync to Cloud'}</span>
            </button>
          </div>

          {syncSuccessMessage && (
            <div style={{ fontSize: '11px', color: 'var(--color-healthy)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Check size={14} /> {syncSuccessMessage}
            </div>
          )}
        </div>

        {/* Supabase Anon Key Configuration */}
        <div>
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-main)', display: 'block', marginBottom: '0.35rem' }}>
            Supabase Project Anon / API Key (Optional Override):
          </span>
          <form onSubmit={handleSaveKey} style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              placeholder="Paste your Supabase anon key here..."
              value={anonKeyInput}
              onChange={(e) => setAnonKeyInput(e.target.value)}
              style={{
                flex: 1,
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                fontSize: '11px',
                backgroundColor: 'var(--color-bg-card)',
                color: 'var(--color-text-main)'
              }}
            />
            <button type="submit" className="btn-secondary" style={{ fontSize: '11px', padding: '0.5rem 0.85rem', minHeight: 'auto' }}>
              Save Key
            </button>
          </form>
        </div>

        {/* SQL Schema Quick Setup */}
        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-main)' }}>
              1-Click Database SQL Schema Setup:
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={handleCopySql}
                className="btn-secondary"
                style={{ fontSize: '11px', padding: '0.25rem 0.5rem', minHeight: 'auto' }}
              >
                {copiedSql ? <Check size={12} color="var(--color-healthy)" /> : <Copy size={12} />}
                <span>{copiedSql ? 'Copied SQL!' : 'Copy SQL'}</span>
              </button>
              <a
                href={supabaseSqlEditorUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary"
                style={{ fontSize: '11px', padding: '0.25rem 0.5rem', minHeight: 'auto' }}
              >
                <ExternalLink size={12} />
                <span>Open SQL Editor</span>
              </a>
            </div>
          </div>

          <pre
            style={{
              backgroundColor: '#0f172a',
              color: '#94a3b8',
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '10px',
              fontFamily: 'monospace',
              maxHeight: '120px',
              overflowY: 'auto',
              border: '1px solid var(--color-border)',
              margin: 0
            }}
          >
            {sqlSchemaSnippet}
          </pre>
        </div>

        {/* Modal Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem', borderTop: '1px solid var(--color-border)' }}>
          <button type="button" onClick={onClose} className="btn-primary" style={{ fontSize: 'var(--text-xs)' }}>
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
};
