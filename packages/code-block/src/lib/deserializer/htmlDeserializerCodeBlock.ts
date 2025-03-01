import type { HtmlDeserializer } from '@udecode/plate';

import { BaseCodeBlockPlugin } from '../BaseCodeBlockPlugin';

export const htmlDeserializerCodeBlock: HtmlDeserializer = {
  rules: [
    {
      validNodeName: 'PRE',
    },
    {
      validNodeName: 'P',
      validStyle: {
        fontFamily: 'Consolas',
      },
    },
  ],
  parse: ({ element }) => {
    const languageSelectorText =
      [...element.childNodes].find(
        (node: ChildNode) => node.nodeName === 'SELECT'
      )?.textContent || '';

    const textContent =
      element.textContent?.replace(languageSelectorText, '') || '';

    return {
      children: [{ text: textContent }],
      type: BaseCodeBlockPlugin.key,
    };
  },
};
