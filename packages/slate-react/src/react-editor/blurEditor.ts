import type { TEditor } from '@udecode/slate';

import { ReactEditor } from 'slate-react';

/** Blur the editor. */
export const blurEditor = (editor: TEditor) => ReactEditor.blur(editor as any);
