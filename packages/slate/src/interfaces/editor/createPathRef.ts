import type { EditorPathRefOptions } from 'slate/dist/interfaces/editor';

import { Editor, type Path } from 'slate';

import type { TEditor } from './TEditor';

/**
 * Create a mutable ref for a `Path` object, which will stay in sync as new
 * operations are applied to the editor.
 */
export const createPathRef = (
  editor: TEditor,
  at: Path,
  options?: EditorPathRefOptions
) => Editor.pathRef(editor as any, at, options as any);
