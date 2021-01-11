import { Editor } from 'slate';
import { EditorNodesOptions } from '../types/Editor.types';
import { getNodesByType } from './getNodesByType';

/**
 * Has any node with a type included in `types` at a location (default: selection).
 */
export const hasNodeByType = (
  editor: Editor,
  types: string[] | string,
  options: Omit<EditorNodesOptions, 'match'> = {}
) => {
  const [match] = getNodesByType(editor, types, options);
  return !!match;
};
