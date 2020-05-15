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
  ParagraphPlugin,
  useMention,
  withMention,
} from '../../../packages/slate-plugins/src';
import { CHARACTERS } from '../../config/data';
import { initialValueMentions, nodeTypes } from '../../config/initialValues';

export default {
  title: 'Element/Inline Void/Mention',
  component: MentionPlugin,
  subcomponents: {
    useMention,
    onChangeMention,
    onKeyDownMention,
    MentionSelect,
  },
};

const plugins = [ParagraphPlugin(nodeTypes), MentionPlugin(nodeTypes)];

export const Example = () => {
  const createReactEditor = () => () => {
    const [value, setValue] = useState(initialValueMentions);

    const editor = useMemo(
      () => withMention(nodeTypes)(withHistory(withReact(createEditor()))),
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
        onChange={(newValue) => {
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
