import {
  above as editorAbove,
  isVoid as editorIsVoid,
} from '../interfaces/editor';
import type { EditorStaticApi } from '../interfaces/editor';
import { NodeApi } from '../interfaces/node';

export const getVoid: EditorStaticApi['void'] = (editor, options = {}) =>
  editorAbove(editor, {
    ...options,
    match: (n) => NodeApi.isElement(n) && editorIsVoid(editor, n),
  });
