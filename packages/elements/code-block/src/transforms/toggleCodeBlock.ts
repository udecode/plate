import {
  getNodes,
  getPluginType,
  PlateEditor,
  setNodes,
  someNode,
  TElement,
  wrapNodes,
} from '@udecode/plate-core';
import { ELEMENT_CODE_BLOCK } from '../constants';
import { getCodeLineType } from '../options';
import { unwrapCodeBlock } from './unwrapCodeBlock';

export const toggleCodeBlock = (editor: PlateEditor) => {
  if (!editor.selection) return;

  const codeBlockType = getPluginType(editor, ELEMENT_CODE_BLOCK);

  const isActive = someNode(editor, {
    match: { type: codeBlockType },
  });

  unwrapCodeBlock(editor);

  setNodes<TElement>(editor, {
    type: getCodeLineType(editor),
  });

  if (!isActive) {
    const codeBlock = {
      type: codeBlockType,
      children: [],
    };
    wrapNodes(editor, codeBlock);

    const nodes = [
      ...getNodes(editor, {
        match: { type: getCodeLineType(editor) },
      }),
    ];

    const codeLine = {
      type: codeBlockType,
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
