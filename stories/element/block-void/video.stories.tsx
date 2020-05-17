import React, { useMemo, useState } from 'react';
import { boolean } from '@storybook/addon-knobs';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import {
  EditablePlugins,
  ParagraphPlugin,
  pipe,
  renderElementVideo,
  VIDEO,
  VideoPlugin,
  withVoid,
} from '../../../packages/slate-plugins/src';
import { initialValueEmbeds, nodeTypes } from '../../config/initialValues';

export default {
  title: 'Element/Block Void/Video',
  component: VideoPlugin,
  subcomponents: {
    renderElementVideo,
  },
};

const withPlugins = [withReact, withHistory, withVoid([VIDEO])] as const;

export const Example = () => {
  const plugins: any[] = [ParagraphPlugin(nodeTypes)];
  if (boolean('VideoPlugin', true)) plugins.push(VideoPlugin(nodeTypes));

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
