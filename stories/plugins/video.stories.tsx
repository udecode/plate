import React, { useMemo, useState } from 'react';
import { boolean } from '@storybook/addon-knobs';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import {
  EditablePlugins,
  renderElementVideo,
  VideoPlugin,
  withVideo,
} from '../../packages/slate-plugins/src';
import { initialValueEmbeds } from '../config/initialValues';

export default {
  title: 'Plugins/Video',
  component: VideoPlugin,
  subcomponents: {
    renderElementVideo,
  },
};

export const Example = () => {
  const plugins: any[] = [];
  if (boolean('VideoPlugin', true)) plugins.push(VideoPlugin());

  const createReactEditor = () => () => {
    const [value, setValue] = useState(initialValueEmbeds);

    const editor = useMemo(
      () => withVideo(withHistory(withReact(createEditor()))),
      []
    );

    return (
      <Slate
        editor={editor}
        value={value}
        onChange={newValue => setValue(newValue)}
      >
        <EditablePlugins plugins={plugins} placeholder="Enter some text..." />
      </Slate>
    );
  };

  const Editor = createReactEditor();

  return <Editor />;
};
