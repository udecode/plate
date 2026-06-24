import { isInline as editorIsInline } from '../interfaces/editor';
import type { EditorStaticApi } from '../interfaces/editor';
import { NodeApi } from '../interfaces/node';

export const hasInlines: EditorStaticApi['hasInlines'] = (editor, element) =>
  element.children.some((n) => NodeApi.isText(n) || editorIsInline(editor, n));
