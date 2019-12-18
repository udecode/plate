import React, { useState } from 'react';
import { Editor, Range } from 'slate';
import { RenderElementProps, SlatePlugin } from 'slate-react';
import { MentionElement } from './MentionElement';

export const MentionType = 'mention';

interface Options {
  chars: any[];
  index: number;
  target: any;
  setIndex: any;
  setTarget: any;
}

export const useMention = ({
  characters = [],
  maxSuggestions = 10,
}: {
  characters: string[];
  maxSuggestions: number;
}) => {
  const [target, setTarget] = useState<Range | null>();
  const [index, setIndex] = useState(0);
  const [search, setSearch] = useState('');
  const chars = characters
    .filter(c => c.toLowerCase().startsWith(search.toLowerCase()))
    .slice(0, maxSuggestions);
  return { target, setTarget, index, setIndex, search, setSearch, chars };
};

export const onChangeMention = ({
  editor,
  setTarget,
  setSearch,
  setIndex,
  beforeRegex = /^@(\w+)$/,
}: {
  editor: Editor;
  setTarget: any;
  setSearch: any;
  setIndex: any;
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
      setTarget(beforeRange);
      setSearch(beforeMatch[1]);
      setIndex(0);
      return;
    }
  }

  setTarget(null);
};

export const withMention = (editor: Editor) => {
  const { exec, isInline, isVoid } = editor;

  editor.isInline = element => {
    return element.type === MentionType ? true : isInline(element);
  };

  editor.isVoid = element => {
    return element.type === MentionType ? true : isVoid(element);
  };

  editor.exec = command => {
    if (command.type === 'insert_mention') {
      const mention = {
        type: MentionType,
        character: command.character,
        children: [{ text: '' }],
      };

      Editor.insertNodes(editor, mention);
      Editor.move(editor);
    } else {
      exec(command);
    }
  };

  return editor;
};

export const renderElementMention = (props: RenderElementProps) => {
  const { element } = props;
  switch (element.type) {
    case MentionType:
      return <MentionElement {...props} />;
    default:
      break;
  }
};

export const onKeyDownMention = (
  e: any,
  editor: Editor,
  { chars, index, target, setIndex, setTarget }: Options
) => {
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
        Editor.select(editor, target);
        editor.exec({ type: 'insert_mention', character: chars[index] });
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
};

export const MentionPlugin = (): SlatePlugin => ({
  editor: withMention,
  renderElement: renderElementMention,
  // onKeyDown: onKeyDownMention,
});
