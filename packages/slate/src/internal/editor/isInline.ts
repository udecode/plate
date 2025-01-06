import type { Editor } from '../../interfaces/editor/editor';

import { isElement } from '../../interfaces/element';

export const isInline = (editor: Editor, value: any): boolean =>
  isElement(value) && editor.isInline(value);
