import { Editor } from 'slate';

import type { TEditor } from './TEditor';

export const getPointRefs = (editor: TEditor) =>
  Editor.pointRefs(editor as any);
