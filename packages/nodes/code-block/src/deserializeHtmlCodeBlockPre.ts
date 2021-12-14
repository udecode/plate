import { DeserializeHtml } from '@udecode/plate-core';
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
    let lines = el.textContent?.split('\n');

    if (!lines?.length) {
      lines = [el.textContent ?? ''];
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
