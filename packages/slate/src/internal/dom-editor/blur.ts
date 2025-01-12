import { DOMEditor } from 'slate-dom';

import type { Editor } from '../../interfaces/editor';

export const blur = (editor: Editor) => DOMEditor.blur(editor as any);
