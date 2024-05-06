import type { TEditor, Value } from '@udecode/slate';

import { isDefined } from '@udecode/utils';

import { getMark } from './getMark';

/** Is the mark defined in the selection. */
export const isMarkActive = <V extends Value>(
  editor: TEditor<V>,
  type: string
) => {
  return isDefined(getMark(editor, type));
};
