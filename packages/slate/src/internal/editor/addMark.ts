import { addMark as addMarkBase } from 'slate';

import type { Editor } from '../../interfaces/editor/editor';

export const addMark = (editor: Editor, key: string, value: any) =>
  addMarkBase(editor as any, key, value);
