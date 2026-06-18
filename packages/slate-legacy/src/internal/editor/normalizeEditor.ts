import { normalize } from 'slate';

import type { Editor } from '../../interfaces/editor/editor-type';
import type { EditorNormalizeOptions } from '../../interfaces/index';

export const normalizeEditor = (
  editor: Editor,
  options?: EditorNormalizeOptions
) => normalize(editor as any, options);
