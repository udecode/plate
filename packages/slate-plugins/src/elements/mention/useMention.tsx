import { useCallback, useState } from 'react';
import { Editor, Point, Range, Transforms } from 'slate';
import { escapeRegExp } from '../../common';
import {
  getText,
  isPointAtWordEnd,
  isWordAfterTrigger,
} from '../../common/queries';
import { isCollapsed } from '../../common/queries/isCollapsed';
import { insertMention } from './transforms';
import { MentionNodeData, UseMentionOptions } from './types';
import { getNextIndex, getPreviousIndex } from './utils';

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

export const useMention = (
  mentionables: MentionNodeData[] = [],
  {
    maxSuggestions = 10,
    trigger = '@',
    mentionableFilter = (search: string) => (c: MentionNodeData) =>
      c.value.toLowerCase().includes(search.toLowerCase()),
    mentionableSearchPattern,
    insertSpaceAfterMention,
    ...options
  }: UseMentionOptions = {}
) => {
  const [targetRange, setTargetRange] = useState<Range | null>(null);
  const [valueIndex, setValueIndex] = useState(0);
  const [search, setSearch] = useState('');
  const values = mentionables
    .filter(mentionableFilter(search))
    .slice(0, maxSuggestions);

  const onAddMention = useCallback(
    (editor: Editor, data: MentionNodeData) => {
      if (targetRange !== null) {
        Transforms.select(editor, targetRange);
        insertMention(editor, data, options, insertSpaceAfterMention);
        return setTargetRange(null);
      }
    },
    [options, targetRange, insertSpaceAfterMention]
  );

  const onKeyDownMention = useCallback(
    (e: any, editor: Editor) => {
      if (targetRange) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          return setValueIndex(getNextIndex(valueIndex, values.length - 1));
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          return setValueIndex(getPreviousIndex(valueIndex, values.length - 1));
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          return setTargetRange(null);
        }

        if (['Tab', 'Enter'].includes(e.key)) {
          e.preventDefault();
          onAddMention(editor, values[valueIndex]);
          return false;
        }
      }
    },
    [
      values,
      valueIndex,
      setValueIndex,
      targetRange,
      setTargetRange,
      onAddMention,
    ]
  );

  const onChangeMention = useCallback(
    (editor: Editor) => {
      const { selection } = editor;

      if (selection && isCollapsed(selection)) {
        const cursor = Range.start(selection);

        const { range, match: beforeMatch } = mentionableSearchPattern
          ? // new behavior, searches for matching string against pattern right after the trigger
            matchesTriggerAndPattern(editor, {
              at: cursor,
              trigger,
              pattern: mentionableSearchPattern,
            })
          : // previous behavior. searches for a word after typing the first letter. Kept for backward compatibility.
            isWordAfterTrigger(editor, {
              at: cursor,
              trigger,
            });

        if (beforeMatch && isPointAtWordEnd(editor, { at: cursor })) {
          setTargetRange(range as Range);
          const [, word] = beforeMatch;
          setSearch(word);
          setValueIndex(0);
          return;
        }

        setTargetRange(null);
      }
    },
    [
      setTargetRange,
      setSearch,
      setValueIndex,
      trigger,
      mentionableSearchPattern,
    ]
  );

  return {
    search,
    index: valueIndex,
    target: targetRange,
    values,
    onChangeMention,
    onKeyDownMention,
    onAddMention,
  };
};
