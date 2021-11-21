import { Editor, Point } from 'slate';
import { TEditor } from '../../types/slate/TEditor';
import { escapeRegExp } from '../utils/escapeRegexp';
import { getText } from './getText';

/**
 * Is the word at the point after a trigger (punctuation character)
 * https://github.com/ianstormtaylor/slate/blob/main/packages/slate/src/utils/string.ts#L6
 */
export const isWordAfterTrigger = (
  editor: TEditor,
  { at, trigger }: { at: Point; trigger: string }
) => {
  // Point at the start of previous word (excluding punctuation)
  const wordBefore = Editor.before(editor, at, { unit: 'word' });

  // Point before wordBefore
  const before = wordBefore && Editor.before(editor, wordBefore);

  // Range from before to start
  const beforeRange = before && Editor.range(editor, before, at);

  // Before text
  const beforeText = getText(editor, beforeRange);

  // Starts with char and ends with word characters
  const escapedTrigger = escapeRegExp(trigger);

  const beforeRegex = new RegExp(
    `^${escapedTrigger}([\\w|À-ÖØ-öø-ÿ|а-яА-ЯёЁ]+)$`
  );

  // Match regex on before text
  const match = !!beforeText && beforeText.match(beforeRegex);

  return {
    range: beforeRange,
    match,
  };
};
