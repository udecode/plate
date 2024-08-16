import { createPlugin } from '@udecode/plate-common';

export const HorizontalRulePlugin = createPlugin({
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
