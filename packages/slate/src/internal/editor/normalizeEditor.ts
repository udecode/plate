import { normalize } from 'slate';

import type { TOperation } from '../../types';
import type { TEditor } from '../../interfaces/editor/TEditor';

export interface EditorNormalizeOptions {
  force?: boolean;
  operation?: TOperation;
}

export const normalizeEditor = (
  editor: TEditor,
  options?: EditorNormalizeOptions
) => normalize(editor as any, options);
