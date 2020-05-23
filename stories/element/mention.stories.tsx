import React, { useMemo, useState } from 'react';
import { text } from '@storybook/addon-knobs';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import {
  EditablePlugins,
  MentionPlugin,
  MentionSelect,
  ParagraphPlugin,
  pipe,
  useMention,
  withMention,
} from 'slate-plugins-next/src';
import { Slate, withReact } from 'slate-react';
import { initialValueMentions, nodeTypes } from '../config/initialValues';
import { MENTIONABLES } from '../config/mentionables';

export default {
  title: 'Element/Mention',
  component: MentionPlugin,
  subcomponents: {
    useMention,
    MentionSelect,
  },
};

const withPlugins = [withReact, withHistory, withMention(nodeTypes)] as const;

export const Example = () => {
  const plugins = [
    ParagraphPlugin(nodeTypes),
    MentionPlugin({
      ...nodeTypes,
      onClick: (mentionable) => console.info(`Hello, I'm ${mentionable.value}`),
      prefix: text('prefix', '@'),
    }),
  ];

  const createReactEditor = () => () => {
    const [value, setValue] = useState(initialValueMentions);

    const editor = useMemo(() => pipe(createEditor(), ...withPlugins), []);

    const {
      onAddMention,
      onChangeMention,
      onKeyDownMention,
      search,
      index,
      target,
      values,
    } = useMention(MENTIONABLES, {
      maxSuggestions: 10,
      trigger: '@',
    });

    return (
      <Slate
        editor={editor}
        value={value}
        onChange={(newValue) => {
          setValue(newValue);

          onChangeMention(editor);
        }}
      >
        <EditablePlugins
          plugins={plugins}
          placeholder="Enter some text..."
          onKeyDown={[onKeyDownMention]}
          onKeyDownDeps={[index, search, target]}
        />

        <MentionSelect
          at={target}
          valueIndex={index}
          options={values}
          onClickMention={onAddMention}
        />
      </Slate>
    );
  };

  const Editor = createReactEditor();

  return <Editor />;
};
