import type { TEditor } from '../interfaces';

import { isDefined } from '@udecode/utils';

import { getMark } from './getMark';

/** Is the mark defined in the selection. */
export const isMarkActive = (editor: TEditor, type: string) => {
  return isDefined(getMark(editor, type));
};
