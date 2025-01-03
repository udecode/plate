import { normalize } from 'slate';

import type { TEditor } from '../../interfaces/editor/TEditor';
import type { EditorNormalizeOptions } from '../../interfaces/editor/editor-types';

export const normalizeEditor = (
  editor: TEditor,
  options?: EditorNormalizeOptions
) => normalize(editor as any, options);
