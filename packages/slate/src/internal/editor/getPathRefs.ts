import { pathRefs } from 'slate';

import type { TEditor } from '../../interfaces/editor/TEditor';

export const getPathRefs = (editor: TEditor) => pathRefs(editor as any);
