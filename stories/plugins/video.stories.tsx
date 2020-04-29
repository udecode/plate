import React, { useMemo, useState } from 'react';
import { boolean } from '@storybook/addon-knobs';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import {
  EditablePlugins,
  renderElementVideo,
  VIDEO,
  VideoPlugin,
  withVoid,
} from '../../packages/slate-plugins/src';
import { initialValueEmbeds, nodeTypes } from '../config/initialValues';

export default {
  title: 'Plugins/Video',
  component: VideoPlugin,
  subcomponents: {
    renderElementVideo,
  },
};

export const Example = () => {
  const plugins: any[] = [];
  if (boolean('VideoPlugin', true)) plugins.push(VideoPlugin(nodeTypes));

  const createReactEditor = () => () => {
    const [value, setValue] = useState(initialValueEmbeds);

    const editor = useMemo(
      () => withVoid([VIDEO])(withHistory(withReact(createEditor()))),
      []
    );

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
