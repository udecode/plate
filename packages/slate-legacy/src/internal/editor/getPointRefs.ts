import { pointRefs } from 'slate';

import type { Editor } from '../../interfaces/editor/editor-type';

export const getPointRefs = (editor: Editor) => pointRefs(editor as any);
