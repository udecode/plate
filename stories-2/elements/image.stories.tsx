import React from 'react';
import { boolean } from '@storybook/addon-knobs';
import { Image } from '@styled-icons/material';
import {
  EditablePlugins,
  HeadingPlugin,
  ImagePlugin,
  ParagraphPlugin,
  SlatePlugins,
  withImageUpload,
  withInlineVoid,
  withSelectOnBackspace,
} from '@udecode/slate-plugins';
import {
  HeadingToolbar,
  ToolbarImage,
} from '@udecode/slate-plugins-components';
import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import { initialValueImages, options } from '../config/initialValues';

const id = 'Elements/Image';

export default {
  title: id,
  component: ImagePlugin,
};

export const Example = () => {
  const plugins: any[] = [ParagraphPlugin(), HeadingPlugin()];
  if (boolean('ImagePlugin', true)) plugins.push(ImagePlugin());

  const withOverrides = [
    withReact,
    withHistory,
    withImageUpload({}, options),
    withInlineVoid({ plugins }),
    withSelectOnBackspace({ allow: [options.img.type] }),
  ] as const;

  const createReactEditor = () => () => {
    return (
      <SlatePlugins
        id={id}
        initialValue={initialValueImages}
        withOverrides={withOverrides}
      >
        <HeadingToolbar>
          <ToolbarImage {...options} icon={<Image />} />
        </HeadingToolbar>
        <EditablePlugins
          plugins={plugins}
          editableProps={{
            placeholder: 'Enter some text...',
          }}
        />
      </SlatePlugins>
    );
  };

  const Editor = createReactEditor();

  return <Editor />;
};
