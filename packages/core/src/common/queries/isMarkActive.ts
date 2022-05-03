import { TEditor, Value } from '../../slate/types/TEditor';
import { EMarks } from '../../slate/types/TText';
import { isDefined } from '../utils/types.utils';
import { getMark } from './getMark';

/**
 * Is the mark defined in the selection.
 */
export const isMarkActive = <V extends Value, K extends keyof EMarks<V>>(
  editor: TEditor<V>,
  type: K
) => {
  return isDefined(getMark(editor, type));
};
