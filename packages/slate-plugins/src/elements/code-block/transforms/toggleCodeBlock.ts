import { getNodes, someNode, wrapNodes } from '@udecode/slate-plugins-common';
import { getPluginType } from '@udecode/slate-plugins-core';
import { Editor, Transforms } from 'slate';
import { ELEMENT_CODE_BLOCK, ELEMENT_CODE_LINE } from '../defaults';
import { unwrapCodeBlock } from './unwrapCodeBlock';

export const toggleCodeBlock = (editor: Editor) => {
  if (!editor.selection) return;

  const isActive = someNode(editor, {
    match: { type: getPluginType(editor, ELEMENT_CODE_BLOCK) },
  });

  unwrapCodeBlock(editor);

  Transforms.setNodes(editor, {
    type: getPluginType(editor, ELEMENT_CODE_LINE),
  });

  if (!isActive) {
    const codeBlock = {
      type: getPluginType(editor, ELEMENT_CODE_BLOCK),
      children: [],
    };
    wrapNodes(editor, codeBlock);

    const nodes = [
      ...getNodes(editor, {
        match: { type: getPluginType(editor, ELEMENT_CODE_LINE) },
      }),
    ];

    const codeLine = {
      type: getPluginType(editor, ELEMENT_CODE_BLOCK),
      children: [],
    };

    for (const [, path] of nodes) {
      // Transforms.wrapNodes(editor, codeLine, {
      Transforms.setNodes(editor, codeLine, {
        at: path,
      });
    }
  }
};
