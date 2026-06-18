import { Editor, type EditorStaticApi } from '../interfaces/editor';
import { NodeApi } from '../interfaces/node';

export const hasInlines: EditorStaticApi['hasInlines'] = (editor, element) =>
  element.children.some((n) => NodeApi.isText(n) || Editor.isInline(editor, n));
