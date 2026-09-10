import { getEditorSchema } from '../core/editor-runtime';
import type { EditorStaticApi } from '../interfaces/editor';
import { NodeApi } from '../interfaces/node';

export const isEmpty: EditorStaticApi['isEmpty'] = (editor, element) => {
  const { children } = element;
  return (
    children.length === 0 ||
    (children.every((child) => NodeApi.isText(child) && child.text === '') &&
      !getEditorSchema(editor).isVoid(element))
  );
};
