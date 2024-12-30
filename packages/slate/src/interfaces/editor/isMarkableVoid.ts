import type { TEditor } from './TEditor';

import { isElement } from '../element';

export const isMarkableVoid = (editor: TEditor, value: any): boolean => {
  return isElement(value) && editor.markableVoid(value);
};
