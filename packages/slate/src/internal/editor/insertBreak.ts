import { insertBreak as insertBreakBase } from 'slate';

import type { TEditor } from '../../interfaces/editor/TEditor';

export const insertBreak = (editor: TEditor) => insertBreakBase(editor as any);
