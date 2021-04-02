import {
  getNodes,
  setNodes,
  someNode,
  wrapNodes,
} from '@udecode/slate-plugins-common';
import {
  getSlatePluginType,
  SPEditor,
  TElement,
} from '@udecode/slate-plugins-core';
import { ELEMENT_CODE_BLOCK, ELEMENT_CODE_LINE } from '../defaults';
import { unwrapCodeBlock } from './unwrapCodeBlock';

export const toggleCodeBlock = (editor: SPEditor) => {
  if (!editor.selection) return;

  const isActive = someNode(editor, {
    match: { type: getSlatePluginType(editor, ELEMENT_CODE_BLOCK) },
  });

  unwrapCodeBlock(editor);

  setNodes<TElement>(editor, {
    type: getSlatePluginType(editor, ELEMENT_CODE_LINE),
  });

  if (!isActive) {
    const codeBlock = {
      type: getSlatePluginType(editor, ELEMENT_CODE_BLOCK),
      children: [],
    };
    wrapNodes(editor, codeBlock);

    const nodes = [
      ...getNodes(editor, {
        match: { type: getSlatePluginType(editor, ELEMENT_CODE_LINE) },
      }),
    ];

    const codeLine = {
      type: getSlatePluginType(editor, ELEMENT_CODE_BLOCK),
      children: [],
    };

    for (const [, path] of nodes) {
      // Transforms.wrapNodes(editor, codeLine, {
      setNodes<TElement>(editor, codeLine, {
        at: path,
      });
    }
  }
};
