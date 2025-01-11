import type { EditorPathRefOptions } from 'slate/dist/interfaces/editor';

import { pathRef } from 'slate';

import type { Editor } from '../../interfaces/editor/editor-type';
import type { Path } from '../../interfaces/path';

export const createPathRef = (
  editor: Editor,
  at: Path,
  options?: EditorPathRefOptions
) => pathRef(editor as any, at, options as any);
