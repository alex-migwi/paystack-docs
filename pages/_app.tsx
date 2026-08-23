import type { AppProps } from 'next/app';
import React from 'react';
import { useRouter } from 'next/router';
import { ApiExplorer } from '../components/ApiExplorer';
import { EndpointBadge, Callout, ParamCard, MarkdocRenderers } from '../components/MarkdocComponents';
import '../app/globals.css';

const components = {
  // Custom Markdoc Tag Renderers
  ApiExplorer,
  apiExplorer: ApiExplorer,
  'api-explorer': ApiExplorer,
  api_explorer: ApiExplorer,
  apiexplorer: ApiExplorer,

  EndpointBadge,
  endpoint: EndpointBadge,

  Callout,
  callout: Callout,

  ParamCard,
  param: ParamCard,

  // Standard Markdown Element Overrides
  ...MarkdocRenderers,
};

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isVerifyPage = router.pathname.includes('verify');

  return (
    <div className="min-h-screen bg-slate-50/90 text-slate-900 flex flex-col font-sans antialiased selection:bg-emerald-500 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md px-6 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-6">
          <a
            href="/docs/transaction/initialize"
            className="flex items-center gap-2.5 font-bold text-lg tracking-tight text-slate-900"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-mono font-extrabold text-base shadow-sm">
              P
            </div>
            <span className="text-slate-900 font-bold">Paystack API Docs</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-mono font-semibold border border-emerald-200">
              Markdoc Reference
            </span>
          </a>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
          <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-700 font-mono font-semibold">
            API v2026-08-22
          </span>
          <a
            href={isVerifyPage ? "https://paystack.com/docs/api/transaction/#verify" : "https://paystack.com/docs/api/transaction/#initialize"}
            target="_blank"
            rel="noreferrer"
            className="hover:text-emerald-600 transition-colors flex items-center gap-1 text-slate-600 font-semibold"
          >
            <span>Official Paystack Spec</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </header>

      {/* Balanced 3-Column API Documentation Layout */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-8 gap-8 justify-between">
        {/* Left Sidebar Navigation */}
        <aside className="w-60 hidden lg:block shrink-0">
          <div className="space-y-6 sticky top-20">
            <div>
              <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2.5 font-mono">
                Transactions API
              </h5>
              <ul className="space-y-1.5 text-xs font-medium">
                <li>
                  <a
                    href="/docs/transaction/initialize"
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border transition-all ${
                      !isVerifyPage
                        ? 'bg-emerald-50 text-emerald-900 font-bold border-emerald-300/80 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border-transparent'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${!isVerifyPage ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                      Initialize Transaction
                    </span>
                    <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-emerald-100 text-emerald-700 font-bold">
                      POST
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href="/docs/transaction/verify"
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border transition-all ${
                      isVerifyPage
                        ? 'bg-blue-50 text-blue-900 font-bold border-blue-300/80 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border-transparent'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isVerifyPage ? 'bg-blue-500' : 'bg-slate-300'}`}></span>
                      Verify Transaction
                    </span>
                    <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-blue-100 text-blue-700 font-bold">
                      GET
                    </span>
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2.5 font-mono">
                SDK Reference
              </h5>
              <ul className="space-y-1 text-xs font-medium text-slate-600">
                <li className="px-3 py-1.5 hover:text-slate-900 cursor-pointer font-semibold">Node.js SDK</li>
                <li className="px-3 py-1.5 hover:text-slate-900 cursor-pointer font-semibold">Python SDK</li>
                <li className="px-3 py-1.5 hover:text-slate-900 cursor-pointer font-semibold">PHP SDK</li>
              </ul>
            </div>
          </div>
        </aside>

        {/* Middle Column: Eye-Friendly Light Markdown Content */}
        <main className="flex-1 min-w-0 max-w-3xl bg-white p-6 sm:p-10 rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="docs-content">
            <Component {...pageProps} components={components} />
          </div>
        </main>

        {/* Right Column: Sticky Interactive API Explorer Console */}
        <aside className="w-[410px] hidden xl:block shrink-0">
          <div className="sticky top-20">
            {isVerifyPage ? (
              <ApiExplorer
                endpoint="/transaction/verify/:reference"
                method="GET"
                reference="7PV9766bsq"
              />
            ) : (
              <ApiExplorer
                endpoint="/transaction/initialize"
                method="POST"
                parameters={{
                  email: 'customer@example.com',
                  amount: 20000,
                  currency: 'NGN',
                }}
              />
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
