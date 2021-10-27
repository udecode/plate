import {
  EditorNodesOptions,
  getNodes,
  setNodes,
  UnhangRangeOptions,
} from '@udecode/plate-common';
import { TEditor } from '@udecode/plate-core';
import { Transforms } from 'slate';

/**
 * Add offset to the indentation of the selected blocks.
 */
export const setIndent = (
  editor: TEditor,
  {
    offset,
    ...options
  }: EditorNodesOptions & UnhangRangeOptions & { offset: number }
) => {
  const nodes = Array.from(
    getNodes(editor, {
      block: true,
      ...options,
    })
  );

  nodes.forEach(([node, path]) => {
    const blockIndent = node.indent ?? 0;
    const newIndent = blockIndent + offset;

    if (newIndent <= 0) {
      Transforms.unsetNodes(editor, 'indent', { at: path });
    } else {
      setNodes(editor, { indent: newIndent }, { at: path });
    }
  });
};
