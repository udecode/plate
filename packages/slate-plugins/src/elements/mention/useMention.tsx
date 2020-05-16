import React, { useCallback, useState } from 'react';
import { Editor, Range, Transforms } from 'slate';
import { MentionSelect } from './components/MentionSelect';
import { insertMention } from './transforms';

const getMentionSelect = (
  target: Range | null,
  index: number,
  chars: string[]
) => {
  return () => {
    if (target && chars.length > 0) {
      return <MentionSelect target={target} index={index} chars={chars} />;
    }
    return null;
  };
};

export const useMention = ({
  characters = [],
  maxSuggestions = 10,
}: {
  characters: string[];
  maxSuggestions: number;
}) => {
  const [target, setTarget] = useState<Range | null>(null);
  const [index, setIndex] = useState(0);
  const [search, setSearch] = useState('');
  const chars: string[] = characters
    .filter((c) => c.toLowerCase().includes(search.toLowerCase()))
    .slice(0, maxSuggestions);

  const MentionSelectComponent = getMentionSelect(target, index, chars);

  const onKeyDownMention = useCallback(
    (e: any, editor: Editor) => {
      if (target) {
        switch (e.key) {
          case 'ArrowDown': {
            e.preventDefault();
            const prevIndex = index >= chars.length - 1 ? 0 : index + 1;
            setIndex(prevIndex);
            break;
          }
          case 'ArrowUp': {
            e.preventDefault();
            const nextIndex = index <= 0 ? chars.length - 1 : index - 1;
            setIndex(nextIndex);
            break;
          }
          case 'Tab':
          case 'Enter':
            e.preventDefault();
            Transforms.select(editor, target);
            insertMention(editor, chars[index]);
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
    [chars, index, setIndex, target, setTarget]
  );

  const onChangeMention = useCallback(
    ({
      editor,
      beforeRegex = /^@(\w+)$/,
    }: {
      editor: Editor;
      beforeRegex?: RegExp;
    }) => {
      const { selection } = editor;

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
        const afterMatch = afterText.match(/^(\s|$)/);
        if (beforeMatch && afterMatch) {
          setTarget(beforeRange ?? null);
          setSearch(beforeMatch[1]);
          setIndex(0);
          return;
        }
      }

      setTarget(null);
    },
    [setTarget, setSearch, setIndex]
  );

  return {
    target,
    setTarget,
    index,
    setIndex,
    search,
    setSearch,
    chars,
    MentionSelectComponent,
    onChangeMention,
    onKeyDownMention,
  };
};
