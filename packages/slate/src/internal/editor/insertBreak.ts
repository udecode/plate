import { insertBreak as insertBreakBase } from 'slate';

import type { Editor } from '../../interfaces/editor/editor';

export const insertBreak = (editor: Editor) => insertBreakBase(editor as any);
