import type { EditorStaticApi } from '../interfaces/editor';
import {
  above as editorAbove,
  isElementReadOnly as editorIsElementReadOnly,
} from '../interfaces/editor';
import type { Element } from '../interfaces/element';
import { NodeApi } from '../interfaces/node';

export const elementReadOnly: EditorStaticApi['elementReadOnly'] = (
  editor,
  options = {}
) =>
  editorAbove(editor, {
    ...options,
    match: (n): n is Element =>
      NodeApi.isElement(n) && editorIsElementReadOnly(editor, n),
  });
