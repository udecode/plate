import type { TEditor, Value } from './TEditor';

import { isElement } from '../element';

/** Check if a value is a markable void `Element` object. */
export const isMarkableVoid = <V extends Value>(
  editor: TEditor<V>,
  value: any
): boolean => {
  return isElement(value) && editor.markableVoid(value);
};
