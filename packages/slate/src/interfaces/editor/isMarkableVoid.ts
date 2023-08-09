import { isElement } from '../element';
import { TEditor, Value } from './TEditor';

/**
 * Check if a value is a markable void `Element` object.
 */
export const isMarkableVoid = <V extends Value>(
  editor: TEditor<V>,
  value: any
): boolean => {
  return isElement(value) && editor.markableVoid(value);
};
