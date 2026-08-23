import React, { useState } from 'react';

interface SecretKeyInputProps {
  apiKey: string;
  onKeyChange: (key: string) => void;
}

export const SecretKeyInput: React.FC<SecretKeyInputProps> = ({ apiKey, onKeyChange }) => {
  const [showKey, setShowKey] = useState(false);

  return (
    <div className="p-4 bg-slate-900/90 border-b border-slate-800/80">
      <div className="flex items-center justify-between mb-1.5">
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
        <button
          type="button"
          onClick={() => setShowKey(!showKey)}
          className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium transition-colors cursor-pointer"
        >
          {showKey ? 'Hide' : 'Reveal'}
        </button>
      </div>
      <div className="relative">
        <input
          type={showKey ? 'text' : 'password'}
          value={apiKey}
          onChange={(e) => onKeyChange(e.target.value)}
          placeholder="sk_test_..."
          className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
        />
      </div>
      <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
        <span>Stored in local storage</span>
        <span className={apiKey ? 'text-emerald-400 font-medium' : 'text-slate-400'}>
          {apiKey ? '✓ Custom Key Active' : 'Default Demo Key Used'}
        </span>
      </div>
    </div>
  );
};
