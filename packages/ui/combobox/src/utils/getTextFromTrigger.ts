import { escapeRegExp, getText } from '@udecode/plate-common';
import { Editor, Point } from 'slate';

/**
 * Get text and range from trigger to cursor.
 * Starts with trigger and ends with non-whitespace character.
 */
export const getTextFromTrigger = (
  editor: Editor,
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

    start = Editor.before(editor, start);
    const charRange = start && Editor.range(editor, start, end);
    const charText = getText(editor, charRange);

    if (!charText.match(searchPattern)) {
      start = end;
      break;
    }
  }

  // Range from start to cursor
  const range = start && Editor.range(editor, start, at);
  const text = getText(editor, range);

  if (!range || !text.match(triggerRegex)) return;

  return {
    range,
    textAfterTrigger: text.substring(1),
  };
};

// export const matchesTriggerAndPattern = (
//   editor: TEditor,
//   { at, trigger, pattern }: { at: Point; trigger: string; pattern: string }
// ) => {
//   // Point at the start of line
//   const lineStart = Editor.before(editor, at, { unit: 'line' });
//
//   // Range from before to start
//   const beforeRange = lineStart && Editor.range(editor, lineStart, at);
//
//   // Before text
//   const beforeText = getText(editor, beforeRange);
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
//     ? Editor.before(editor, at, {
//         unit: 'character',
//         distance: match[1].length + trigger.length,
//       })
//     : null;
//
//   // Range from mention to start
//   const mentionRange = mentionStart && Editor.range(editor, mentionStart, at);
//
//   return {
//     range: mentionRange,
//     match,
//   };
// };
