import { Editor } from 'slate';

import type { TEditor } from './TEditor';

/** Get the set of currently tracked point refs of the editor. */
export const getPointRefs = (editor: TEditor) =>
  Editor.pointRefs(editor as any);
