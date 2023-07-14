import { getEndPoint, getStartPoint, select, Value } from '@udecode/slate';
import { focusEditor, TReactEditor } from '@udecode/slate-react';
import { Location } from 'slate';

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
export const selectEditor = <V extends Value>(
  editor: TReactEditor<V>,
  { at, edge, focus }: SelectEditorOptions
) => {
  if (focus) {
    focusEditor(editor);
  }

  let location = at as Location;

  if (edge === 'start') {
    location = getStartPoint(editor, []);
  }

  if (edge === 'end') {
    location = getEndPoint(editor, []);
  }

  if (location) {
    select(editor, location);
  }
};
