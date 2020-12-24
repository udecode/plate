import React, { useMemo, useState } from 'react';
import { boolean } from '@storybook/addon-knobs';
import { Image } from '@styled-icons/material';
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
  withSelectOnBackspace,
} from '@udecode/slate-plugins';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import { initialValueImages, options } from '../config/initialValues';

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
  const plugins: any[] = [ParagraphPlugin(options), HeadingPlugin(options)];
  if (boolean('ImagePlugin', true)) plugins.push(ImagePlugin(options));

  const withPlugins = [
    withReact,
    withHistory,
    withImageUpload(),
    withInlineVoid({ plugins }),
    withSelectOnBackspace({ allow: [options.img.type] }),
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
          <ToolbarImage {...options} icon={<Image />} />
        </HeadingToolbar>
        <EditablePlugins plugins={plugins} placeholder="Enter some text..." />
      </Slate>
    );
  };

  const Editor = createReactEditor();

  return <Editor />;
};
