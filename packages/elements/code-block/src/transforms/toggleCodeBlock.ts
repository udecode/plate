import { getNodes, setNodes, someNode, wrapNodes } from '@udecode/plate-common';
import { SPEditor, TElement } from '@udecode/plate-core';
import { getCodeBlockType, getCodeLineType } from '../options';
import { unwrapCodeBlock } from './unwrapCodeBlock';

export const toggleCodeBlock = (editor: SPEditor) => {
  if (!editor.selection) return;

  const isActive = someNode(editor, {
    match: { type: getCodeBlockType(editor) },
  });

  unwrapCodeBlock(editor);

  setNodes<TElement>(editor, {
    type: getCodeLineType(editor),
  });

  if (!isActive) {
    const codeBlock = {
      type: getCodeBlockType(editor),
      children: [],
    };
    wrapNodes(editor, codeBlock);

    const nodes = [
      ...getNodes(editor, {
        match: { type: getCodeLineType(editor) },
      }),
    ];

    const codeLine = {
      type: getCodeBlockType(editor),
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
