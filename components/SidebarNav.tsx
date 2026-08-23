import React, { useState } from 'react';
import Link from 'next/link';
import { EndpointRoute } from '../lib/openapi';

interface SidebarNavProps {
  routes: EndpointRoute[];
  currentPath: string;
  currentMethod: string;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({ routes, currentPath, currentMethod }) => {
  const [filter, setFilter] = useState('');
  const tags = Array.from(new Set(routes.map((r) => r.tag)));

  const filteredRoutes = routes.filter(
    (r) =>
      r.summary.toLowerCase().includes(filter.toLowerCase()) ||
      r.path.toLowerCase().includes(filter.toLowerCase()) ||
      r.tag.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <aside className="w-64 hidden xl:block shrink-0 space-y-4 text-xs font-sans">
      <div className="sticky top-20 space-y-4 max-h-[calc(100vh-6rem)] overflow-y-auto pr-2 custom-scrollbar">
        {/* Search */}
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter API list..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
        />

        {tags.map((tag) => {
          const tagRoutes = filteredRoutes.filter((r) => r.tag === tag);
          if (tagRoutes.length === 0) return null;

          return (
            <div key={tag} className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono px-2 py-1">
                {tag}
              </div>
              <div className="space-y-0.5">
                {tagRoutes.map((r) => {
                  const isActive = r.path === currentPath && r.method === currentMethod;
                  const isGet = r.method === 'GET';

                  return (
                    <Link
                      key={`${r.method}-${r.path}`}
                      href={`/docs/${r.category}/${r.endpoint}`}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors text-[11px] ${
                        isActive
                          ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                      }`}
                    >
                      <span className="truncate max-w-[140px]">{r.summary || r.path}</span>
                      <span
                        className={`text-[9px] font-mono font-bold px-1 rounded ${
                          isGet ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'
                        }`}
                      >
                        {r.method}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};
