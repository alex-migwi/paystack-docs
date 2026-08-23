import React from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { getAllEndpointRoutes, getEndpointDetails, getChangelogStatus, EndpointRoute, EndpointDetails } from '../../../lib/openapi';
import { ApiExplorer } from '../../../components/ApiExplorer';
import { SidebarNav } from '../../../components/SidebarNav';
import { MarkdownRenderer } from '../../../components/MarkdownRenderer';

interface DocPageProps {
  route: EndpointRoute;
  details: EndpointDetails;
  changelogStatus: 'added' | 'modified' | 'unchanged';
  allRoutes: EndpointRoute[];
  overlayContent?: string | null;
}

export default function DynamicDocPage({ route, details, changelogStatus, allRoutes, overlayContent }: DocPageProps) {
  const isGet = route.method.toUpperCase() === 'GET';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Header Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur sticky top-0 z-20 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-emerald-400 font-bold text-lg font-mono hover:text-emerald-300 transition-colors">
            Paystack Portal
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
      <div className="max-w-[1600px] mx-auto px-6 py-8 flex gap-8">
        {/* Left Sidebar Navigation */}
        <SidebarNav routes={allRoutes} currentPath={route.path} currentMethod={route.method} />

        {/* Center & Right Column Grid */}
        <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-w-0">
          {/* Center Column: Documentation Reference */}
          <div className="lg:col-span-7 space-y-8 min-w-0">
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
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    ⚡ Idempotent
                  </span>
                )}
                {details.xRetrySafe && (
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    🛡️ Retry Safe
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight font-sans">
                {details.summary || route.summary || route.path}
              </h1>

              {details.description && (
                <p className="text-slate-400 text-sm leading-relaxed font-sans">{details.description}</p>
              )}
            </div>

            {/* Optional Human Developer Overlay Box */}
            {overlayContent && (
              <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-5 text-emerald-200 text-xs space-y-3 leading-relaxed shadow-sm">
                <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-wider text-[10px] font-mono border-b border-emerald-500/30 pb-2">
                  <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Developer Guide Note
                </div>
                <MarkdownRenderer content={overlayContent} />
              </div>
            )}

            {/* Parameters Table */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 font-mono">
                Request Parameters
              </h2>

              {details.parameters.length > 0 || details.requestBodyFields.length > 0 ? (
                <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/60 shadow-sm">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Parameter</th>
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4">In</th>
                        <th className="py-3 px-4">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {details.parameters.map((p) => (
                        <tr key={`${p.in}-${p.name}`} className="hover:bg-slate-900/80 transition-colors">
                          <td className="py-3 px-4 font-mono text-emerald-400 font-semibold">
                            {p.name} {p.required && <span className="text-rose-400">*</span>}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-400">{p.type}</td>
                          <td className="py-3 px-4 font-mono text-slate-400">{p.in}</td>
                          <td className="py-3 px-4 text-slate-300">{p.description || '-'}</td>
                        </tr>
                      ))}
                      {details.requestBodyFields.map((p) => (
                        <tr key={`body-${p.name}`} className="hover:bg-slate-900/80 transition-colors">
                          <td className="py-3 px-4 font-mono text-emerald-400 font-semibold">
                            {p.name} {p.required && <span className="text-rose-400">*</span>}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-400">{p.type}</td>
                          <td className="py-3 px-4 font-mono text-slate-400">body</td>
                          <td className="py-3 px-4 text-slate-300">{p.description || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-slate-500 font-mono">No request parameters required for this operation.</p>
              )}
            </div>
          </div>

          {/* Right Column: Interactive Console & Code Explorer */}
          <div className="lg:col-span-5 min-w-0">
            <div className="sticky top-20">
              <ApiExplorer endpoint={route.path} method={route.method} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const routes = getAllEndpointRoutes();
  const paths: Array<{ params: { category: string; endpoint: string } }> = [];

  for (const r of routes) {
    paths.push({ params: { category: r.category, endpoint: r.endpoint } });
    if (Array.isArray(r.aliases)) {
      for (const alias of r.aliases) {
        if (alias) {
          paths.push({ params: { category: r.category, endpoint: alias } });
        }
      }
    }
  }

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const category = params?.category as string;
  const endpoint = params?.endpoint as string;

  const routes = getAllEndpointRoutes();
  const route = routes.find(
    (r) => r.category === category && (r.endpoint === endpoint || (r.aliases && r.aliases.includes(endpoint)))
  );

  if (!route) {
    return { notFound: true };
  }

  const details = getEndpointDetails(route.path, route.method);
  const changelogStatus = getChangelogStatus(route.path, route.method);

  // Check for human overlay file
  let overlayContent: string | null = null;
  const overlayFilename = `${route.category}-${route.endpoint}.md`;
  const overlayFilePath = path.join(process.cwd(), 'docs/overlays', overlayFilename);

  if (fs.existsSync(overlayFilePath)) {
    overlayContent = fs.readFileSync(overlayFilePath, 'utf8');
  }

  return {
    props: {
      route,
      details,
      changelogStatus,
      allRoutes: routes,
      overlayContent,
    },
  };
};
