import { TEditor, Value } from '../slate/editor/TEditor';
import { EMarks } from '../slate/text/TText';
import { isDefined } from '../utils/misc/type-utils';
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
