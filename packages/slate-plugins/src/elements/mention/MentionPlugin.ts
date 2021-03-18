import React, { useCallback, useState } from 'react';
import {
  getPluginRenderElement,
  getPluginTypes,
  isCollapsed,
  isPointAtWordEnd,
  isWordAfterTrigger,
} from '@udecode/slate-plugins-common';
import {
  OnChange,
  OnKeyDown,
  SlatePlugin,
  useSlatePluginsEditor,
} from '@udecode/slate-plugins-core';
import { Editor, Node, Range, Transforms } from 'slate';
import { MentionSelect } from '../../../../components/src/components/MentionSelect/MentionSelect';
import { MentionSelectProps } from '../../../../components/src/components/MentionSelect/MentionSelect.types';
import { insertMention } from './transforms/insertMention';
import { getNextIndex } from './utils/getNextIndex';
import { getPreviousIndex } from './utils/getPreviousIndex';
import { ELEMENT_MENTION } from './defaults';
import { MentionNodeData, UseMentionOptions } from './types';
import { useDeserializeMention } from './useDeserializeMention';
import { matchesTriggerAndPattern } from './useMention';

/**
 * Enables support for autocompleting @mentions and #tags.
 * When typing a configurable marker, such as @ or #, a select
 * component appears with autocompleted suggestions.
 */
export const MentionPlugin = ({
  mentionables = [],
  maxSuggestions = 10,
  trigger = '@',
  mentionableFilter = (search: string) => (c: MentionNodeData) =>
    c.value.toLowerCase().includes(search.toLowerCase()),
  mentionableSearchPattern,
  insertSpaceAfterMention,
}: UseMentionOptions = {}): SlatePlugin & {
  getMentionSelectProps: () => MentionSelectProps;
} => {
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
        insertMention(editor, { data, insertSpaceAfterMention });
        return setTargetRange(null);
      }
    },
    [targetRange, insertSpaceAfterMention]
  );

  const onKeyDownMention: OnKeyDown = useCallback(
    (editor) => (e) => {
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

  const onChangeMention: OnChange = useCallback(
    (editor) => () => {
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
    pluginKeys: ELEMENT_MENTION,
    onChange: onChangeMention,
    renderElement: getPluginRenderElement(ELEMENT_MENTION),
    onKeyDown: onKeyDownMention,
    deserialize: useDeserializeMention(),
    inlineTypes: getPluginTypes(ELEMENT_MENTION),
    voidTypes: getPluginTypes(ELEMENT_MENTION),

    getMentionSelectProps: useCallback(
      () => ({
        at: targetRange,
        valueIndex,
        options: values,
        onClick: onAddMention,
      }),
      [onAddMention, targetRange, valueIndex, values]
    ),
  };
};
