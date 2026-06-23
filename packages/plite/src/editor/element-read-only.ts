import { Editor, type EditorStaticApi } from '../interfaces/editor';
import { NodeApi } from '../interfaces/node';

export const elementReadOnly: EditorStaticApi['elementReadOnly'] = (
  editor,
  options = {}
) =>
  Editor.above(editor, {
    ...options,
    match: (n) => NodeApi.isElement(n) && Editor.isElementReadOnly(editor, n),
  });
