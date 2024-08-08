import type { DeserializeHtml } from '@udecode/plate-common/server';

import { ELEMENT_CODE_BLOCK, ELEMENT_CODE_LINE } from './constants';

export const deserializeHtmlCodeBlock: DeserializeHtml = {
  getNode: ({ element }) => {
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
      type: ELEMENT_CODE_LINE,
    }));

    return {
      children: codeLines,
      type: ELEMENT_CODE_BLOCK,
    };
  },
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
};
