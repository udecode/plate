import {
  getNodes,
  getPluginType,
  PlateEditor,
  setNodes,
  someNode,
  TElement,
  Value,
  wrapNodes,
} from '@udecode/plate-core';
import { ELEMENT_CODE_BLOCK } from '../constants';
import { getCodeLineType } from '../options';
import { unwrapCodeBlock } from './unwrapCodeBlock';

export const toggleCodeBlock = <V extends Value>(editor: PlateEditor<V>) => {
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

    const _nodes = getNodes(editor, {
      match: { type: getCodeLineType(editor) },
    });
    const nodes = Array.from(_nodes);

    const codeLine = {
      type: codeBlockType,
      children: [],
    };

    for (const [, path] of nodes) {
      setNodes<TElement>(editor, codeLine, {
        at: path,
      });
    }
  }
};
