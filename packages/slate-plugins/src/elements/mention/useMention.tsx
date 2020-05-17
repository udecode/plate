import React, { useCallback, useState } from 'react';
import { escapeRegExp } from 'common/utils';
import { Editor, Range, Transforms } from 'slate';
import { MentionSelect } from './components/MentionSelect';
import { insertMention } from './transforms';
import { MentionableItem, MentionOptions } from './types';

const AFTER_MATCH_REGEX = /^(\s|$)/;

const getMentionSelect = (
  target: Range | null,
  index: number,
  mentionables: MentionableItem[]
) => {
  return () => {
    if (target && mentionables.length > 0) {
      return (
        <MentionSelect
          target={target}
          index={index}
          mentionables={mentionables}
        />
      );
    }
    return null;
  };
};

export const useMention = (
  mentionables: MentionableItem[] = [],
  options: Partial<MentionOptions>
) => {
  const { maxSuggestions = 10, trigger = '@', prefix = trigger } = options;
  const [target, setTarget] = useState<Range | null>(null);
  const [index, setIndex] = useState(0);
  const [search, setSearch] = useState('');
  const matchingMentionables = mentionables
    .filter((c) => c.value.toLowerCase().includes(search.toLowerCase()))
    .slice(0, maxSuggestions);

  const MentionSelectComponent = getMentionSelect(
    target,
    index,
    matchingMentionables
  );

  const onKeyDownMention = useCallback(
    (e: any, editor: Editor) => {
      if (target) {
        switch (e.key) {
          case 'ArrowDown': {
            e.preventDefault();
            const prevIndex =
              index >= matchingMentionables.length - 1 ? 0 : index + 1;
            setIndex(prevIndex);
            break;
          }
          case 'ArrowUp': {
            e.preventDefault();
            const nextIndex =
              index <= 0 ? matchingMentionables.length - 1 : index - 1;
            setIndex(nextIndex);
            break;
          }
          case 'Tab':
          case 'Enter':
            e.preventDefault();
            Transforms.select(editor, target);
            insertMention(editor, matchingMentionables[index], prefix);
            setTarget(null);
            break;
          case 'Escape':
            e.preventDefault();
            setTarget(null);
            break;
          default:
            break;
        }
      }
    },
    [matchingMentionables, index, setIndex, target, setTarget, prefix]
  );

  const onChangeMention = useCallback(
    ({ editor }: { editor: Editor }) => {
      const { selection } = editor;
      const escapedTrigger = escapeRegExp(trigger);
      const beforeRegex = new RegExp(`^${escapedTrigger}(\\w+)$`);
      if (selection && Range.isCollapsed(selection)) {
        const [start] = Range.edges(selection);
        const wordBefore = Editor.before(editor, start, { unit: 'word' });
        const before = wordBefore && Editor.before(editor, wordBefore);
        const beforeRange = before && Editor.range(editor, before, start);
        const beforeText = beforeRange && Editor.string(editor, beforeRange);
        const beforeMatch = beforeText && beforeText.match(beforeRegex);
        const after = Editor.after(editor, start);
        const afterRange = Editor.range(editor, start, after);
        const afterText = Editor.string(editor, afterRange);
        const afterMatch = afterText.match(AFTER_MATCH_REGEX);
        if (beforeMatch && afterMatch) {
          setTarget(beforeRange ?? null);
          setSearch(beforeMatch[1]);
          setIndex(0);
          return;
        }
      }

      setTarget(null);
    },
    [setTarget, setSearch, setIndex, trigger]
  );

  return {
    MentionSelectComponent,
    onChangeMention,
    onKeyDownMention,
  };
};
