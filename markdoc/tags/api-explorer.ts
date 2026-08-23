export const apiExplorer = {
  render: 'ApiExplorer',
  attributes: {
    endpoint: { type: String, default: '/transaction/initialize' },
    method: { type: String, default: 'POST' },
  },
};

export default apiExplorer;
