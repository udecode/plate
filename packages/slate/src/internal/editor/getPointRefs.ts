import { pointRefs } from 'slate';

import type { Editor } from '../../interfaces/editor/editor';

export const getPointRefs = (editor: Editor) => pointRefs(editor as any);
