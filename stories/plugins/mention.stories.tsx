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
import { initialValueMentions, nodeTypes } from '../config/initialValues';

export default {
  title: 'Plugins/Mention',
  component: MentionPlugin,
  subcomponents: {
    useMention,
    onChangeMention,
    onKeyDownMention,
    MentionSelect,
  },
};

const plugins = [MentionPlugin(nodeTypes)];

export const Example = () => {
  const createReactEditor = () => () => {
    const [value, setValue] = useState(initialValueMentions);

    const editor = useMemo(
      () => withMention(nodeTypes)(withHistory(withReact(createEditor()))),
      []
    );

    const { MentionSelectComponent,  defaultOnChangeMention, defaultOnKeyDownMention } = useMention(
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

          defaultOnChangeMention(editor);
        }}
      >
        <EditablePlugins
          plugins={plugins}
          placeholder="Enter some text..."
          onKeyDown={[
            defaultOnKeyDownMention(),
          ]}
        />
          <MentionSelectComponent />
      </Slate>
    );
  };

  const Editor = createReactEditor();

  return <Editor />;
};
