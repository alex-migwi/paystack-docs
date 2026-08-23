import React, { useState } from 'react';
import { GetStaticProps } from 'next';
import Link from 'next/link';
import { getAllEndpointRoutes, EndpointRoute } from '../lib/openapi';

interface HomeProps {
  routes: EndpointRoute[];
}

export default function Home({ routes }: HomeProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('All');

  const tags = ['All', ...Array.from(new Set(routes.map((r) => r.tag)))];

  const filteredRoutes = routes.filter((r) => {
    const matchesTag = selectedTag === 'All' || r.tag === selectedTag;
    const matchesSearch =
      r.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.method.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.tag.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTag && matchesSearch;
  });

  const categories = Array.from(new Set(filteredRoutes.map((r) => r.tag)));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Banner */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-bold flex items-center justify-center font-mono">
            P
          </div>
          <span className="text-emerald-400 font-bold text-lg font-mono">Paystack API Portal</span>
          <span className="text-slate-700">|</span>
          <span className="text-slate-400 text-xs font-mono">Enriched OpenAPI Source of Truth</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 text-xs font-mono rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            163 Live Operations
          </span>
          <span className="px-2.5 py-1 text-xs font-mono rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
            12 Code Languages
          </span>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-6 py-12 text-center space-y-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-50 tracking-tight">
          Paystack API Reference & Interactive Explorer
        </h1>
        <p className="text-slate-400 text-base max-w-2xl mx-auto font-sans leading-relaxed">
          Self-documenting developer portal synchronized directly with upstream enriched OpenAPI spec metadata. Features live testing, automatic idempotency key generation, and multi-language code snippets.
        </p>

        {/* Search Input */}
        <div className="max-w-xl mx-auto pt-4 relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search API endpoints (e.g. initialize transaction, charge, verify)..."
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-5 py-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors shadow-xl font-sans"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-3.5 text-slate-500 hover:text-slate-300 text-xs font-mono"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                selectedTag === tag
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-950/50'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Endpoints Directory */}
      <div className="max-w-6xl mx-auto px-6 pb-20 space-y-10">
        {categories.map((category) => {
          const categoryEndpoints = filteredRoutes.filter((r) => r.tag === category);
          return (
            <div key={category} className="space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-800/80 pb-3">
                <h2 className="text-lg font-bold text-slate-200 font-mono">{category}</h2>
                <span className="text-xs text-slate-500 font-mono">({categoryEndpoints.length} endpoints)</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categoryEndpoints.map((r) => (
                  <Link
                    key={`${r.method}-${r.path}`}
                    href={`/docs/${r.category}/${r.endpoint}`}
                    className="group bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-emerald-500/50 rounded-2xl p-4 transition-all duration-200 shadow-sm flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span
                          className={`px-2 py-0.5 text-[11px] font-mono font-bold rounded ${
                            r.method === 'GET'
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {r.method}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400 group-hover:text-emerald-400 transition-colors">
                          {r.path} →
                        </span>
                      </div>
                      <h3 className="font-semibold text-slate-100 text-sm group-hover:text-emerald-300 transition-colors">
                        {r.summary || r.path}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const routes = getAllEndpointRoutes();
  return {
    props: {
      routes,
    },
  };
};
