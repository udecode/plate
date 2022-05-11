import { Editor, Point } from 'slate';
import { TEditor, Value } from './TEditor';

export type CreatePointRefOptions = Parameters<typeof Editor.pointRef>[2];

/**
 * Create a mutable ref for a `Point` object, which will stay in sync as new
 * operations are applied to the editor.
 */
export const createPointRef = <V extends Value>(
  editor: TEditor<V>,
  point: Point,
  options?: CreatePointRefOptions
) => Editor.pointRef(editor as any, point, options as any);
