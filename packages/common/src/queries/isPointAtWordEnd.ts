import { Editor, Point } from 'slate';
import { getText } from './getText';

// Starts with whitespace char or nothing
const AFTER_MATCH_REGEX = /^(\s|$)/;

/**
 * Is a point at the end of a word
 */
export const isPointAtWordEnd = (editor: Editor, { at }: { at: Point }) => {
  // Point after at
  const after = Editor.after(editor, at);

  // From at to after
  const afterRange = Editor.range(editor, at, after);
  const afterText = getText(editor, afterRange);

  // Match regex on after text
  return !!afterText.match(AFTER_MATCH_REGEX);
};
