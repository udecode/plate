import React, { useMemo, useState } from 'react';
import { boolean } from '@storybook/addon-knobs';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import {
  EditablePlugins,
  HeadingPlugin,
  MediaEmbedPlugin,
  ParagraphPlugin,
  pipe,
  renderElementMediaEmbed,
  SlateDocument,
} from '../../packages/slate-plugins/src';
import { initialValueEmbeds, nodeTypes } from '../config/initialValues';

export default {
  title: 'Elements/Media Embed',
  component: MediaEmbedPlugin,
  subcomponents: {
    renderElementMediaEmbed,
  },
};

const withPlugins = [withReact, withHistory] as const;

export const Example = () => {
  const plugins: any[] = [ParagraphPlugin(nodeTypes), HeadingPlugin(nodeTypes)];
  if (boolean('MediaEmbedPlugin', true))
    plugins.push(MediaEmbedPlugin(nodeTypes));

  const createReactEditor = () => () => {
    const [value, setValue] = useState(initialValueEmbeds);

    const editor = useMemo(() => pipe(createEditor(), ...withPlugins), []);

    return (
      <Slate
        editor={editor}
        value={value}
        onChange={(newValue) => setValue(newValue as SlateDocument)}
      >
        <EditablePlugins plugins={plugins} placeholder="Enter some text..." />
      </Slate>
    );
  };

  const Editor = createReactEditor();

  return <Editor />;
};
