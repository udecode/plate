import { DOMEditor } from 'slate-dom';

import type { Editor } from '../../interfaces/editor';

export const isFocused = (editor: Editor) => DOMEditor.isFocused(editor as any);
