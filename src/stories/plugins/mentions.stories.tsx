import React, { useState } from 'react';
import { Editor, Range } from 'slate';
import { withHistory } from 'slate-history';
import {
  EditablePlugins,
  MentionPlugin,
  MentionSelect,
  onKeyDownMention,
  useCreateEditor,
} from 'slate-plugins';
import { Slate, withReact } from 'slate-react';
import { CHARACTERS } from '../config/data';
import { initialValueMentions } from '../config/initialValues';

export default {
  title: 'Plugins|MentionPlugin',
};

const plugins = [MentionPlugin()];

export const Mentions = () => {
  const [value, setValue] = useState(initialValueMentions);
  const [target, setTarget] = useState<Range | null>();
  const [index, setIndex] = useState(0);
  const [search, setSearch] = useState('');

  const chars = CHARACTERS.filter(c =>
    c.toLowerCase().startsWith(search.toLowerCase())
  ).slice(0, 10);

  const editor = useCreateEditor([withReact, withHistory], plugins);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={newValue => {
        setValue(newValue);

        const { selection } = editor;

        if (selection && Range.isCollapsed(selection)) {
          const [start] = Range.edges(selection);
          const wordBefore = Editor.before(editor, start, { unit: 'word' });
          const before = wordBefore && Editor.before(editor, wordBefore);
          const beforeRange = before && Editor.range(editor, before, start);
          const beforeText = beforeRange && Editor.text(editor, beforeRange);
          const beforeMatch = beforeText && beforeText.match(/^@(\w+)$/);
          const after = Editor.after(editor, start);
          const afterRange = Editor.range(editor, start, after);
          const afterText = Editor.text(editor, afterRange);
          const afterMatch = afterText.match(/^(\s|$)/);

          if (beforeMatch && afterMatch) {
            setTarget(beforeRange);
            setSearch(beforeMatch[1]);
            setIndex(0);
            return;
          }
        }

        setTarget(null);
      }}
    >
      <EditablePlugins
        plugins={plugins}
        placeholder="Enter some text..."
        onKeyDown={[
          e =>
            onKeyDownMention(e, editor, {
              chars,
              index,
              target,
              setIndex,
              setTarget,
            }),
        ]}
      />
      {target && chars.length > 0 && (
        <MentionSelect target={target} index={index} chars={chars} />
      )}
    </Slate>
  );
};
