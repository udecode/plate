import type { Editor } from '../../interfaces/editor/editor-type';

export const hasMark = (editor: Editor, key: string) => !!editor.api.mark(key);
