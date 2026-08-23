import React from 'react';
import Markdoc, { Config } from '@markdoc/markdoc';
import { Callout } from './MarkdocComponents';

interface MarkdownRendererProps {
  content: string;
}

// Markdoc Native Configuration for Tags and Custom Nodes
const markdocConfig: Config = {
  tags: {
    callout: {
      render: 'Callout',
      attributes: {
        type: { type: String, default: 'note' },
        title: { type: String },
      },
    },
  },
};

const components = {
  Callout,
  h1: ({ children }: { children: React.ReactNode }) => (
    <h1 className="text-base font-bold text-slate-100 font-mono tracking-tight mt-4 mb-2">{children}</h1>
  ),
  h2: ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-sm font-bold text-emerald-400 font-mono tracking-tight mt-4 mb-2 uppercase border-b border-emerald-500/20 pb-1">{children}</h2>
  ),
  h3: ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-xs font-bold text-emerald-300 font-mono tracking-tight mt-3 mb-1.5 uppercase">{children}</h3>
  ),
  p: ({ children }: { children: React.ReactNode }) => (
    <p className="text-xs text-slate-300 leading-relaxed mb-2.5">{children}</p>
  ),
  ul: ({ children }: { children: React.ReactNode }) => (
    <ul className="list-disc list-inside space-y-1 text-xs text-slate-300 my-2.5 pl-1">{children}</ul>
  ),
  ol: ({ children }: { children: React.ReactNode }) => (
    <ol className="list-decimal list-inside space-y-1 text-xs text-slate-300 my-2.5 pl-1">{children}</ol>
  ),
  li: ({ children }: { children: React.ReactNode }) => (
    <li className="text-xs text-slate-300 leading-relaxed">{children}</li>
  ),
  strong: ({ children }: { children: React.ReactNode }) => (
    <strong className="font-semibold text-emerald-200">{children}</strong>
  ),
  code: ({ children }: { children: React.ReactNode }) => (
    <code className="px-1.5 py-0.5 rounded bg-slate-900 text-emerald-400 font-mono text-[11px] border border-slate-800">
      {children}
    </code>
  ),
  blockquote: ({ children }: { children: React.ReactNode }) => (
    <blockquote className="my-3 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs shadow-xs">
      {children}
    </blockquote>
  ),
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  if (!content) return null;

  try {
    const ast = Markdoc.parse(content);
    const renderable = Markdoc.transform(ast, markdocConfig);
    return (
      <div className="markdown-body text-xs text-slate-300 font-sans">
        {Markdoc.renderers.react(renderable, React, { components })}
      </div>
    );
  } catch (err) {
    return <div className="text-xs text-slate-300 whitespace-pre-wrap">{content}</div>;
  }
};
