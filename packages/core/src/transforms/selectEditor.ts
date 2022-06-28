import { Location } from 'slate';
import { getEndPoint } from '../slate/editor/getEndPoint';
import { getStartPoint } from '../slate/editor/getStartPoint';
import { Value } from '../slate/editor/TEditor';
import { focusEditor } from '../slate/react-editor/focusEditor';
import { TReactEditor } from '../slate/react-editor/TReactEditor';
import { select } from '../slate/transforms/select';

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
