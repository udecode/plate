import { addMark as addMarkBase } from 'slate';

import type { TEditor } from '../../interfaces/editor/TEditor';

export const addMark = (editor: TEditor, key: string, value: any) =>
  addMarkBase(editor as any, key, value);
