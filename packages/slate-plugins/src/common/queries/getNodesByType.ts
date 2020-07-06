import { castArray } from 'lodash';
import { Editor } from 'slate';
import { EditorNodesOptions } from '../types/Editor.types';
import { getNodes } from './getNodes';

/**
 * Get the nodes with a type included in `types` at a location (default: selection).
 */
export const getNodesByType = (
  editor: Editor,
  types: string[] | string,
  options: Omit<EditorNodesOptions, 'match'> = {}
) => {
  types = castArray<string>(types);

  return getNodes(editor, {
    match: (n) => types.includes(n.type as string),
    ...options,
  });
};
