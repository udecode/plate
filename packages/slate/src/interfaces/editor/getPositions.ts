import { Editor, type EditorPositionsOptions } from 'slate';

import type { TEditor } from './TEditor';

/**
 * Iterate through all of the positions in the document where a `Point` can be
 * placed.
 *
 * By default it will move forward by individual offsets at a time, but you can
 * pass the `unit: 'character'` option to moved forward one character, word, or
 * line at at time.
 *
 * Note: By default void nodes are treated as a single point and iteration will
 * not happen inside their content unless you pass in true for the voids option,
 * then iteration will occur.
 */
export const getPositions = (
  editor: TEditor,
  options?: EditorPositionsOptions
) => Editor.positions(editor as any, options);
