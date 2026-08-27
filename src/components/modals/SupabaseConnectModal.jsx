import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Database, 
  Check, 
  X, 
  ExternalLink, 
  Copy, 
  ShieldCheck, 
  AlertCircle, 
  RefreshCw, 
  Key, 
  Globe, 
  FileCode,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { 
  getStoredCredentials, 
  testSupabaseConnection, 
  saveSupabaseCredentials, 
  clearSupabaseCredentials,
  isSupabaseConfigured 
} from '../../lib/supabaseClient';

export const SupabaseConnectModal = () => {
  const { closeModal, showToast, isSupabaseActive, syncWithSupabase } = useApp();

  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    const creds = getStoredCredentials();
    setUrl(creds.url || '');
    setKey(creds.key || '');
  }, []);

  const handleTestAndSave = async (e) => {
    e.preventDefault();
    if (!url.trim() || !key.trim()) {
      showToast('Please enter both Supabase URL and Anon API Key.', 'error');
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    const result = await testSupabaseConnection(url.trim(), key.trim());
    setIsTesting(false);
    setTestResult(result);

    if (result.success) {
      saveSupabaseCredentials(url, key);
      showToast('🎉 Supabase connected successfully! Syncing data...');
      if (syncWithSupabase) {
        await syncWithSupabase();
      }
    }
  };

  const handleDisconnect = () => {
    if (window.confirm('Disconnect from Supabase and use local browser storage?')) {
      clearSupabaseCredentials();
      setUrl('');
      setKey('');
      setTestResult(null);
      showToast('Disconnected from Supabase. App will use local mode.', 'info');
      closeModal();
    }
  };

  const copySchemaFile = async () => {
    try {
      const resp = await fetch('/supabase_schema.sql');
      const text = await resp.text();
      navigator.clipboard.writeText(text);
      setCopiedSql(true);
      showToast('📋 Copied supabase_schema.sql to clipboard!');
      setTimeout(() => setCopiedSql(false), 3000);
    } catch (err) {
      // Fallback
      navigator.clipboard.writeText(`-- View file supabase_schema.sql in project root`);
      setCopiedSql(true);
      showToast('📋 Copied SQL schema reference to clipboard!');
      setTimeout(() => setCopiedSql(false), 3000);
    }
  };

  const isConnected = isSupabaseConfigured();

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="supabase-modal-title">
      <div className="modal-content supabase-modal-box fade-in">
        {/* Header */}
        <div className="modal-header">
          <div className="flex items-center gap-3">
            <div className="supabase-icon-badge">
              <Database size={24} className="text-primary-600" />
            </div>
            <div>
              <h3 id="supabase-modal-title" className="font-extrabold text-xl text-primary-900">
                Connect Supabase Backend
              </h3>
              <p className="text-xs text-muted">
                {isConnected ? '🟢 Live Cloud Connected' : '🟡 Local Storage Mode (Offline)'}
              </p>
            </div>
          </div>
          <button onClick={closeModal} className="modal-close-btn" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Step-by-Step Instructions Banner */}
        <div className="supabase-guide-banner mb-4">
          <h4 className="font-bold text-sm text-primary-900 mb-1 flex items-center gap-1.5">
            <ShieldCheck size={16} className="text-primary-600" />
            Simple 2-Step Supabase Setup:
          </h4>
          <ol className="supabase-steps-list text-xs text-secondary">
            <li>
              <strong>1. Run Database Schema:</strong> Copy <code>supabase_schema.sql</code> and execute it in your Supabase SQL Editor.
            </li>
            <li>
              <strong>2. Copy API Keys:</strong> Go to <strong>Supabase Dashboard → Project Settings → API</strong> and paste your Project URL and anon public key below.
            </li>
          </ol>

          <div className="flex gap-2 mt-3">
            <a
              href="https://supabase.com/dashboard/account/me"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm flex-1"
            >
              <ExternalLink size={14} />
              <span>Open Supabase Dashboard</span>
            </a>
            <button
              onClick={copySchemaFile}
              className="btn btn-secondary btn-sm flex-1"
            >
              {copiedSql ? <Check size={14} className="text-primary-600" /> : <Copy size={14} />}
              <span>{copiedSql ? 'SQL Copied!' : 'Copy SQL Schema'}</span>
            </button>
          </div>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleTestAndSave} className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-bold text-muted block mb-1">
              <Globe size={14} className="inline mr-1 text-primary-600" />
              Supabase Project URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://xyzcompany.supabase.co"
              className="supabase-input-control"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-muted block mb-1">
              <Key size={14} className="inline mr-1 text-accent-amber" />
              Supabase Anon Public API Key
            </label>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="supabase-input-control"
              required
            />
          </div>

          {/* Test Status Alert */}
          {testResult && (
            <div className={`connection-result-alert ${testResult.success ? 'alert-success' : 'alert-error'} fade-in`}>
              <div className="flex items-start gap-2">
                {testResult.success ? (
                  <CheckCircle2 size={18} className="text-primary-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle size={18} className="text-danger shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-bold text-xs">{testResult.message}</p>
                  {testResult.needsSchema && (
                    <p className="text-xs mt-1">
                      💡 Click "Copy SQL Schema" above and run it in the SQL Editor to generate the tables.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-3">
            <button
              type="submit"
              disabled={isTesting}
              className="btn btn-primary flex-1"
            >
              {isTesting ? <RefreshCw size={18} className="animate-spin" /> : <Check size={18} />}
              <span>{isTesting ? 'Testing Connection...' : 'Connect & Save'}</span>
            </button>

            {isConnected && (
              <button
                type="button"
                onClick={handleDisconnect}
                className="btn btn-secondary"
                title="Disconnect from Supabase"
              >
                <Trash2 size={18} className="text-danger" />
              </button>
            )}
          </div>
        </form>
      </div>

      <style>{`
        .supabase-modal-box {
          max-width: 540px;
        }

        .supabase-icon-badge {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-md);
          background-color: var(--primary-100);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .supabase-guide-banner {
          background-color: var(--bg-surface-subtle);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-md);
          padding: 1rem;
        }

        .supabase-steps-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          margin-top: 0.4rem;
        }

        .supabase-steps-list code {
          background: var(--bg-surface);
          padding: 0.1rem 0.35rem;
          border-radius: 4px;
          border: 1px solid var(--border-light);
          font-weight: 700;
        }

        .supabase-input-control {
          width: 100%;
          min-height: 46px;
          padding: 0.6rem 0.85rem;
          border-radius: var(--radius-sm);
          border: 1.5px solid var(--border-medium);
          font-family: inherit;
          font-size: var(--text-sm);
          font-weight: 600;
          background-color: var(--bg-surface);
          color: var(--text-primary);
        }

        .supabase-input-control:focus {
          outline: none;
          border-color: var(--primary-500);
        }

        .connection-result-alert {
          border-radius: var(--radius-sm);
          padding: 0.75rem 1rem;
        }

        .alert-success {
          background-color: var(--primary-50);
          border: 1px solid var(--primary-200);
          color: var(--primary-900);
        }

        .alert-error {
          background-color: var(--danger-light);
          border: 1px solid var(--danger-border);
          color: var(--danger-main);
        }
      `}</style>
    </div>
  );
};
