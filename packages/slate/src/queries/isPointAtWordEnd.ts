import type { Point } from 'slate';

import type { TEditor } from '../interfaces';

// Starts with whitespace char or nothing
const AFTER_MATCH_REGEX = /^(?:\s|$)/;

/** Is a point at the end of a word */
export const isPointAtWordEnd = (editor: TEditor, { at }: { at: Point }) => {
  // Point after at
  const after = editor.api.after(at);

  // From at to after
  const afterRange = editor.api.range(at, after);
  const afterText = editor.api.string(afterRange);

  // Match regex on after text
  return !!AFTER_MATCH_REGEX.exec(afterText);
};
