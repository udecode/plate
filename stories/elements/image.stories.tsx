import React, { useMemo, useState } from 'react';
import { boolean } from '@storybook/addon-knobs';
import { Image } from '@styled-icons/material';
import {
  EditablePlugins,
  HeadingToolbar,
  ImagePlugin,
  ParagraphPlugin,
  pipe,
  renderElementImage,
  ToolbarImage,
  withImageUpload,
} from '@udecode/slate-plugins/src';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import { initialValueImages, nodeTypes } from '../config/initialValues';

export default {
  title: 'Elements/Image',
  component: ImagePlugin,
  subcomponents: {
    renderElementImage,
    ToolbarImage,
    withImageUpload,
  },
};

const withPlugins = [
  withReact,
  withHistory,
  withImageUpload(nodeTypes),
] as const;

export const Example = () => {
  const plugins: any[] = [ParagraphPlugin(nodeTypes)];
  if (boolean('ImagePlugin', true)) plugins.push(ImagePlugin(nodeTypes));

  const createReactEditor = () => () => {
    const [value, setValue] = useState(initialValueImages);

    const editor = useMemo(() => pipe(createEditor(), ...withPlugins), []);

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
