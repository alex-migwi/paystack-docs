import type { AppProps } from 'next/app';
import React from 'react';
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
  return <Component {...pageProps} components={components} />;
}
