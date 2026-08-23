import React from 'react';

interface ResponseViewerProps {
  response: any;
}

export const ResponseViewer: React.FC<ResponseViewerProps> = ({ response }) => {
  if (!response) return null;

  const isSuccess = response.status >= 200 && response.status < 300;

  return (
    <div className="border-t border-slate-800 bg-slate-950 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
          Response Output
        </span>
        <span
          className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
            isSuccess
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
          }`}
        >
          HTTP {response.status} {response.statusText || ''}
        </span>
      </div>

      <pre className="text-xs font-mono bg-slate-900 p-3 rounded-lg border border-slate-800 text-slate-200 overflow-x-auto max-h-60 leading-relaxed">
        {JSON.stringify(response.data || response.error, null, 2)}
      </pre>
    </div>
  );
};
