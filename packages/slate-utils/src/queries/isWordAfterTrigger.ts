import { Point } from 'slate';
import { getEditorString } from '../slate/editor/getEditorString';
import { getPointBefore } from '../slate/editor/getPointBefore';
import { getRange } from '../slate/editor/getRange';
import { TEditor, Value } from '../slate/editor/TEditor';
import { escapeRegExp } from '../types/misc/escapeRegexp';

/**
 * Is the word at the point after a trigger (punctuation character)
 * https://github.com/ianstormtaylor/slate/blob/main/packages/slate/src/utils/string.ts#L6
 */
export const isWordAfterTrigger = <V extends Value>(
  editor: TEditor<V>,
  { at, trigger }: { at: Point; trigger: string }
) => {
  // Point at the start of previous word (excluding punctuation)
  const wordBefore = getPointBefore(editor, at, { unit: 'word' });

  // Point before wordBefore
  const before = wordBefore && getPointBefore(editor, wordBefore);

  // Range from before to start
  const beforeRange = before && getRange(editor, before, at);

  // Before text
  const beforeText = getEditorString(editor, beforeRange);

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
