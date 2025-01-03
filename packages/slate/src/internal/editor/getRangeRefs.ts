import { rangeRefs } from 'slate';

import type { TEditor } from '../../interfaces/editor/TEditor';

export const getRangeRefs = (editor: TEditor) => rangeRefs(editor as any);
