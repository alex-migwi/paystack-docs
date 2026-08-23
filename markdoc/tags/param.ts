export const param = {
  render: 'ParamCard',
  attributes: {
    name: { type: String, required: true },
    type: { type: String, required: true },
    required: { type: Boolean, default: false },
    description: { type: String, required: true },
    example: { type: String },
  },
};

export default param;
