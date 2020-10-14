import { Ancestor, Editor, Location, NodeEntry } from 'slate';
import { EditorParentOptions } from '../types/Editor.types';

/**
 * See {@link Editor.parent}.
 * Returns undefined if there is no parent.
 */
export const getParent = (
  editor: Editor,
  at: Location,
  options?: EditorParentOptions
): NodeEntry<Ancestor> | undefined => {
  try {
    return Editor.parent(editor, at, options);
  } catch (err) {}
};
