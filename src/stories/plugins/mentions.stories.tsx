import React, { useState } from 'react';
import { withHistory } from 'slate-history';
import {
  EditablePlugins,
  MentionPlugin,
  MentionSelect,
  onChangeMention,
  onKeyDownMention,
  useMention,
  withMention,
} from 'slate-plugins';
import { Slate, withReact } from 'slate-react';
import { CHARACTERS } from '../config/data';
import { initialValueMentions } from '../config/initialValues';

export default {
  title: 'Plugins/MentionPlugin',
};

const plugins = [MentionPlugin()];

export const Mentions = () => {
  const createReactEditor = () => () => {
    const [value, setValue] = useState(initialValueMentions);

    const editor = useMemo(() => withHistory(withReact(createEditor())), []);
    const editor = useCreateEditor(
      [withMention, withReact, withHistory],
      plugins
    );

    const { target, setTarget, index, setIndex, setSearch, chars } = useMention(
      {
        characters: CHARACTERS,
        maxSuggestions: 10,
      }
    );

    return (
      <Slate
        editor={editor}
        value={value}
        onChange={newValue => {
          setValue(newValue);

          onChangeMention({
            editor,
            setTarget,
            setSearch,
            setIndex,
          });
        }}
      >
        <EditablePlugins
          plugins={plugins}
          placeholder="Enter some text..."
          onKeyDown={[
            onKeyDownMention({
              chars,
              target,
              setTarget,
              index,
              setIndex,
            }),
          ]}
        />
        {target && chars.length > 0 && (
          <MentionSelect target={target} index={index} chars={chars} />
        )}
      </Slate>
    );
  };

  const Editor = createReactEditor();

  return <Editor />;
};
