import { pointRefs } from 'slate';

import type { TEditor } from './TEditor';

export const getPointRefs = (editor: TEditor) => pointRefs(editor as any);
