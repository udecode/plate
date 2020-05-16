import React, { useMemo, useState } from 'react';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import {
  EditablePlugins,
  MentionPlugin,
  MentionSelect,
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

    const {
      MentionSelectComponent,
      onChangeMention,
      onKeyDownMention,
    } = useMention(CHARACTERS, {
      maxSuggestions: 10,
      trigger: '@',
      prefix: ''
    });

    return (
      <Slate
        editor={editor}
        value={value}
        onChange={(newValue) => {
          setValue(newValue);

          onChangeMention({ editor });
        }}
      >
        <EditablePlugins
          plugins={plugins}
          placeholder="Enter some text..."
          onKeyDown={[onKeyDownMention]}
        />
        <MentionSelectComponent />
      </Slate>
    );
  };

  const Editor = createReactEditor();

  return <Editor />;
};
