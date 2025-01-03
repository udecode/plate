import type { TEditor } from '../../interfaces/editor/TEditor';

import { isElement } from '../../interfaces/element';

export const isInline = (editor: TEditor, value: any): boolean =>
  isElement(value) && editor.isInline(value);
