import { createBasePlugin } from '@platejs/core';
import { KEYS } from '@platejs/utils';

export const BaseHorizontalRulePlugin = createBasePlugin({
  key: KEYS.hr,
  schema: {
    element: {
      void: 'block',
    },
  },
  parsers: {
    html: {
      deserializer: {
        rules: [
          {
            validNodeName: 'HR',
          },
        ],
      },
    },
  },
  render: { as: 'hr' },
});
