import { useCallback, useState } from 'react';
import { isPointAtWordEnd, isWordAfterTrigger } from 'common/queries';
import { getNextIndex } from 'elements/mention/utils/getNextIndex';
import { getPreviousIndex } from 'elements/mention/utils/getPreviousIndex';
import { Editor, Range, Transforms } from 'slate';
import { insertMention } from './transforms';
import { MentionableItem, UseMentionOptions } from './types';

export const useMention = (
  mentionables: MentionableItem[] = [],
  { maxSuggestions = 10, trigger = '@' }: UseMentionOptions = {}
) => {
  const [targetRange, setTargetRange] = useState<Range | null>(null);
  const [valueIndex, setValueIndex] = useState(0);
  const [search, setSearch] = useState('');
  const values = mentionables
    .filter((c) => c.value.toLowerCase().includes(search.toLowerCase()))
    .slice(0, maxSuggestions);

  const onKeyDownMention = useCallback(
    (e: any, editor: Editor) => {
      if (targetRange) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setValueIndex(getNextIndex(valueIndex, values.length - 1));
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setValueIndex(getPreviousIndex(valueIndex, values.length - 1));
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          setTargetRange(null);
        }

        if (['Tab', 'Enter'].includes(e.key)) {
          e.preventDefault();
          Transforms.select(editor, targetRange);
          insertMention(editor, values[valueIndex]);
          setTargetRange(null);
        }
      }
    },
    [values, valueIndex, setValueIndex, targetRange, setTargetRange]
  );

  const onChangeMention = useCallback(
    (editor: Editor) => {
      const { selection } = editor;

      if (selection && Range.isCollapsed(selection)) {
        const cursor = Range.start(selection);

        const { range, match: beforeMatch } = isWordAfterTrigger(editor, {
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
      }

      setTargetRange(null);
    },
    [setTargetRange, setSearch, setValueIndex, trigger]
  );

  return {
    search,
    index: valueIndex,
    target: targetRange,
    values,
    onChangeMention,
    onKeyDownMention,
  };
};
