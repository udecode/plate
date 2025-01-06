import type { EditorPathRefOptions } from 'slate/dist/interfaces/editor';

import { type Path, pathRef } from 'slate';

import type { Editor } from '../../interfaces/editor/editor';

export const createPathRef = (
  editor: Editor,
  at: Path,
  options?: EditorPathRefOptions
) => pathRef(editor as any, at, options as any);
