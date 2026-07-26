import { createBasePlugin } from '@platejs/core';
import { KEYS } from '@platejs/utils';

export const BaseHorizontalRulePlugin = createBasePlugin({
  key: KEYS.hr,
  schema: {
    element: {
      void: 'block',
    },
  },
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/html': {
        decode: () => ({}),
        encode: () => ({ tag: 'hr' }),
        match: [{ tag: 'hr' }],
      },
    }),

  render: { as: 'hr' },
});
