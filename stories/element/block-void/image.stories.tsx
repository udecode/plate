import React, { useMemo, useState } from 'react';
import { boolean } from '@storybook/addon-knobs';
import { Image } from '@styled-icons/material';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import {
  EditablePlugins,
  HeadingToolbar,
  ImagePlugin,
  ParagraphPlugin,
  renderElementImage,
  ToolbarImage,
  withImage,
} from '../../../packages/slate-plugins/src';
import { initialValueImages, nodeTypes } from '../../config/initialValues';

export default {
  title: 'Element/Block Void/Image',
  component: ImagePlugin,
  subcomponents: {
    renderElementImage,
    ToolbarImage,
  },
};

export const Example = () => {
  const plugins: any[] = [ParagraphPlugin(nodeTypes)];
  if (boolean('ImagePlugin', true)) plugins.push(ImagePlugin(nodeTypes));

  const createReactEditor = () => () => {
    const [value, setValue] = useState(initialValueImages);

    const editor = useMemo(
      () => withImage(nodeTypes)(withHistory(withReact(createEditor()))),
      []
    );

    return (
      <Slate
        editor={editor}
        value={value}
        onChange={(newValue) => setValue(newValue)}
      >
        <HeadingToolbar>
          <ToolbarImage {...nodeTypes} icon={<Image />} />
        </HeadingToolbar>
        <EditablePlugins plugins={plugins} placeholder="Enter some text..." />
      </Slate>
    );
  };

  const Editor = createReactEditor();

  return <Editor />;
};
