import { Editor, type EditorStaticApi } from '../interfaces/editor';
import { NodeApi } from '../interfaces/node';

export const getVoid: EditorStaticApi['void'] = (editor, options = {}) =>
  Editor.above(editor, {
    ...options,
    match: (n) => NodeApi.isElement(n) && Editor.isVoid(editor, n),
  });
