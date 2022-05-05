import {
  findNode,
  getStartPoint,
  select,
  TReactEditor,
} from '@udecode/plate-core';
import { focusEditor } from '@udecode/plate-core/dist/common/slate/react-editor/focusEditor';

/**
 * Select the start of a block by id and focus the editor.
 */
export const focusBlockStartById = (editor: TReactEditor, id: string) => {
  const path = findNode(editor, { at: [], match: { id } })?.[1];
  if (!path) return;

  select(editor, getStartPoint(editor, path));
  focusEditor(editor);
};
