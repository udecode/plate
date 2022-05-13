import {
  getNodeEntries,
  getPluginType,
  PlateEditor,
  setElements,
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

  setElements(editor, {
    type: getCodeLineType(editor),
  });

  if (!isActive) {
    const codeBlock = {
      type: codeBlockType,
      children: [],
    };
    wrapNodes<TElement>(editor, codeBlock);

    const _nodes = getNodeEntries(editor, {
      match: { type: getCodeLineType(editor) },
    });
    const nodes = Array.from(_nodes);

    const codeLine = {
      type: codeBlockType,
      children: [],
    };

    for (const [, path] of nodes) {
      setElements(editor, codeLine, {
        at: path,
      });
    }
  }
};
