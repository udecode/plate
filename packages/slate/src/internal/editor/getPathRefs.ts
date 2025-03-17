import { pathRefs } from 'slate';

import type { Editor } from '../../interfaces/editor/editor-type';

export const getPathRefs = (editor: Editor) => pathRefs(editor as any);
