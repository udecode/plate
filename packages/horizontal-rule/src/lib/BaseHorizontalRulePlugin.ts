import { createSlatePlugin } from '@udecode/plate';

export const BaseHorizontalRulePlugin = createSlatePlugin({
  key: 'hr',
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
});
