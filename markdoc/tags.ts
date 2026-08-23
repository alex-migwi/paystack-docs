export const apiExplorer = {
  render: 'ApiExplorer',
  attributes: {
    endpoint: { type: String, default: '/transaction/initialize' },
    method: { type: String, default: 'POST' },
    email: { type: String, default: 'customer@example.com' },
    amount: { type: Number, default: 20000 },
    currency: { type: String, default: 'NGN' },
    parameters: { type: Object, default: {} },
  },
};
