import { DOMEditor } from 'slate-dom';

import type { Editor } from '../../interfaces/editor';

export const blurEditor = (editor: Editor) => DOMEditor.blur(editor as any);
