import { createSlatePlugin } from '@udecode/plate-common';

export const HorizontalRulePlugin = createSlatePlugin({
  isElement: true,
  isVoid: true,
  key: 'hr',
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
