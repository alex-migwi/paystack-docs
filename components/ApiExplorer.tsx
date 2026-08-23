import React, { useState, useEffect } from 'react';
import { getEndpointDetails, ParameterField, CodeSample } from '../lib/openapi';

interface ApiExplorerProps {
  endpoint?: string;
  method?: string;
}

export const ApiExplorer: React.FC<ApiExplorerProps> = ({
  endpoint = '/transaction/initialize',
  method = 'POST',
}) => {
  const normMethod = method.toUpperCase();
  const normPath = endpoint;

  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [activeTab, setActiveTab] = useState<string>('curl');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  // Get schema details from spec
  const endpointDetails = getEndpointDetails(normPath, normMethod);
  const allSpecFields = [...endpointDetails.parameters, ...endpointDetails.requestBodyFields];
  const isGetMethod = normMethod === 'GET';

  const xCodeSamples: CodeSample[] = endpointDetails.xCodeSamples || [];
  const xIdempotency: boolean = Boolean(endpointDetails.xIdempotency);
  const xRetrySafe: boolean = Boolean(endpointDetails.xRetrySafe);

  // Load stored API key & set default form values
  useEffect(() => {
    const storedKey = localStorage.getItem('paystack_secret_key');
    if (storedKey) setApiKey(storedKey);

    const initialData: Record<string, any> = {};
    allSpecFields.forEach((field) => {
      if (field.example !== undefined) {
        initialData[field.name] = field.example;
      } else if (field.enum && field.enum.length > 0) {
        initialData[field.name] = field.enum[0];
      }
    });

    if (xIdempotency && !initialData['idempotency_key']) {
      initialData['idempotency_key'] = `idemp_${Math.random().toString(36).substring(2, 10)}`;
    }

    setFormData(initialData);
  }, [endpoint, method]);

  // If xCodeSamples exists and current activeTab is not in samples, default to first sample or 'curl'
  useEffect(() => {
    if (xCodeSamples.length > 0) {
      const match = xCodeSamples.find((s) => s.label.toLowerCase().includes(activeTab) || s.lang.toLowerCase() === activeTab);
      if (!match) {
        setActiveTab(xCodeSamples[0].label);
      }
    }
  }, [endpointDetails]);

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setApiKey(val);
    localStorage.setItem('paystack_secret_key', val);
  };

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const generateReference = () => {
    const ref = `ref_${Math.random().toString(36).substring(2, 12)}`;
    handleInputChange('reference', ref);
  };

  const generateIdempotencyKey = () => {
    const key = `idemp_${Math.random().toString(36).substring(2, 12)}`;
    handleInputChange('idempotency_key', key);
  };

  // Replace path parameters in URL like /transaction/verify/:reference or /transaction/verify/{reference}
  const getResolvedEndpoint = () => {
    let resolved = normPath;
    endpointDetails.parameters
      .filter((p) => p.in === 'path')
      .forEach((p) => {
        const val = formData[p.name] || p.example || `:${p.name}`;
        resolved = resolved.replace(`{${p.name}}`, String(val)).replace(`:${p.name}`, String(val));
      });
    return resolved;
  };

  // Build query string for GET
  const getQueryString = () => {
    if (!isGetMethod) return '';
    const queryParams = endpointDetails.parameters
      .filter((p) => p.in === 'query' && formData[p.name] !== undefined && formData[p.name] !== '')
      .map((p) => `${encodeURIComponent(p.name)}=${encodeURIComponent(formData[p.name])}`);
    return queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
  };

  // Extract non-path body data
  const getRequestBody = () => {
    const bodyData: Record<string, any> = {};
    endpointDetails.requestBodyFields.forEach((field) => {
      if (formData[field.name] !== undefined && formData[field.name] !== '') {
        // Convert integer fields if needed
        if (field.type === 'integer' || field.type === 'number') {
          bodyData[field.name] = Number(formData[field.name]);
        } else {
          bodyData[field.name] = formData[field.name];
        }
      }
    });
    return bodyData;
  };

  // Code Generators for fallback
  const getCurlSnippet = () => {
    const fullUrl = `https://api.paystack.co${getResolvedEndpoint()}${getQueryString()}`;
    if (isGetMethod) {
      return `curl "${fullUrl}" \\\n  -H "Authorization: Bearer ${apiKey || 'YOUR_SECRET_KEY'}"`;
    }
    const bodyObj = getRequestBody();
    const headers = [`-H "Authorization: Bearer ${apiKey || 'YOUR_SECRET_KEY'}"`, `-H "Content-Type: application/json"`];
    if (formData.idempotency_key) {
      headers.push(`-H "X-Idempotency-Key: ${formData.idempotency_key}"`);
    }
    return `curl -X POST "${fullUrl}" \\\n  ${headers.join(' \\\n  ')} \\\n  -d '${JSON.stringify(bodyObj, null, 2)}'`;
  };

  const getActiveSnippet = () => {
    if (xCodeSamples.length > 0) {
      const sample = xCodeSamples.find((s) => s.label === activeTab || s.lang === activeTab);
      if (sample) return sample.source;
    }

    if (activeTab === 'curl') return getCurlSnippet();

    const bodyObj = getRequestBody();
    if (activeTab === 'nodejs' || activeTab === 'JavaScript' || activeTab === 'js') {
      return `const response = await fetch("https://api.paystack.co${getResolvedEndpoint()}", {\n  method: "${normMethod}",\n  headers: {\n    "Authorization": "Bearer ${apiKey || 'YOUR_SECRET_KEY'}",\n    "Content-Type": "application/json"\n  },\n  body: JSON.stringify(${JSON.stringify(bodyObj, null, 2)})\n});\nconst data = await response.json();`;
    }
    if (activeTab === 'python' || activeTab === 'Python') {
      return `import requests\n\nheaders = {\n    "Authorization": "Bearer ${apiKey || 'YOUR_SECRET_KEY'}",\n    "Content-Type": "application/json"\n}\nresponse = requests.${normMethod.toLowerCase()}("https://api.paystack.co${getResolvedEndpoint()}", headers=headers, json=${JSON.stringify(bodyObj)})\nprint(response.json())`;
    }
    if (activeTab === 'php' || activeTab === 'PHP') {
      return `<?php\n$ch = curl_init();\ncurl_setopt($ch, CURLOPT_URL, "https://api.paystack.co${getResolvedEndpoint()}");\ncurl_setopt($ch, CURLOPT_RETURNTRANSFER, true);\ncurl_setopt($ch, CURLOPT_CUSTOMREQUEST, "${normMethod}");\ncurl_setopt($ch, CURLOPT_HTTPHEADER, [\n  "Authorization: Bearer ${apiKey || 'YOUR_SECRET_KEY'}",\n  "Content-Type: application/json"\n]);\n$response = curl_exec($ch);\ncurl_close($ch);`;
    }

    return getCurlSnippet();
  };

  const copySnippet = () => {
    navigator.clipboard.writeText(getActiveSnippet());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const executeApiCall = async () => {
    setLoading(true);
    setResponse(null);
    try {
      const fullPath = `${getResolvedEndpoint()}${getQueryString()}`;
      const body = !isGetMethod ? getRequestBody() : undefined;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }
      if (formData.idempotency_key) {
        headers['X-Idempotency-Key'] = formData.idempotency_key;
      }

      const res = await fetch('/api/paystack-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: fullPath,
          method: normMethod,
          headers,
          body,
        }),
      });

      const data = await res.json();
      setResponse(data);
    } catch (err: any) {
      setResponse({ status: 500, error: err.message || 'Failed to connect' });
    } finally {
      setLoading(false);
    }
  };

  const renderFieldInput = (field: ParameterField) => {
    const val = formData[field.name] !== undefined ? formData[field.name] : '';

    if (field.enum && field.enum.length > 0) {
      return (
        <select
          value={val}
          onChange={(e) => handleInputChange(field.name, e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors font-mono cursor-pointer"
        >
          {field.enum.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        type={field.name === 'email' ? 'email' : field.type === 'integer' || field.type === 'number' ? 'number' : 'text'}
        value={val}
        onChange={(e) => handleInputChange(field.name, e.target.value)}
        placeholder={field.example ? String(field.example) : `e.g. ${field.name}`}
        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
      />
    );
  };

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden text-slate-100 text-sm font-sans my-6">
      {/* Console Header */}
      <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 text-xs font-mono font-bold rounded ${
            isGetMethod
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
          }`}>
            {normMethod}
          </span>
          <span className="font-mono text-xs text-slate-300 font-semibold">{getResolvedEndpoint()}</span>
        </div>

        <div className="flex items-center gap-2">
          {xIdempotency && (
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Idempotent
            </span>
          )}
          {xRetrySafe && (
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Retry Safe
            </span>
          )}
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>
      </div>

      {/* Secret Key Input Section */}
      <div className="p-4 bg-slate-900/90 border-b border-slate-800/80">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
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
            onChange={handleKeyChange}
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

      {/* Interactive Form Controls from Spec */}
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            {isGetMethod ? 'URL & Query Parameters' : 'Request Payload'}
          </h4>
          <span className="text-[11px] text-slate-400 font-mono">application/json</span>
        </div>

        {xIdempotency && !isGetMethod && (
          <div className="space-y-1 bg-indigo-950/20 border border-indigo-900/40 p-3 rounded-xl">
            <div className="flex justify-between items-center">
              <label className="text-xs font-medium text-indigo-300 font-mono flex items-center gap-1">
                X-Idempotency-Key
              </label>
              <button
                type="button"
                onClick={generateIdempotencyKey}
                className="text-[10px] text-indigo-400 hover:underline font-mono font-medium"
              >
                Auto Generate Key
              </button>
            </div>
            <input
              type="text"
              value={formData.idempotency_key || ''}
              onChange={(e) => handleInputChange('idempotency_key', e.target.value)}
              placeholder="idemp_..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors font-mono"
            />
          </div>
        )}

        {allSpecFields.length > 0 ? (
          allSpecFields.map((field) => (
            <div key={field.name} className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-slate-300 font-mono flex items-center gap-1">
                  {field.name} {field.required && <span className="text-rose-400">*</span>}
                </label>
                <div className="flex items-center gap-2">
                  {field.name === 'reference' && (
                    <button
                      type="button"
                      onClick={generateReference}
                      className="text-[10px] text-emerald-400 hover:underline font-mono font-medium"
                    >
                      Generate Ref
                    </button>
                  )}
                  <span className="text-[10px] text-slate-400 font-mono">{field.type}</span>
                </div>
              </div>
              {renderFieldInput(field)}
              {field.description && (
                <p className="text-[10px] text-slate-400 font-sans leading-relaxed">{field.description}</p>
              )}
            </div>
          ))
        ) : (
          <div className="text-xs text-slate-400 font-mono py-2">
            No parameter body fields required for this endpoint.
          </div>
        )}
      </div>

      {/* Snippet Language Tabs & Code Preview */}
      <div className="border-t border-slate-800">
        <div className="bg-slate-950 px-3 py-2 flex items-center justify-between border-b border-slate-800 overflow-x-auto">
          <div className="flex items-center gap-1 font-mono text-[11px] overflow-x-auto">
            {xCodeSamples.length > 0 ? (
              xCodeSamples.map((sample) => (
                <button
                  key={sample.label}
                  onClick={() => setActiveTab(sample.label)}
                  className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
                    activeTab === sample.label
                      ? 'bg-slate-800 text-emerald-400 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {sample.label}
                </button>
              ))
            ) : (
              (['curl', 'nodejs', 'python', 'javascript', 'php'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    activeTab === tab
                      ? 'bg-slate-800 text-emerald-400 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab === 'curl' ? 'cURL' : tab === 'nodejs' ? 'Node' : tab === 'javascript' ? 'JS' : tab.toUpperCase()}
                </button>
              ))
            )}
          </div>
          <button
            onClick={copySnippet}
            className="text-[11px] font-mono text-slate-400 hover:text-slate-200 transition-colors px-2 py-1 rounded ml-2"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        <pre className="p-4 text-xs font-mono text-emerald-300/90 bg-slate-950 overflow-x-auto max-h-56 leading-relaxed">
          {getActiveSnippet()}
        </pre>
      </div>

      {/* Submit Button */}
      <div className="p-4 bg-slate-900 border-t border-slate-800">
        <button
          onClick={executeApiCall}
          disabled={loading}
          className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-900/30 transition-all flex items-center justify-center gap-2 text-xs disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4 text-slate-950" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Sending Request...</span>
            </>
          ) : (
            <>
              <span>Test Endpoint ({normMethod})</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </>
          )}
        </button>
      </div>

      {/* Response Panel */}
      {response && (
        <div className="border-t border-slate-800 bg-slate-950 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              Response Output
            </span>
            <span
              className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                response.status >= 200 && response.status < 300
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
      )}
    </div>
  );
};
