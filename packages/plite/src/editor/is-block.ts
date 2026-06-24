import { getEditorSchema } from '../core/editor-runtime';
import type { EditorStaticApi } from '../interfaces/editor';

export const isBlock: EditorStaticApi['isBlock'] = (editor, value) =>
  !getEditorSchema(editor).isInline(value);
