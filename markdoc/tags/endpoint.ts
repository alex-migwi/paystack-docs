export const endpoint = {
  render: 'EndpointBadge',
  attributes: {
    method: { type: String, default: 'POST' },
    path: { type: String, default: '/transaction/initialize' },
  },
};

export default endpoint;
