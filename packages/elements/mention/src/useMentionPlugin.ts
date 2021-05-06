import { useCallback, useMemo, useState } from 'react';
import {
  isCollapsed,
  isPointAtWordEnd,
  isWordAfterTrigger,
} from '@udecode/slate-plugins-common';
import {
  getRenderElement,
  getSlatePluginTypes,
  OnChange,
  OnKeyDown,
  SlatePlugin,
  SPEditor,
} from '@udecode/slate-plugins-core';
import { Range, Transforms } from 'slate';
import { matchesTriggerAndPattern } from './queries/matchesTriggerAndPattern';
import { insertMention } from './transforms/insertMention';
import { getNextIndex } from './utils/getNextIndex';
import { getPreviousIndex } from './utils/getPreviousIndex';
import { ELEMENT_MENTION } from './defaults';
import { getMentionDeserialize } from './getMentionDeserialize';
import {
  GetMentionSelectProps,
  MentionNodeData,
  MentionPluginOptions,
} from './types';

/**
 * Enables support for autocompleting @mentions and #tags.
 * When typing a configurable marker, such as @ or #, a select
 * component appears with autocompleted suggestions.
 */
export const useMentionPlugin = ({
  mentionables = [],
  maxSuggestions = 10,
  trigger = '@',
  mentionableFilter = (search: string) => (c: MentionNodeData) =>
    c.value.toLowerCase().includes(search.toLowerCase()),
  mentionableSearchPattern,
  insertSpaceAfterMention,
  pluginKey = ELEMENT_MENTION,
}: MentionPluginOptions = {}): {
  plugin: SlatePlugin;
  getMentionSelectProps: () => GetMentionSelectProps;
  searchValue: string;
} => {
  const [targetRange, setTargetRange] = useState<Range | null>(null);
  const [valueIndex, setValueIndex] = useState(0);
  const [search, setSearch] = useState('');
  const values = useMemo(
    () =>
      mentionables.filter(mentionableFilter(search)).slice(0, maxSuggestions),
    [maxSuggestions, mentionableFilter, mentionables, search]
  );

  const onAddMention = useCallback(
    (editor: SPEditor, data: MentionNodeData) => {
      if (targetRange !== null) {
        Transforms.select(editor, targetRange);
        insertMention(editor, { data, insertSpaceAfterMention, pluginKey });
      }
    },
    [targetRange, insertSpaceAfterMention, pluginKey]
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
    [targetRange, valueIndex, values, onAddMention]
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
    plugin: useMemo(
      () => ({
        pluginKeys: pluginKey,
        onChange: onChangeMention,
        renderElement: getRenderElement(pluginKey),
        onKeyDown: onKeyDownMention,
        deserialize: getMentionDeserialize(pluginKey),
        inlineTypes: getSlatePluginTypes(pluginKey),
        voidTypes: getSlatePluginTypes(pluginKey),
      }),
      [onChangeMention, onKeyDownMention, pluginKey]
    ),

    getMentionSelectProps: useCallback(
      () => ({
        at: targetRange,
        valueIndex,
        setValueIndex,
        options: values,
        onClickMention: onAddMention,
      }),
      [onAddMention, targetRange, valueIndex, values]
    ),
    searchValue: search,
  };
};
