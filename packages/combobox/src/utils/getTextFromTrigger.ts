import {
  TEditor,
  Value,
  escapeRegExp,
  getEditorString,
  getPointBefore,
  getRange,
} from '@udecode/plate-common';
import { Point } from 'slate';

/**
 * Get text and range from trigger to cursor.
 * Starts with trigger and ends with non-whitespace character.
 */
export const getTextFromTrigger = <V extends Value>(
  editor: TEditor<V>,
  {
    at,
    trigger,
    searchPattern = `\\S+`,
  }: { at: Point; trigger: string; searchPattern?: string }
) => {
  const escapedTrigger = escapeRegExp(trigger);
  const triggerRegex = new RegExp(`(?:^|\\s)${escapedTrigger}`);

  let start: Point | undefined = at;
  let end: Point | undefined;

  while (true) {
    end = start;

    if (!start) break;

    start = getPointBefore(editor, start);
    const charRange = start && getRange(editor, start, end);
    const charText = getEditorString(editor, charRange);

    if (!charText.match(searchPattern)) {
      start = end;
      break;
    }
  }

  // Range from start to cursor
  const range = start && getRange(editor, start, at);
  const text = getEditorString(editor, range);

  if (!range || !text.match(triggerRegex)) return;

  return {
    range,
    textAfterTrigger: text.slice(trigger.length),
  };
};

// export const matchesTriggerAndPattern = (
//   editor: TEditor<V>,
//   { at, trigger, pattern }: { at: Point; trigger: string; pattern: string }
// ) => {
//   // Point at the start of line
//   const lineStart = getPointBefore(editor, at, { unit: 'line' });
//
//   // Range from before to start
//   const beforeRange = lineStart && getRange(editor, lineStart, at);
//
//   // Before text
//   const beforeText = getEditorString(editor, beforeRange);
//
//   // Starts with char and ends with word characters
//   const escapedTrigger = escapeRegExp(trigger);
//
//   const beforeRegex = new RegExp(`(?:^|\\s)${escapedTrigger}(${pattern})$`);
//
//   // Match regex on before text
//   const match = !!beforeText && beforeText.match(beforeRegex);
//
//   // Point at the start of mention
//   const mentionStart = match
//     ? getPointBefore(editor, at, {
//         unit: 'character',
//         distance: match[1].length + trigger.length,
//       })
//     : null;
//
//   // Range from mention to start
//   const mentionRange = mentionStart && getRange(editor, mentionStart, at);
//
//   return {
//     range: mentionRange,
//     match,
//   };
// };
