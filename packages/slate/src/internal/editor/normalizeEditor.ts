import { normalize } from 'slate';

import type { Editor } from '../../interfaces/editor/editor';
import type { EditorNormalizeOptions } from '../../interfaces/editor/editor-types';

export const normalizeEditor = (
  editor: Editor,
  options?: EditorNormalizeOptions
) => normalize(editor as any, options);
