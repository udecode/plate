import { getNodes, setNodes, someNode, wrapNodes } from '@udecode/plate-common';
import { getPlatePluginType, SPEditor, TElement } from '@udecode/plate-core';
import { ELEMENT_CODE_BLOCK, ELEMENT_CODE_LINE } from '../defaults';
import { unwrapCodeBlock } from './unwrapCodeBlock';

export const toggleCodeBlock = (editor: SPEditor) => {
  if (!editor.selection) return;

  const isActive = someNode(editor, {
    match: { type: getPlatePluginType(editor, ELEMENT_CODE_BLOCK) },
  });

  unwrapCodeBlock(editor);

  setNodes<TElement>(editor, {
    type: getPlatePluginType(editor, ELEMENT_CODE_LINE),
  });

  if (!isActive) {
    const codeBlock = {
      type: getPlatePluginType(editor, ELEMENT_CODE_BLOCK),
      children: [],
    };
    wrapNodes(editor, codeBlock);

    const nodes = [
      ...getNodes(editor, {
        match: { type: getPlatePluginType(editor, ELEMENT_CODE_LINE) },
      }),
    ];

    const codeLine = {
      type: getPlatePluginType(editor, ELEMENT_CODE_BLOCK),
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
