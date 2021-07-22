import { TEditor } from '@udecode/plate-core';
import { isDefined } from '../utils/types.utils';
import { getMark } from './getMark';

/**
 * Is the mark defined in the selection.
 */
export const isMarkActive = (editor: TEditor, type: string) => {
  return isDefined(getMark(editor, type));
};
