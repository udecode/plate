import { Editor } from 'slate';

import type { TEditor } from './TEditor';

export const getPathRefs = (editor: TEditor) => Editor.pathRefs(editor as any);
