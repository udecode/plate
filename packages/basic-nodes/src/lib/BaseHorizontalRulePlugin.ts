import { createSlatePlugin, KEYS } from '@udecode/plate';

export const BaseHorizontalRulePlugin = createSlatePlugin({
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
