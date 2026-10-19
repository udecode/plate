import { getEditorSchema } from '../core/editor-runtime';
import { isEmptyElement } from '../core/is-empty-element';
import type { EditorStaticApi } from '../interfaces/editor';

export const isEmpty: EditorStaticApi['isEmpty'] = (editor, element) =>
  isEmptyElement(element, getEditorSchema(editor).getElementBehavior(element));
