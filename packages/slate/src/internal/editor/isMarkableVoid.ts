import type { Editor } from '../../interfaces/editor/editor';

import { ElementApi } from '../../interfaces/element';

export const isMarkableVoid = (editor: Editor, value: any): boolean => {
  return ElementApi.isElement(value) && editor.markableVoid(value);
};
