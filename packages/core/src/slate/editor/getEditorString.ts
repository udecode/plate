import { Editor, Location } from 'slate';
import { TEditor, Value } from './TEditor';

export type GetEditorStringOptions = Parameters<typeof Editor.string>[2];

/**
 * Get the text string content of a location.
 *
 * Note: by default the text of void nodes is considered to be an empty
 * string, regardless of content, unless you pass in true for the voids option
 */
export const getEditorString = <V extends Value>(
  editor: TEditor<V>,
  at: Location | null | undefined,
  options?: GetEditorStringOptions
) => (at ? Editor.string(editor as any, at, options) : '');
