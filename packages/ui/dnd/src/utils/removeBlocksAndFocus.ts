import {
  EditorNodesOptions,
  TReactEditor,
  unhangRange,
} from '@udecode/plate-core';
import { focusEditor } from '@udecode/plate-core/dist/common/slate/react-editor/focusEditor';
import { Transforms } from 'slate';
import { getBlocksWithId } from './getBlocksWithId';
import { getNodesRange } from './getNodesRange';

/**
 * Remove blocks with an id and focus the editor.
 */
export const removeBlocksAndFocus = (
  editor: TReactEditor,
  options: EditorNodesOptions
) => {
  unhangRange(editor, options?.at, options);

  const nodeEntries = getBlocksWithId(editor, options);

  Transforms.removeNodes(editor, { at: getNodesRange(editor, nodeEntries) });
  focusEditor(editor);
};
