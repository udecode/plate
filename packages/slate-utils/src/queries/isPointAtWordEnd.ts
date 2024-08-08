import type { Point } from 'slate';

import {
  type TEditor,
  getEditorString,
  getPointAfter,
  getRange,
} from '@udecode/slate';

// Starts with whitespace char or nothing
const AFTER_MATCH_REGEX = /^(?:\s|$)/;

/** Is a point at the end of a word */
export const isPointAtWordEnd = (editor: TEditor, { at }: { at: Point }) => {
  // Point after at
  const after = getPointAfter(editor, at);

  // From at to after
  const afterRange = getRange(editor, at, after);
  const afterText = getEditorString(editor, afterRange);

  // Match regex on after text
  return !!afterText.match(AFTER_MATCH_REGEX);
};
