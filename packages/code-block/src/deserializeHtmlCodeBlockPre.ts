import { DeserializeHtml } from '@udecode/plate-common';

import { ELEMENT_CODE_BLOCK, ELEMENT_CODE_LINE } from './constants';

export const deserializeHtmlCodeBlock: DeserializeHtml = {
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
  getNode: (el) => {
    const languageSelectorText =
      [...el.childNodes].find((node: ChildNode) => node.nodeName === 'SELECT')
        ?.textContent || '';

    const textContent = el.textContent?.replace(languageSelectorText, '') || '';

    let lines = textContent.split('\n');

    if (!lines?.length) {
      lines = [textContent];
    }

    const codeLines = lines.map((line) => ({
      type: ELEMENT_CODE_LINE,
      children: [{ text: line }],
    }));

    return {
      type: ELEMENT_CODE_BLOCK,
      children: codeLines,
    };
  },
};
