import { getText } from 'common/queries/getText';
import { escapeRegExp } from 'common/utils';
import { Editor, Point } from 'slate';

/**
 * Is the word at the point after a trigger (punctuation character)
 * https://github.com/ianstormtaylor/slate/blob/master/packages/slate/src/utils/string.ts#L6
 */
export const isWordAfterTrigger = (
  editor: Editor,
  { at, trigger }: { at: Point; trigger: string }
) => {
  // Point at the start of previous word (excluding punctuation)
  // https://github.com/ianstormtaylor/slate/blob/master/packages/slate/src/utils/string.ts#L6
  const wordBefore = Editor.before(editor, at, { unit: 'word' });

  // Point before wordBefore
  const before = wordBefore && Editor.before(editor, wordBefore);

  // Range from before to start
  const beforeRange = before && Editor.range(editor, before, at);

  // Before text
  const beforeText = getText(editor, beforeRange);

  // Starts with char and ends with word characters
  const escapedTrigger = escapeRegExp(trigger);
  const beforeRegex = new RegExp(`^${escapedTrigger}(\\w+)$`);

  // Match regex on before text
  const match = !!beforeText && beforeText.match(beforeRegex);

  return {
    range: beforeRange,
    match,
  };
};
