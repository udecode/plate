import type { TEditor } from './TEditor';

import { isElement } from '../element';

export const isVoid = (editor: TEditor, value: any): boolean => {
  return isElement(value) && editor.isVoid(value);
};
