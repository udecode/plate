import { useCallback, useState } from 'react';
import {
  escapeRegExp,
  getText,
  isCollapsed,
  isPointAtWordEnd,
  isWordAfterTrigger,
} from '@udecode/slate-plugins-common';
import { Editor, Point, Range, Transforms } from 'slate';
import { insertMention } from './transforms/insertMention';
import { getNextIndex } from './utils/getNextIndex';
import { getPreviousIndex } from './utils/getPreviousIndex';
import { MentionNodeData, UseMentionOptions } from './types';

export const matchesTriggerAndPattern = (
  editor: Editor,
  { at, trigger, pattern }: { at: Point; trigger: string; pattern: string }
) => {
  // Point at the start of line
  const lineStart = Editor.before(editor, at, { unit: 'line' });

  // Range from before to start
  const beforeRange = lineStart && Editor.range(editor, lineStart, at);

  // Before text
  const beforeText = getText(editor, beforeRange);

  // Starts with char and ends with word characters
  const escapedTrigger = escapeRegExp(trigger);

  const beforeRegex = new RegExp(`(?:^|\\s)${escapedTrigger}(${pattern})$`);

  // Match regex on before text
  const match = !!beforeText && beforeText.match(beforeRegex);

  // Point at the start of mention
  const mentionStart = match
    ? Editor.before(editor, at, {
        unit: 'character',
        distance: match[1].length + trigger.length,
      })
    : null;

  // Range from mention to start
  const mentionRange = mentionStart && Editor.range(editor, mentionStart, at);

  return {
    range: mentionRange,
    match,
  };
};

export const useMention = () => {};
