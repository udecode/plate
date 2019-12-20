import React, { useMemo, useState } from 'react';
import { boolean } from '@storybook/addon-knobs';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import {
  EditablePlugins,
  renderElementVideo,
  VideoPlugin,
  withVideo,
} from 'slate-plugins';
import { Slate, withReact } from 'slate-react';
import { initialValueEmbeds } from '../config/initialValues';

export default {
  title: 'Plugins/VideoPlugin',
};

export const Embeds = () => {
  const plugins: any[] = [];
  const renderElement: any = [];
  if (boolean('VideoPlugin', true)) plugins.push(VideoPlugin());
  if (boolean('renderElementVideo', false))
    renderElement.push(renderElementVideo());

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
        <EditablePlugins
          plugins={plugins}
          renderElement={renderElement}
          placeholder="Enter some text..."
        />
      </Slate>
    );
  };

  const Editor = createReactEditor();

  return <Editor />;
};
