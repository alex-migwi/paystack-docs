import React, { useState } from 'react';

export function EndpointBadge({ method = 'POST', path = '/transaction/initialize' }: { method?: string; path?: string }) {
  const [copied, setCopied] = useState(false);
  const fullUrl = `https://api.paystack.co${path}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-6 p-4 rounded-2xl bg-slate-900 text-slate-100 border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-md">
      <div className="flex items-center gap-3 font-mono text-xs sm:text-sm">
        <span className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
          {method}
        </span>
        <span className="text-slate-400 font-medium">https://api.paystack.co</span>
        <span className="text-emerald-300 font-semibold">{path}</span>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-medium transition-all flex items-center gap-1.5 border border-slate-700"
      >
        {copied ? (
          <span className="text-emerald-400 font-bold">✓ Copied URL</span>
        ) : (
          <>
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>Copy Endpoint</span>
          </>
        )}
      </button>
    </div>
  );
}

export function Callout({ type = 'info', title, children }: { type?: 'info' | 'warning' | 'tip' | 'important'; title?: string; children: React.ReactNode }) {
  const styles = {
    info: {
      bg: 'bg-emerald-50/70 border-emerald-200 text-emerald-950',
      icon: 'text-emerald-600 bg-emerald-100 border-emerald-200',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      defaultTitle: 'Authentication Required',
    },
    warning: {
      bg: 'bg-amber-50/70 border-amber-200 text-amber-950',
      icon: 'text-amber-600 bg-amber-100 border-amber-200',
      badge: 'bg-amber-100 text-amber-800 border-amber-200',
      defaultTitle: 'Warning Notice',
    },
    tip: {
      bg: 'bg-teal-50/70 border-teal-200 text-teal-950',
      icon: 'text-teal-600 bg-teal-100 border-teal-200',
      badge: 'bg-teal-100 text-teal-800 border-teal-200',
      defaultTitle: 'Pro Tip',
    },
    important: {
      bg: 'bg-indigo-50/70 border-indigo-200 text-indigo-950',
      icon: 'text-indigo-600 bg-indigo-100 border-indigo-200',
      badge: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      defaultTitle: 'Important Notice',
    },
  }[type] || {
    bg: 'bg-emerald-50/70 border-emerald-200 text-emerald-950',
    icon: 'text-emerald-600 bg-emerald-100 border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    defaultTitle: 'Note',
  };

  return (
    <div className={`my-6 p-4 rounded-2xl border ${styles.bg} shadow-xs`}>
      <div className="flex items-start gap-3">
        <div className={`p-1.5 rounded-lg border ${styles.icon} shrink-0 mt-0.5`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="space-y-1 text-xs sm:text-sm">
          <div className="font-bold flex items-center gap-2">
            <span>{title || styles.defaultTitle}</span>
          </div>
          <div className="text-slate-700 leading-relaxed">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function ParamCard({
  name,
  type,
  required = false,
  description,
  example,
}: {
  name: string;
  type: string;
  required?: boolean;
  description: string;
  example?: string;
}) {
  return (
    <div className="py-4 border-b border-slate-200/80 space-y-2 hover:bg-slate-50/80 px-3 rounded-xl transition-colors">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 font-mono">
          <span className="text-sm font-bold text-slate-900">{name}</span>
          <span className="px-2 py-0.5 text-[10px] rounded bg-slate-100 text-slate-600 border border-slate-200 font-semibold">
            {type}
          </span>
        </div>
        {required ? (
          <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded bg-rose-50 text-rose-700 border border-rose-200">
            Required
          </span>
        ) : (
          <span className="px-2 py-0.5 text-[10px] font-mono font-medium uppercase rounded bg-slate-100 text-slate-500 border border-slate-200">
            Optional
          </span>
        )}
      </div>

      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">{description}</p>

      {example && (
        <div className="flex items-center gap-2 text-xs font-mono text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 w-fit">
          <span className="text-slate-400">e.g.</span>
          <span className="text-emerald-700 font-semibold">{example}</span>
        </div>
      )}
    </div>
  );
}

// Markdown Element Custom Renderers
export const MarkdocRenderers = {
  h1: ({ children }: { children: React.ReactNode }) => (
    <div className="mb-6 space-y-2">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-mono text-xs font-semibold border border-emerald-200">
        <span>Paystack API Reference</span>
      </div>
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">{children}</h1>
    </div>
  ),

  h2: ({ children }: { children: React.ReactNode }) => (
    <div className="mt-10 mb-4 pb-2 border-b border-slate-200 flex items-center justify-between">
      <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
        <span className="w-1.5 h-5 rounded-full bg-emerald-500"></span>
        {children}
      </h2>
    </div>
  ),

  h3: ({ children }: { children: React.ReactNode }) => (
    <h3 className="mt-6 mb-3 text-base font-bold text-emerald-700 flex items-center gap-2">
      <span>{children}</span>
    </h3>
  ),

  p: ({ children }: { children: React.ReactNode }) => (
    <p className="text-sm sm:text-base text-slate-700 leading-relaxed mb-4">{children}</p>
  ),

  table: ({ children }: { children: React.ReactNode }) => (
    <div className="my-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm border-collapse">{children}</table>
      </div>
    </div>
  ),

  thead: ({ children }: { children: React.ReactNode }) => (
    <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 font-mono uppercase text-[11px] font-bold tracking-wider">
      {children}
    </thead>
  ),

  tbody: ({ children }: { children: React.ReactNode }) => (
    <tbody className="divide-y divide-slate-200">{children}</tbody>
  ),

  tr: ({ children }: { children: React.ReactNode }) => (
    <tr className="hover:bg-slate-50 transition-colors">{children}</tr>
  ),

  th: ({ children }: { children: React.ReactNode }) => <th className="px-4 py-3 font-semibold">{children}</th>,

  td: ({ children }: { children: React.ReactNode }) => <td className="px-4 py-3 text-slate-700">{children}</td>,

  code: ({ children }: { children: React.ReactNode }) => (
    <code className="px-1.5 py-0.5 rounded-md bg-slate-100 text-emerald-800 border border-slate-200 font-mono text-xs font-semibold">
      {children}
    </code>
  ),

  pre: ({ children, 'data-language': language }: { children: React.ReactNode; 'data-language'?: string }) => (
    <div className="my-6 rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-lg font-mono text-xs">
      <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-slate-400">
        <span className="uppercase text-[10px] font-bold tracking-wider text-emerald-400">
          {language || 'code'}
        </span>
        <span className="text-[10px] text-slate-500">Paystack Code Sample</span>
      </div>
      <div className="p-4 overflow-x-auto text-emerald-300/90 leading-relaxed">
        <pre>{children}</pre>
      </div>
    </div>
  ),

  hr: () => <hr className="my-8 border-slate-200" />,

  ul: ({ children }: { children: React.ReactNode }) => (
    <ul className="my-4 space-y-2 text-sm text-slate-700 list-disc list-inside">{children}</ul>
  ),

  li: ({ children }: { children: React.ReactNode }) => <li className="leading-relaxed">{children}</li>,
};
