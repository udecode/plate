import { Editor } from 'slate';
import { EditorNodesOptions } from '../types/Editor.types';
import { getNodesByType } from './getNodesByType';

/**
 * Is there a node with a type included in `types` in a location (default: selection).
 */
export const isNodeTypeIn = (
  editor: Editor,
  types: string[] | string,
  options: Omit<EditorNodesOptions, 'match'> = {}
) => {
  const [match] = getNodesByType(editor, types, options);
  return !!match;
};
