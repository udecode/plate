import type { TEditor } from '../../interfaces/editor/TEditor';

import { isElement } from '../../interfaces/element';

export const isVoid = (editor: TEditor, value: any): boolean => {
  return isElement(value) && editor.isVoid(value);
};
