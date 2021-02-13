import { Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { unhangRange } from '../../common/transforms/unhangRange';
import { EditorNodesOptions } from '../../common/types/Editor.types';
import { getBlocksWithId } from './getBlocksWithId';
import { getNodesRange } from './getNodesRange';

/**
 * Remove blocks with an id and focus the editor.
 */
export const removeBlocksAndFocus = (
  editor: ReactEditor,
  options: EditorNodesOptions
) => {
  unhangRange(editor, options);

  const nodeEntries = getBlocksWithId(editor, options);

  Transforms.removeNodes(editor, { at: getNodesRange(editor, nodeEntries) });
  ReactEditor.focus(editor);
};
