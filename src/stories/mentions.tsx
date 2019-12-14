import React, { useMemo, useState } from 'react';
import { Editor, Range } from 'slate';
import { withHistory } from 'slate-history';
import {
  createCustomEditor,
  createEditorPlugins,
  CustomEditable,
  MentionPlugin,
  MentionSelect,
} from 'slate-plugins';
import { Slate, withReact } from 'slate-react';
import { CHARACTERS } from './config/data';
import { initialValueMentions } from './config/initialValues';

const plugins = [MentionPlugin()];

const editorPlugins = createEditorPlugins([withReact, withHistory], plugins);

export const Mentions = () => {
  const [value, setValue] = useState(initialValueMentions);
  const [target, setTarget] = useState<Range | null>();
  const [index, setIndex] = useState(0);
  const [search, setSearch] = useState('');

  const editor = useMemo(() => createCustomEditor(editorPlugins), []);

  const chars = CHARACTERS.filter(c =>
    c.toLowerCase().startsWith(search.toLowerCase())
  ).slice(0, 10);

  const pluginProps = useMemo(
    () => ({ chars, index, target, setIndex, setTarget }),
    [chars, index, target]
  );

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
      <CustomEditable
        plugins={plugins}
        pluginProps={pluginProps}
        placeholder="Enter some text..."
      />
      {target && chars.length > 0 && (
        <MentionSelect target={target} index={index} chars={chars} />
      )}
    </Slate>
  );
};
