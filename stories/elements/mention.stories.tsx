import React, { useMemo, useState } from 'react';
import { text } from '@storybook/addon-knobs';
import {
  EditablePlugins,
  HeadingPlugin,
  MentionNodeData,
  MentionPlugin,
  MentionSelect,
  ParagraphPlugin,
  pipe,
  SlateDocument,
  useMention,
  withInlineVoid,
} from '@udecode/slate-plugins';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import { initialValueMentions, options } from '../config/initialValues';
import { MENTIONABLES } from '../config/mentionables';

export default {
  title: 'Elements/Mention',
  component: MentionPlugin,
  subcomponents: {
    useMention,
    MentionSelect,
  },
};

export const Example = () => {
  const plugins = [
    ParagraphPlugin(options),
    HeadingPlugin(options),
    MentionPlugin({
      mention: {
        ...options.mention,
        rootProps: {
          onClick: (mentionable: MentionNodeData) =>
            console.info(`Hello, I'm ${mentionable.value}`),
          prefix: text('prefix', '@'),
        },
      },
    }),
  ];

  const withPlugins = [
    withReact,
    withHistory,
    withInlineVoid({ plugins }),
  ] as const;

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
          setValue(newValue as SlateDocument);

          onChangeMention(editor);
        }}
      >
        <EditablePlugins
          plugins={plugins}
          placeholder='Enter some text...'
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
