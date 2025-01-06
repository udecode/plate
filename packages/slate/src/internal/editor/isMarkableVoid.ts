import type { Editor } from '../../interfaces/editor/editor';

import { isElement } from '../../interfaces/element';

export const isMarkableVoid = (editor: Editor, value: any): boolean => {
  return isElement(value) && editor.markableVoid(value);
};
