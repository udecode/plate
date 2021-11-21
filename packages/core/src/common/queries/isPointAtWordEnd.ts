import { Editor, Point } from 'slate';
import { TEditor } from '../../types/slate/TEditor';
import { getText } from './getText';

// Starts with whitespace char or nothing
const AFTER_MATCH_REGEX = /^(\s|$)/;

/**
 * Is a point at the end of a word
 */
export const isPointAtWordEnd = (editor: TEditor, { at }: { at: Point }) => {
  // Point after at
  const after = Editor.after(editor, at);

  // From at to after
  const afterRange = Editor.range(editor, at, after);
  const afterText = getText(editor, afterRange);

  // Match regex on after text
  return !!afterText.match(AFTER_MATCH_REGEX);
};
