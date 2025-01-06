import type { Editor } from '../../interfaces/editor/editor';

import { ElementApi } from '../../interfaces/element';

export const isInline = (editor: Editor, value: any): boolean =>
  ElementApi.isElement(value) && editor.isInline(value);
