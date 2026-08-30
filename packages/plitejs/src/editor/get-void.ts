import type { EditorStaticApi } from '../interfaces/editor';
import {
  above as editorAbove,
  isVoid as editorIsVoid,
} from '../interfaces/editor';
import type { Element } from '../interfaces/element';
import { NodeApi } from '../interfaces/node';

export const getVoid: EditorStaticApi['void'] = (editor, options = {}) =>
  editorAbove(editor, {
    ...options,
    match: (n): n is Element => NodeApi.isElement(n) && editorIsVoid(editor, n),
  });
