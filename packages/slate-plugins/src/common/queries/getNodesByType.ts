import { castArray } from 'lodash';
import { Editor } from 'slate';
import { EditorNodesOptions } from '../types/Editor.types';

/**
 * Get the nodes with a type included in `types` at a location (default: selection).
 */
export const getNodesByType = (
  editor: Editor,
  types: string[] | string,
  options: Omit<EditorNodesOptions, 'match'> = {}
) => {
  types = castArray<string>(types);

  return Editor.nodes(editor, {
    match: (n) => {
      return types.includes(n.type as string);
    },
    at: editor.selection ? Editor.unhangRange(editor, editor.selection) : undefined,
    ...options,
  });
};
