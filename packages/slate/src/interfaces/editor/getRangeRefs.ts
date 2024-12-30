import { Editor } from 'slate';

import type { TEditor } from './TEditor';

export const getRangeRefs = (editor: TEditor) =>
  Editor.rangeRefs(editor as any);
