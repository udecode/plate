import React, { useMemo, useState } from 'react';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import {
  EditablePlugins,
  MentionPlugin,
  MentionSelect,
  onChangeMention,
  onKeyDownMention,
  useMention,
  withMention,
} from '../../packages/slate-plugins/src';
import { CHARACTERS } from '../config/data';
import { initialValueMentions } from '../config/initialValues';

export default {
  title: 'Plugins/MentionPlugin',
  component: MentionPlugin,
  subcomponents: {
    useMention,
    onChangeMention,
    onKeyDownMention,
    MentionSelect,
  },
};

const plugins = [MentionPlugin()];

export const Mentions = () => {
  const createReactEditor = () => () => {
    const [value, setValue] = useState(initialValueMentions);

    const editor = useMemo(
      () => withMention(withHistory(withReact(createEditor()))),
      []
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
