import React, { useMemo, useState } from 'react';
import { boolean } from '@storybook/addon-knobs';
import { Image } from '@styled-icons/material';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import {
  EditablePlugins,
  HeadingPlugin,
  HeadingToolbar,
  ImagePlugin,
  ParagraphPlugin,
  pipe,
  renderElementImage,
  SlateDocument,
  ToolbarImage,
  withImageUpload,
  withInlineVoid,
} from '../../packages/slate-plugins/src';
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

export const Example = () => {
  const plugins: any[] = [ParagraphPlugin(nodeTypes), HeadingPlugin(nodeTypes)];
  if (boolean('ImagePlugin', true)) plugins.push(ImagePlugin(nodeTypes));

  const withPlugins = [
    withReact,
    withHistory,
    withImageUpload(),
    withInlineVoid({ plugins }),
  ] as const;

  const createReactEditor = () => () => {
    const [value, setValue] = useState(initialValueImages);

    const editor = useMemo(() => pipe(createEditor(), ...withPlugins), []);

    return (
      <Slate
        editor={editor}
        value={value}
        onChange={(newValue) => setValue(newValue as SlateDocument)}
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
