import { rangeRefs } from 'slate';

import type { Editor } from '../../interfaces/editor/editor-type';

export const getRangeRefs = (editor: Editor) => rangeRefs(editor as any);
