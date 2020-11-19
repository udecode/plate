import { Editor } from 'slate';
import { EditorNodesOptions } from '../types/Editor.types';
import { getNodesById } from './getNodesById';

/**
 * Get the first editor node entry found by id.
 */
export const getNodeById = (
  editor: Editor,
  id: string | string[],
  editorNodesOptions?: EditorNodesOptions
) => {
  return getNodesById(editor, id, editorNodesOptions)?.[0];
};
