import { getEditorSchema } from '../core/editor-runtime';
import type { EditorStaticApi } from '../interfaces/editor';
import { NodeApi } from '../interfaces/node';

export const isEmpty: EditorStaticApi['isEmpty'] = (editor, element) => {
  const schema = getEditorSchema(editor);

  if (
    schema.isVoid(element) ||
    schema.isAtom(element) ||
    schema.isObject(element)
  ) {
    return false;
  }

  const { children } = element;
  return children.every((child) => NodeApi.isText(child) && child.text === '');
};
