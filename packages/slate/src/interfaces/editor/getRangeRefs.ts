import { rangeRefs } from 'slate';

import type { TEditor } from './TEditor';

export const getRangeRefs = (editor: TEditor) => rangeRefs(editor as any);
