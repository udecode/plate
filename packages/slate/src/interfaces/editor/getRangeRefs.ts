import { Editor } from 'slate';

import type { TEditor } from './TEditor';

/** Get the set of currently tracked range refs of the editor. */
export const getRangeRefs = (editor: TEditor) =>
  Editor.rangeRefs(editor as any);
