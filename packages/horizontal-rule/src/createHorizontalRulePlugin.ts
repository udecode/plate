import { createPluginFactory } from '@udecode/plate-common/server';

export const ELEMENT_HR = 'hr';

export const createHorizontalRulePlugin = createPluginFactory({
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
