import React from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { getAllEndpointRoutes, getEndpointDetails, getChangelogStatus, EndpointRoute, EndpointDetails } from '../../../lib/openapi';
import { ApiExplorer } from '../../../components/ApiExplorer';

interface DocPageProps {
  route: EndpointRoute;
  details: EndpointDetails;
  changelogStatus: 'added' | 'modified' | 'unchanged';
  overlayContent?: string | null;
}

export default function DynamicDocPage({ route, details, changelogStatus, overlayContent }: DocPageProps) {
  const isGet = route.method.toUpperCase() === 'GET';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Header Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur sticky top-0 z-20 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-emerald-400 font-bold text-lg font-mono hover:text-emerald-300 transition-colors">
            Paystack Docs
          </Link>
          <span className="text-slate-600">/</span>
          <span className="text-slate-400 text-xs font-mono font-medium uppercase tracking-wider">{route.tag}</span>
          <span className="text-slate-600">/</span>
          <span className="text-slate-200 text-xs font-mono font-semibold">{route.endpoint}</span>
        </div>

        <div className="flex items-center gap-2">
          {changelogStatus !== 'unchanged' && (
            <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
              ⚡ {changelogStatus === 'added' ? 'New in Spec' : 'Updated in Spec'}
            </span>
          )}
          <span className="text-xs text-slate-400 font-mono">OpenAPI v3.0.1</span>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Documentation Reference */}
        <div className="lg:col-span-7 space-y-8">
          {/* Section Header */}
          <div className="space-y-3 border-b border-slate-800 pb-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-1 text-xs font-mono font-bold rounded ${
                isGet
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}>
                {route.method}
              </span>
              <code className="text-sm font-mono text-slate-300 font-semibold bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
                {route.path}
              </code>
              {details.xIdempotency && (
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  ⚡ Idempotent
                </span>
              )}
              {details.xRetrySafe && (
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  🛡️ Retry Safe
                </span>
              )}
              {details.xPagination && (
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  📄 Auto-Paginating
                </span>
              )}
            </div>
            <h1 className="text-3xl font-extrabold text-slate-50 tracking-tight font-sans">
              {details.summary || route.summary}
            </h1>
            {details.description && (
              <p className="text-slate-400 text-sm leading-relaxed font-sans">{details.description}</p>
            )}
          </div>

          {/* Human Overlay Note (Preserved Custom Markdown Content) */}
          {overlayContent && (
            <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-5 text-emerald-200 text-xs space-y-2 leading-relaxed">
              <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-wider text-[10px] font-mono">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Developer Guide Note
              </div>
              <div className="prose prose-invert prose-xs text-slate-300">
                {overlayContent}
              </div>
            </div>
          )}

          {/* Request Parameters & Body Schema */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono border-b border-slate-800 pb-2">
              {isGet ? 'Parameters' : 'Request Body Parameters'}
            </h3>

            {[...details.parameters, ...details.requestBodyFields].length > 0 ? (
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/50">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 border-b border-slate-800 font-mono text-[11px] text-slate-400 uppercase">
                    <tr>
                      <th className="py-3 px-4">Field</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Required</th>
                      <th className="py-3 px-4">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans text-slate-300">
                    {[...details.parameters, ...details.requestBodyFields].map((field) => (
                      <tr key={field.name} className="hover:bg-slate-900/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-semibold text-emerald-400">{field.name}</td>
                        <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">{field.type}</td>
                        <td className="py-3 px-4 font-mono">
                          {field.required ? (
                            <span className="text-rose-400 font-bold text-[10px] uppercase">Required</span>
                          ) : (
                            <span className="text-slate-400 text-[10px]">Optional</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          {field.description || '-'}
                          {field.enum && (
                            <div className="mt-1 flex flex-wrap gap-1 font-mono text-[10px]">
                              <span className="text-slate-400">Allowed:</span>
                              {field.enum.map((opt) => (
                                <span key={opt} className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
                                  {opt}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-400 font-mono">No body parameters required for this operation.</p>
            )}
          </div>
        </div>

        {/* Right Column: Interactive Console & Code Explorer */}
        <div className="lg:col-span-5">
          <div className="sticky top-24">
            <ApiExplorer endpoint={route.path} method={route.method} />
          </div>
        </div>
      </main>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const routes = getAllEndpointRoutes();
  const paths = routes.map((r) => ({
    params: {
      category: r.category,
      endpoint: r.endpoint,
    },
  }));

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const category = params?.category as string;
  const endpoint = params?.endpoint as string;

  const routes = getAllEndpointRoutes();
  const route = routes.find((r) => r.category === category && r.endpoint === endpoint);

  if (!route) {
    return { notFound: true };
  }

  const details = getEndpointDetails(route.path, route.method);
  const changelogStatus = getChangelogStatus(route.path, route.method);

  // Check for human overlay file
  let overlayContent: string | null = null;
  const overlayFile = path.join(process.cwd(), `docs/overlays/${category}-${endpoint}.md`);
  if (fs.existsSync(overlayFile)) {
    overlayContent = fs.readFileSync(overlayFile, 'utf8');
  }

  return {
    props: {
      route,
      details,
      changelogStatus,
      overlayContent,
    },
  };
};
