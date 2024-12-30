import { Editor } from 'slate';

import type { TEditor } from './TEditor';

export const isEditor = (value: any): value is TEditor =>
  Editor.isEditor(value);
