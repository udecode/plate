import { Editor, Location, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';

export interface SelectEditorOptions {
  /**
   * Specific location if edge is not defined.
   */
  at?: Location;

  /**
   * Start or end of the editor.
   */
  edge?: 'start' | 'end';

  /**
   * If true, focus the React editor before selecting.
   */
  focus?: boolean;
}

/**
 * Select an editor at a target or an edge (start, end).
 */
export const selectEditor = (
  editor: ReactEditor,
  { at, edge, focus }: SelectEditorOptions
) => {
  if (focus) {
    ReactEditor.focus(editor);
  }

  let location = at as Location;

  if (edge === 'start') {
    location = Editor.start(editor, []);
  }

  if (edge === 'end') {
    location = Editor.end(editor, []);
  }

  if (location) {
    Transforms.select(editor, location);
  }
};
