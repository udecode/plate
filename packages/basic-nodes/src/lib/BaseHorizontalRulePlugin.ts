import { createBasePlugin } from '@platejs/core';
import { KEYS } from '@platejs/utils';

export const BaseHorizontalRulePlugin = createBasePlugin({
  key: KEYS.hr,
  schema: {
    element: {
      void: 'block',
    },
  },
  render: { as: 'hr' },
}).extendHtmlCodec(() => ({
  decode: () => ({}),
  encode: () => ({ tag: 'hr' }),
  match: [{ tag: 'hr' }],
}));
