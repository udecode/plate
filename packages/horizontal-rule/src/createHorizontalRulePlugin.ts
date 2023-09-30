import { createPluginFactory } from '@udecode/plate-common';

export const ELEMENT_HR = 'hr';

export const createHorizontalRulePlugin = createPluginFactory({
  key: ELEMENT_HR,
  isElement: true,
  isVoid: true,
  deserializeHtml: {
    rules: [
      {
        validNodeName: 'HR',
      },
    ],
  },
});
