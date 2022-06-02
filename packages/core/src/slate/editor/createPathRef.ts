import { Editor, Path } from 'slate';
import { EditorPathRefOptions } from 'slate/dist/interfaces/editor';
import { TEditor, Value } from './TEditor';

/**
 * Create a mutable ref for a `Path` object, which will stay in sync as new
 * operations are applied to the editor.
 */
export const createPathRef = <V extends Value>(
  editor: TEditor<V>,
  at: Path,
  options?: EditorPathRefOptions
) => Editor.pathRef(editor as any, at, options as any);
