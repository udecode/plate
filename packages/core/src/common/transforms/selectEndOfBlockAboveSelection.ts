import { Editor, Path, Transforms } from 'slate';
import { TEditor } from '../../types/slate/TEditor';
import { getBlockAbove } from '../queries/index';

/**
 * Select the end point of the block above the selection.
 */
export const selectEndOfBlockAboveSelection = (editor: TEditor) => {
  const path = getBlockAbove(editor)?.[1];

  path && Transforms.select(editor, Editor.end(editor, path as Path));
};
