import { createSlatePlugin } from '@udecode/plate-common';

export const HorizontalRulePlugin = createSlatePlugin({
  deserializeHtml: {
    rules: [
      {
        validNodeName: 'HR',
      },
    ],
  },
  isElement: true,
  isVoid: true,
  key: 'hr',
});
