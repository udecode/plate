import type { EditorPathRefOptions } from 'slate/dist/interfaces/editor';

import { type Path, pathRef } from 'slate';

import type { TEditor } from '../../interfaces/editor/TEditor';

export const createPathRef = (
  editor: TEditor,
  at: Path,
  options?: EditorPathRefOptions
) => pathRef(editor as any, at, options as any);
