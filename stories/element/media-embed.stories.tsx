import React, { useMemo, useState } from 'react';
import { boolean } from '@storybook/addon-knobs';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import {
  EditablePlugins,
  MEDIA_EMBED,
  MediaEmbedPlugin,
  ParagraphPlugin,
  pipe,
  renderElementMediaEmbed,
  withVoid,
} from 'slate-plugins-next/src';
import { Slate, withReact } from 'slate-react';
import { initialValueEmbeds, nodeTypes } from '../config/initialValues';

export default {
  title: 'Element/Media Embed',
  component: MediaEmbedPlugin,
  subcomponents: {
    renderElementMediaEmbed,
  },
};

const withPlugins = [withReact, withHistory, withVoid([MEDIA_EMBED])] as const;

export const Example = () => {
  const plugins: any[] = [ParagraphPlugin(nodeTypes)];
  if (boolean('MediaEmbedPlugin', true))
    plugins.push(MediaEmbedPlugin(nodeTypes));

  const createReactEditor = () => () => {
    const [value, setValue] = useState(initialValueEmbeds);

    const editor = useMemo(() => pipe(createEditor(), ...withPlugins), []);

    return (
      <Slate
        editor={editor}
        value={value}
        onChange={(newValue) => setValue(newValue)}
      >
        <EditablePlugins plugins={plugins} placeholder="Enter some text..." />
      </Slate>
    );
  };

  const Editor = createReactEditor();

  return <Editor />;
};
