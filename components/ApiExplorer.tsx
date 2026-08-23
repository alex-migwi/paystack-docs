import React, { useState, useEffect } from 'react';
import { getEndpointDetails, ParameterField } from '../lib/openapi';
import { SecretKeyInput } from './api-explorer/SecretKeyInput';
import { CodeSampleTabs } from './api-explorer/CodeSampleTabs';
import { ResponseViewer } from './api-explorer/ResponseViewer';

interface ApiExplorerProps {
  endpoint?: string;
  method?: string;
  reference?: string;
  parameters?: Record<string, any>;
  initialValues?: Record<string, any>;
}

export const ApiExplorer: React.FC<ApiExplorerProps> = ({
  endpoint = '/transaction/initialize',
  method = 'POST',
  reference,
  parameters,
  initialValues,
}) => {
  const normMethod = method.toUpperCase();
  const normPath = endpoint;

  const [apiKey, setApiKey] = useState('');
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);

  const endpointDetails = getEndpointDetails(normPath, normMethod);
  const allSpecFields = [...endpointDetails.parameters, ...endpointDetails.requestBodyFields];
  const isGetMethod = normMethod === 'GET';

  const xCodeSamples = endpointDetails.xCodeSamples || [];
  const xIdempotency = Boolean(endpointDetails.xIdempotency);
  const xRetrySafe = Boolean(endpointDetails.xRetrySafe);

  useEffect(() => {
    const storedKey = localStorage.getItem('paystack_secret_key');
    if (storedKey) setApiKey(storedKey);

    const initialData: Record<string, any> = { ...(parameters || initialValues || {}) };
    allSpecFields.forEach((field) => {
      if (initialData[field.name] === undefined) {
        if (field.example !== undefined) {
          initialData[field.name] = field.example;
        } else if (field.enum && field.enum.length > 0) {
          initialData[field.name] = field.enum[0];
        }
      }
    });

    if (reference) initialData['reference'] = reference;
    if (xIdempotency && !initialData['idempotency_key']) {
      initialData['idempotency_key'] = `idemp_${Math.random().toString(36).substring(2, 10)}`;
    }

    setFormData(initialData);
  }, [endpoint, method]);

  const handleKeyChange = (key: string) => {
    setApiKey(key);
    localStorage.setItem('paystack_secret_key', key);
  };

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const generateReference = () => {
    handleInputChange('reference', `ref_${Math.random().toString(36).substring(2, 12)}`);
  };

  const generateIdempotencyKey = () => {
    handleInputChange('idempotency_key', `idemp_${Math.random().toString(36).substring(2, 12)}`);
  };

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

  const getRequestBody = () => {
    if (isGetMethod) return undefined;
    const bodyObj: Record<string, any> = {};
    endpointDetails.requestBodyFields.forEach((field) => {
      if (formData[field.name] !== undefined && formData[field.name] !== '') {
        if (field.type === 'integer' || field.type === 'number') {
          bodyObj[field.name] = Number(formData[field.name]);
        } else if (field.type === 'boolean') {
          bodyObj[field.name] = Boolean(formData[field.name]);
        } else {
          bodyObj[field.name] = formData[field.name];
        }
      }
    });
    return Object.keys(bodyObj).length > 0 ? bodyObj : undefined;
  };

  const executeApiCall = async () => {
    setLoading(true);
    setResponse(null);
    try {
      const fullPath = getResolvedEndpoint();
      const body = getRequestBody();

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;
      if (formData.idempotency_key) headers['X-Idempotency-Key'] = formData.idempotency_key;

      const res = await fetch('/api/paystack-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: fullPath, method: normMethod, headers, body }),
      });

      const data = await res.json();
      setResponse(data);
    } catch (err: any) {
      setResponse({ status: 500, error: err.message || 'Failed to connect' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden text-slate-100 text-sm font-sans my-6">
      {/* Header */}
      <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 text-xs font-mono font-bold rounded ${
            isGetMethod ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
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
        </div>
      </div>

      {/* Secret Key Input */}
      <SecretKeyInput apiKey={apiKey} onKeyChange={handleKeyChange} />

      {/* Form Controls */}
      <div className="p-4 space-y-4">
        {xIdempotency && !isGetMethod && (
          <div className="space-y-1 bg-indigo-950/20 border border-indigo-900/40 p-3 rounded-xl">
            <div className="flex justify-between items-center">
              <label className="text-xs font-medium text-indigo-300 font-mono">X-Idempotency-Key</label>
              <button
                type="button"
                onClick={generateIdempotencyKey}
                className="text-[10px] text-indigo-400 hover:underline font-mono"
              >
                Auto Generate Key
              </button>
            </div>
            <input
              type="text"
              value={formData.idempotency_key || ''}
              onChange={(e) => handleInputChange('idempotency_key', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono"
            />
          </div>
        )}

        {allSpecFields.map((field) => (
          <div key={field.name} className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-medium text-slate-300 font-mono">
                {field.name} {field.required && <span className="text-rose-400">*</span>}
              </label>
              {field.name === 'reference' && (
                <button
                  type="button"
                  onClick={generateReference}
                  className="text-[10px] text-emerald-400 hover:underline font-mono"
                >
                  Generate Ref
                </button>
              )}
            </div>
            {field.enum && field.enum.length > 0 ? (
              <select
                value={formData[field.name] || ''}
                onChange={(e) => handleInputChange(field.name, e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono"
              >
                {field.enum.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <input
                type={field.type === 'integer' || field.type === 'number' ? 'number' : 'text'}
                value={formData[field.name] !== undefined ? formData[field.name] : ''}
                onChange={(e) => handleInputChange(field.name, e.target.value)}
                placeholder={field.example ? String(field.example) : `e.g. ${field.name}`}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono"
              />
            )}
          </div>
        ))}
      </div>

      {/* Code Sample Selector Tabs from Enriched Spec */}
      <CodeSampleTabs codeSamples={xCodeSamples} />

      {/* Submit Button */}
      <div className="p-4 bg-slate-900 border-t border-slate-800">
        <button
          onClick={executeApiCall}
          disabled={loading}
          className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl shadow-lg transition-all text-xs disabled:opacity-50 cursor-pointer"
        >
          {loading ? 'Sending Request...' : `Test Endpoint (${normMethod})`}
        </button>
      </div>

      {/* Response Panel */}
      <ResponseViewer response={response} />
    </div>
  );
};
