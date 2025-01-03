import { pointRefs } from 'slate';

import type { TEditor } from '../../interfaces/editor/TEditor';

export const getPointRefs = (editor: TEditor) => pointRefs(editor as any);
