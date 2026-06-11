import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../utils/api';

export default function Settings() {
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({
    GROQ_API_KEY: '',
    ANTHROPIC_API_KEY: '',
    NOTION_TOKEN: '',
    NOTION_PAGE_ID: '',
    GOOGLE_CLIENT_ID: '',
    GOOGLE_CLIENT_SECRET: '',
    GOOGLE_REDIRECT_URI: 'http://localhost:3001/api/export/google/callback',
  });
  const [serverSettings, setServerSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getSettings().then(s => {
      setServerSettings(s);
      setForm(prev => ({
        ...prev,
        NOTION_PAGE_ID: s.notionPageId || '',
        GOOGLE_CLIENT_ID: s.googleClientId || '',
        GOOGLE_REDIRECT_URI: s.googleRedirectUri || prev.GOOGLE_REDIRECT_URI,
      }));
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (searchParams.get('google') === 'connected') {
      setServerSettings(prev => ({ ...prev, googleConnected: true }));
    }
  }, [searchParams]);

  function handleChange(key, value) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const payload = {};
      for (const [k, v] of Object.entries(form)) {
        if (v && v !== '***SET***') payload[k] = v;
      }
      await api.saveSettings(payload);
      setSaved(true);
      setServerSettings(prev => ({
        ...prev,
        groqKeySet: !!payload.GROQ_API_KEY || prev?.groqKeySet,
        anthropicKeySet: !!payload.ANTHROPIC_API_KEY || prev?.anthropicKeySet,
        notionTokenSet: !!payload.NOTION_TOKEN || prev?.notionTokenSet,
        notionPageId: payload.NOTION_PAGE_ID || prev?.notionPageId,
        googleClientId: payload.GOOGLE_CLIENT_ID || prev?.googleClientId,
        googleClientSecretSet: !!payload.GOOGLE_CLIENT_SECRET || prev?.googleClientSecretSet,
      }));
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleGoogleConnect() {
    try {
      const { authUrl } = await api.getGoogleAuthUrl();
      window.open(authUrl, '_blank', 'width=600,height=600');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-muted text-sm mt-1">Configure API keys and integrations. All keys are saved to your .env file.</p>
      </div>

      <div className="space-y-6">
        {/* Groq */}
        <SettingsSection
          title="Groq API (Free ✨)"
          icon="⚡"
          description="Free AI — used first if set. Get a key at console.groq.com"
          badge={serverSettings?.groqKeySet ? 'Connected' : null}
        >
          <PasswordField
            label="API Key"
            value={form.GROQ_API_KEY}
            placeholder={serverSettings?.groqKeySet ? '••••••••••••• (saved)' : 'gsk_...'}
            onChange={v => handleChange('GROQ_API_KEY', v)}
          />
          <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="text-xs text-accent-light hover:underline mt-1.5 inline-block">
            Get free Groq API key →
          </a>
        </SettingsSection>

        {/* Anthropic */}
        <SettingsSection
          title="Anthropic API"
          icon="🤖"
          description="Optional — Claude fallback if Groq key is not set"
          badge={serverSettings?.anthropicKeySet ? 'Connected' : null}
        >
          <PasswordField
            label="API Key"
            value={form.ANTHROPIC_API_KEY}
            placeholder={serverSettings?.anthropicKeySet ? '••••••••••••• (saved)' : 'sk-ant-...'}
            onChange={v => handleChange('ANTHROPIC_API_KEY', v)}
          />
          <a href="https://console.anthropic.com/account/keys" target="_blank" rel="noopener noreferrer" className="text-xs text-accent-light hover:underline mt-1.5 inline-block">
            Get API key →
          </a>
        </SettingsSection>

        {/* Notion */}
        <SettingsSection
          title="Notion Integration"
          icon="🔗"
          description="Export SOPs directly to Notion pages"
          badge={serverSettings?.notionTokenSet ? 'Connected' : null}
        >
          <div className="space-y-3">
            <PasswordField
              label="API Token"
              value={form.NOTION_TOKEN}
              placeholder={serverSettings?.notionTokenSet ? '••••••••••••• (saved)' : 'secret_...'}
              onChange={v => handleChange('NOTION_TOKEN', v)}
            />
            <div>
              <label className="label">Default Page ID</label>
              <input
                type="text"
                value={form.NOTION_PAGE_ID}
                onChange={e => handleChange('NOTION_PAGE_ID', e.target.value)}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                className="input"
              />
              <p className="text-xs text-muted mt-1.5">The page ID from the Notion page URL where SOPs will be created</p>
            </div>
          </div>
          <a href="https://www.notion.so/my-integrations" target="_blank" rel="noopener noreferrer" className="text-xs text-accent-light hover:underline mt-1.5 inline-block">
            Create Notion integration →
          </a>
        </SettingsSection>

        {/* Google */}
        <SettingsSection
          title="Google Docs Integration"
          icon="📝"
          description="Export SOPs to Google Docs via OAuth"
          badge={serverSettings?.googleConnected ? 'Connected' : null}
        >
          <div className="space-y-3">
            <div>
              <label className="label">Client ID</label>
              <input
                type="text"
                value={form.GOOGLE_CLIENT_ID}
                onChange={e => handleChange('GOOGLE_CLIENT_ID', e.target.value)}
                placeholder="xxxx.apps.googleusercontent.com"
                className="input"
              />
            </div>
            <PasswordField
              label="Client Secret"
              value={form.GOOGLE_CLIENT_SECRET}
              placeholder={serverSettings?.googleClientSecretSet ? '••••••••••••• (saved)' : 'GOCSPX-...'}
              onChange={v => handleChange('GOOGLE_CLIENT_SECRET', v)}
            />
            <div>
              <label className="label">Redirect URI</label>
              <input
                type="text"
                value={form.GOOGLE_REDIRECT_URI}
                onChange={e => handleChange('GOOGLE_REDIRECT_URI', e.target.value)}
                className="input"
              />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <button
              onClick={handleGoogleConnect}
              disabled={!serverSettings?.googleClientId && !form.GOOGLE_CLIENT_ID}
              className="btn-ghost text-sm"
            >
              {serverSettings?.googleConnected ? '✓ Reconnect Google' : 'Connect Google Account'}
            </button>
            {serverSettings?.googleConnected && (
              <span className="text-xs text-green-400">✓ Authenticated</span>
            )}
          </div>
          <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-xs text-accent-light hover:underline mt-1.5 inline-block">
            Create OAuth credentials →
          </a>
        </SettingsSection>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="mt-6 flex items-center gap-3">
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
        {saved && <span className="text-sm text-green-400">✓ Settings saved!</span>}
      </div>

      <div className="mt-8 p-4 bg-surface-2 rounded-xl border border-border">
        <p className="text-xs text-muted">
          <strong className="text-gray-400">Security note:</strong> API keys are stored in your local .env file and never sent to any external service other than their respective APIs. Google OAuth tokens are stored in memory for the current server session only.
        </p>
      </div>
    </div>
  );
}

function SettingsSection({ title, icon, description, badge, children }) {
  return (
    <div className="card p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <div>
            <h2 className="font-semibold text-white text-sm">{title}</h2>
            <p className="text-xs text-muted">{description}</p>
          </div>
        </div>
        {badge && (
          <span className="px-2.5 py-1 bg-green-500/15 text-green-400 text-xs font-medium rounded-full border border-green-500/25">
            ✓ {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function PasswordField({ label, value, placeholder, onChange }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="label">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="input pr-10"
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-gray-300"
        >
          {show ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}
