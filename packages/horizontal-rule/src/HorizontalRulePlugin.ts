import { createPlugin } from '@udecode/plate-common';

export const ELEMENT_HR = 'hr';

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
  key: ELEMENT_HR,
});
