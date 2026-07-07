import { createBasePlugin } from '@platejs/core';
import { KEYS } from '@platejs/utils';

export const BaseHorizontalRulePlugin = createBasePlugin({
  key: KEYS.hr,
  node: { isElement: true, isVoid: true },
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
