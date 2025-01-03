import type { TEditor } from '@udecode/slate';
import type { Location } from 'slate';

export interface SelectEditorOptions {
  /** Specific location if edge is not defined. */
  at?: Location;

  /** Start or end of the editor. */
  edge?: 'end' | 'start';

  /** If true, focus the React editor before selecting. */
  focus?: boolean;
}

/** Select an editor at a target or an edge (start, end). */
export const selectEditor = (
  editor: TEditor,
  { at, edge, focus }: SelectEditorOptions
) => {
  if (focus) {
    editor.tf.focus();
  }

  let location = at as Location;

  if (edge === 'start') {
    location = editor.api.start([])!;
  }
  if (edge === 'end') {
    location = editor.api.end([])!;
  }
  if (location) {
    editor.tf.select(location);
  }
};
