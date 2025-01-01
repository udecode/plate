import type { Point } from 'slate';

import { escapeRegExp } from '@udecode/utils';

import type { TEditor } from '../interfaces';

/**
 * Is the word at the point after a trigger (punctuation character)
 * https://github.com/ianstormtaylor/slate/blob/main/packages/slate/src/utils/string.ts#L6
 */
export const isWordAfterTrigger = (
  editor: TEditor,
  { at, trigger }: { at: Point; trigger: string }
) => {
  // Point at the start of previous word (excluding punctuation)
  const wordBefore = editor.api.before(at, { unit: 'word' });

  // Point before wordBefore
  const before = wordBefore && editor.api.before(wordBefore);

  // Range from before to start
  const beforeRange = before && editor.api.range(before, at);

  // Before text
  const beforeText = editor.api.string(beforeRange);

  // Starts with char and ends with word characters
  const escapedTrigger = escapeRegExp(trigger);

  const beforeRegex = new RegExp(
    `^${escapedTrigger}([\\w|À-ÖØ-öø-ÿ|а-яА-ЯёЁ]+)$`
  );

  // Match regex on before text
  const match = beforeText ? beforeText.match(beforeRegex) : null;

  return {
    match,
    range: beforeRange,
  };
};
