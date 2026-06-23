import type { EditorStaticApi } from '../interfaces/editor';
import { NodeApi } from '../interfaces/node';

export const hasTexts: EditorStaticApi['hasTexts'] = (editor, element) =>
  element.children.every((n) => NodeApi.isText(n));
