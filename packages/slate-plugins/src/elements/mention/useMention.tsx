import React, { useState } from 'react';
import { Editor, Range } from 'slate';
import { MentionSelect } from './components/MentionSelect';
import { onChangeMention } from './onChangeMention';
import { onKeyDownMention } from './onKeyDownMention';
import { OnKeyDownMentionOptions } from './types';

const createOnChangeMention = (
  setTarget: (target: Range | null) => void,
  setSearch: (term: string) => void,
  setIndex: (i: number) => void
) => {
  return (editor: Editor, beforeRegex?: RegExp) =>
    onChangeMention({ editor, setTarget, setSearch, setIndex, beforeRegex });
};

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

const createOnKeyDownMentions = (options: OnKeyDownMentionOptions) => {
  return () => onKeyDownMention(options);
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

  const defaultOnChangeMention = createOnChangeMention(
    setTarget,
    setSearch,
    setIndex
  );
  const MentionSelectComponent = getMentionSelect(target, index, chars);
  const defaultOnKeyDownMention = createOnKeyDownMentions({
    chars,
    target,
    setTarget,
    index,
    setIndex,
  });
  return {
    target,
    setTarget,
    index,
    setIndex,
    search,
    setSearch,
    chars,
    MentionSelectComponent,
    defaultOnChangeMention,
    defaultOnKeyDownMention,
  };
};
