import type { Editor, TLocation } from '@udecode/slate';

export interface SelectEditorOptions {
  /** Specific location if edge is not defined. */
  at?: TLocation;

  /** Start or end of the editor. */
  edge?: 'end' | 'start';

  /** If true, focus the React editor before selecting. */
  focus?: boolean;
}

/** Select an editor at a target or an edge (start, end). */
export const selectEditor = (
  editor: Editor,
  { at, edge, focus }: SelectEditorOptions
) => {
  if (focus) {
    editor.tf.focus();
  }

  let location = at as TLocation;

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
