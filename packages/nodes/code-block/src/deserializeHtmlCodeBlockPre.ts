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
    const codeBlockNode = [...el.childNodes].find(
      (node: ChildNode) => node.nodeName === 'CODE'
    );

    if (!codeBlockNode) return;

    const codeBlockTextContent = codeBlockNode.textContent;
    let lines = codeBlockTextContent?.split('\n');

    if (!lines?.length) {
      lines = [codeBlockTextContent ?? ''];
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
