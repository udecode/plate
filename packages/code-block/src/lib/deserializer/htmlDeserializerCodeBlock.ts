import type { HtmlDeserializer } from '@udecode/plate';

import { KEYS } from '@udecode/plate';

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

    let lines = textContent.split('\n');

    if (!lines?.length) {
      lines = [textContent];
    }

    const codeLines = lines.map((line) => ({
      children: [{ text: line }],
      type: KEYS.codeLine,
    }));

    return {
      children: codeLines,
      type: KEYS.codeBlock,
    };
  },
};
