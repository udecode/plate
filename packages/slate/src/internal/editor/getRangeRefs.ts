import { rangeRefs } from 'slate';

import type { Editor } from '../../interfaces/editor/editor';

export const getRangeRefs = (editor: Editor) => rangeRefs(editor as any);
