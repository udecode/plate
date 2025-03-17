import type { HtmlDeserializer } from '@udecode/plate';

import {
  BaseCodeBlockPlugin,
  BaseCodeLinePlugin,
} from '../BaseCodeBlockPlugin';

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
      type: BaseCodeLinePlugin.key,
    }));

    return {
      children: codeLines,
      type: BaseCodeBlockPlugin.key,
    };
  },
};
