import React, { useState } from 'react';
import { CodeSample } from '../../lib/openapi';

interface CodeSampleTabsProps {
  codeSamples: CodeSample[];
}

export const CodeSampleTabs: React.FC<CodeSampleTabsProps> = ({ codeSamples }) => {
  const [activeTab, setActiveTab] = useState<string>(
    codeSamples.length > 0 ? codeSamples[0].label : 'cURL'
  );
  const [copied, setCopied] = useState(false);

  const activeSample = codeSamples.find((s) => s.label === activeTab || s.lang === activeTab) || codeSamples[0];
  const activeSource = activeSample ? activeSample.source : '// No code sample available in spec';

  const copySnippet = () => {
    navigator.clipboard.writeText(activeSource);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!codeSamples || codeSamples.length === 0) {
    return null;
  }

  return (
    <div className="border-t border-slate-800">
      <div className="bg-slate-950 px-3 py-2 flex items-center justify-between border-b border-slate-800 overflow-x-auto">
        <div className="flex items-center gap-1 font-mono text-[11px] overflow-x-auto">
          {codeSamples.map((sample) => (
            <button
              key={sample.label}
              onClick={() => setActiveTab(sample.label)}
              className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                (activeSample && activeSample.label === sample.label)
                  ? 'bg-slate-800 text-emerald-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {sample.label}
            </button>
          ))}
        </div>
        <button
          onClick={copySnippet}
          className="text-[11px] font-mono text-slate-400 hover:text-slate-200 transition-colors px-2 py-1 rounded ml-2 cursor-pointer"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      <pre className="p-4 text-xs font-mono text-emerald-300/90 bg-slate-950 overflow-x-auto max-h-56 leading-relaxed">
        {activeSource}
      </pre>
    </div>
  );
};
