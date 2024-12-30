import type { EditorPathRefOptions } from 'slate/dist/interfaces/editor';

import { type Path, Editor } from 'slate';

import type { TEditor } from './TEditor';

export const createPathRef = (
  editor: TEditor,
  at: Path,
  options?: EditorPathRefOptions
) => Editor.pathRef(editor as any, at, options as any);
