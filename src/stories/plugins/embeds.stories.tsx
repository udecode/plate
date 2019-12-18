import React, { useState } from 'react';
import { boolean } from '@storybook/addon-knobs';
import { withHistory } from 'slate-history';
import {
  EditablePlugins,
  renderElementVideo,
  useCreateEditor,
  VideoPlugin,
} from 'slate-plugins';
import { Slate, withReact } from 'slate-react';
import { initialValueEmbeds } from '../config/initialValues';

export default {
  title: 'Plugins/VideoPlugin',
};

export const Embeds = () => {
  const plugins = [];
  const renderElement = [];
  if (boolean('VideoPlugin', true)) plugins.push(VideoPlugin());
  if (boolean('renderElementVideo', false))
    renderElement.push(renderElementVideo);

  const [value, setValue] = useState(initialValueEmbeds);

  const editor = useCreateEditor([withReact, withHistory], plugins);

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
