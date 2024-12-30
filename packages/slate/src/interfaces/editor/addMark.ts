import { Editor } from 'slate';

import type { TEditor } from './TEditor';

export const addMark = (editor: TEditor, key: string, value: any) =>
  Editor.addMark(editor as any, key, value);
