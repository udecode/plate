import { Editor, Path } from 'slate';
import { TEditor, Value } from './TEditor';

export type CreatePathRefOptions = Parameters<typeof Editor.pathRef>[2];

/**
 * Create a mutable ref for a `Path` object, which will stay in sync as new
 * operations are applied to the editor.
 */
export const createPathRef = <V extends Value>(
  editor: TEditor<V>,
  at: Path,
  options?: CreatePathRefOptions
) => Editor.pathRef(editor as any, at, options as any);
