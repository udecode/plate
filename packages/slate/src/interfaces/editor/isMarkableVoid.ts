import type { TEditor } from './TEditor';

import { isElement } from '../element';

/** Check if a value is a markable void `Element` object. */
export const isMarkableVoid = (editor: TEditor, value: any): boolean => {
  return isElement(value) && editor.markableVoid(value);
};
