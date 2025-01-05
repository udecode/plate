import { DOMEditor } from 'slate-dom';

import type { TEditor } from '../../interfaces/editor';

export const blurEditor = (editor: TEditor) => DOMEditor.blur(editor as any);
