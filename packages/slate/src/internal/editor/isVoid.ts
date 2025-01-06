import type { Editor } from '../../interfaces/editor/editor';

import { isElement } from '../../interfaces/element';

export const isVoid = (editor: Editor, value: any): boolean => {
  return isElement(value) && editor.isVoid(value);
};
