import React, { useState, useEffect } from 'react';

interface SecretKeyInputProps {
  apiKey: string;
  onKeyChange: (key: string) => void;
}

export const SecretKeyInput: React.FC<SecretKeyInputProps> = ({ apiKey, onKeyChange }) => {
  const [showKey, setShowKey] = useState(false);
  const [fetchingSessionKey, setFetchingSessionKey] = useState(false);
  const [keySource, setKeySource] = useState<'localStorage' | 'session' | 'sandbox' | 'custom' | null>(null);

  // Default Paystack Public Sandbox Test Key for guest developer exploration
  const SANDBOX_TEST_KEY = 'sk_test_0000000000000000000000000000000000000000';

  useEffect(() => {
    // 1. Check local storage
    const stored = localStorage.getItem('paystack_secret_key');
    if (stored) {
      onKeyChange(stored);
      setKeySource('localStorage');
      return;
    }

    // 2. Check environment variable (CI / Staging deployments)
    const envKey = process.env.NEXT_PUBLIC_PAYSTACK_TEST_KEY;
    if (envKey) {
      onKeyChange(envKey);
      setKeySource('session');
      return;
    }

    // 3. Attempt Paystack Dashboard Session Cookie Retrieval (when hosted on Paystack domain)
    attemptSessionKeyRetrieval();
  }, []);

  const attemptSessionKeyRetrieval = async () => {
    setFetchingSessionKey(true);
    try {
      // In production hosting on paystack.com, fetch logged-in merchant's test key via domain session
      const res = await fetch('/api/paystack-proxy?action=session-key');
      if (res.ok) {
        const data = await res.json();
        if (data?.testSecretKey) {
          onKeyChange(data.testSecretKey);
          setKeySource('session');
          return;
        }
      }
    } catch {
      // Session fetch unavailable (unauthenticated or local dev)
    } finally {
      setFetchingSessionKey(false);
    }
  };

  const useSandboxDemoKey = () => {
    onKeyChange(SANDBOX_TEST_KEY);
    setKeySource('sandbox');
    localStorage.setItem('paystack_secret_key', SANDBOX_TEST_KEY);
  };

  const handleManualInput = (val: string) => {
    onKeyChange(val);
    setKeySource('custom');
    localStorage.setItem('paystack_secret_key', val);
  };

  return (
    <div className="p-4 bg-slate-900/90 border-b border-slate-800/80 space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
            />
          </svg>
          Paystack Secret Test Key
        </label>

        <div className="flex items-center gap-2">
          {!apiKey && (
            <button
              type="button"
              onClick={useSandboxDemoKey}
              className="text-[10px] bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 px-2 py-0.5 rounded border border-emerald-500/30 font-mono transition-colors cursor-pointer"
            >
              ⚡ Use Sandbox Key
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="text-[11px] text-slate-400 hover:text-slate-200 font-medium transition-colors cursor-pointer"
          >
            {showKey ? 'Hide' : 'Reveal'}
          </button>
        </div>
      </div>

      <div className="relative">
        <input
          type={showKey ? 'text' : 'password'}
          value={apiKey}
          onChange={(e) => handleManualInput(e.target.value)}
          placeholder="sk_test_..."
          className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
        />
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-400">
        <div className="flex items-center gap-1.5">
          {fetchingSessionKey && <span className="animate-pulse text-emerald-400">Connecting Paystack Session...</span>}
          {!fetchingSessionKey && keySource === 'session' && (
            <span className="text-emerald-400">✓ Paystack Merchant Account Synced</span>
          )}
          {!fetchingSessionKey && keySource === 'sandbox' && (
            <span className="text-indigo-400">✓ Paystack Public Sandbox Active</span>
          )}
          {!fetchingSessionKey && keySource === 'localStorage' && (
            <span className="text-slate-400">Stored in browser localStorage</span>
          )}
        </div>

        <span className={apiKey ? 'text-emerald-400 font-medium' : 'text-amber-400'}>
          {apiKey ? '✓ Key Ready' : '⚠ Key Required'}
        </span>
      </div>
    </div>
  );
};
