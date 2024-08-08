import { Editor } from 'slate';

import type { TEditor } from './TEditor';

/** Get the set of currently tracked path refs of the editor. */
export const getPathRefs = (editor: TEditor) => Editor.pathRefs(editor as any);
