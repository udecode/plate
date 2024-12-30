import { pathRefs } from 'slate';

import type { TEditor } from './TEditor';

export const getPathRefs = (editor: TEditor) => pathRefs(editor as any);
