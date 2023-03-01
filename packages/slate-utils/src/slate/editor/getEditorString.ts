import { Editor, Location } from 'slate';
import { EditorStringOptions } from 'slate/dist/interfaces/editor';
import { TEditor, Value } from './TEditor';

/**
 * Get the text string content of a location.
 *
 * Note: by default the text of void nodes is considered to be an empty
 * string, regardless of content, unless you pass in true for the voids option
 */
export const getEditorString = <V extends Value>(
  editor: TEditor<V>,
  at: Location | null | undefined,
  options?: EditorStringOptions
) => {
  if (!at) return '';

  try {
    return Editor.string(editor as any, at, options);
  } catch (error) {
    return '';
  }
};
