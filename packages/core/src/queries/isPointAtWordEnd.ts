import { Point } from 'slate';
import { getEditorString } from '../slate/editor/getEditorString';
import { getPointAfter } from '../slate/editor/getPointAfter';
import { getRange } from '../slate/editor/getRange';
import { TEditor, Value } from '../slate/editor/TEditor';

// Starts with whitespace char or nothing
const AFTER_MATCH_REGEX = /^(\s|$)/;

/**
 * Is a point at the end of a word
 */
export const isPointAtWordEnd = <V extends Value>(
  editor: TEditor<V>,
  { at }: { at: Point }
) => {
  // Point after at
  const after = getPointAfter(editor, at);

  // From at to after
  const afterRange = getRange(editor, at, after);
  const afterText = getEditorString(editor, afterRange);

  // Match regex on after text
  return !!afterText.match(AFTER_MATCH_REGEX);
};
