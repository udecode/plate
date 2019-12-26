import React, { useMemo, useState } from 'react';
import { boolean } from '@storybook/addon-knobs';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import {
  EditablePlugins,
  HeadingToolbar,
  ImagePlugin,
  renderElementImage,
  ToolbarImage,
  withImage,
} from '../../packages/slate-plugins/src';
import { initialValueImages } from '../config/initialValues';

export default {
  title: 'Plugins/ImagePlugin',
  component: ImagePlugin,
  subcomponents: {
    renderElementImage,
    InsertImageButton: ToolbarImage,
  },
};

export const Images = () => {
  const plugins: any[] = [];
  if (boolean('ImagePlugin', true)) plugins.push(ImagePlugin());

  const createReactEditor = () => () => {
    const [value, setValue] = useState(initialValueImages);

    const editor = useMemo(
      () => withImage(withHistory(withReact(createEditor()))),
      []
    );

    return (
      <Slate
        editor={editor}
        value={value}
        onChange={newValue => setValue(newValue)}
      >
        <HeadingToolbar>
          <ToolbarImage />
        </HeadingToolbar>
        <EditablePlugins plugins={plugins} placeholder="Enter some text..." />
      </Slate>
    );
  };

  const Editor = createReactEditor();

  return <Editor />;
};
