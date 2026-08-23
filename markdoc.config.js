import { apiExplorer } from './markdoc/tags/api-explorer';
import { endpoint } from './markdoc/tags/endpoint';
import { callout } from './markdoc/tags/callout';
import { param } from './markdoc/tags/param';

export default {
  tags: {
    apiExplorer,
    apiexplorer: apiExplorer,
    'api-explorer': apiExplorer,
    api_explorer: apiExplorer,
    endpoint,
    callout,
    param,
  },
};
