import {
  above as editorAbove,
  isElementReadOnly as editorIsElementReadOnly,
} from '../interfaces/editor';
import type { EditorStaticApi } from '../interfaces/editor';
import { NodeApi } from '../interfaces/node';

export const elementReadOnly: EditorStaticApi['elementReadOnly'] = (
  editor,
  options = {}
) =>
  editorAbove(editor, {
    ...options,
    match: (n) => NodeApi.isElement(n) && editorIsElementReadOnly(editor, n),
  });
