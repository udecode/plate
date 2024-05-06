import type { EditorPointRefOptions } from 'slate/dist/interfaces/editor';

import { Editor, type Point } from 'slate';

import type { TEditor, Value } from './TEditor';

/**
 * Create a mutable ref for a `Point` object, which will stay in sync as new
 * operations are applied to the editor.
 */
export const createPointRef = <V extends Value>(
  editor: TEditor<V>,
  point: Point,
  options?: EditorPointRefOptions
) => Editor.pointRef(editor as any, point, options as any);
