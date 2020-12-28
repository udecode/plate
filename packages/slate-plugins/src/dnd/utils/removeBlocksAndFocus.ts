import { EditorNodesOptions, unhangRange } from '@udecode/slate-plugins-common';
import { Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { getBlocks } from './getBlocks';
import { getNodesRange } from './getNodesRange';

/**
 * Remove blocks with an id and focus the editor.
 */
export const removeBlocksAndFocus = (
  editor: ReactEditor,
  options: EditorNodesOptions
) => {
  unhangRange(editor, options);

  const nodeEntries = getBlocks(editor, options);

  Transforms.removeNodes(editor, { at: getNodesRange(editor, nodeEntries) });
  ReactEditor.focus(editor);
};
