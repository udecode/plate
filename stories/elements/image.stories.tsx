import React from 'react';
import { boolean } from '@storybook/addon-knobs';
import { Image } from '@styled-icons/material';
import {
  EditablePlugins,
  HeadingPlugin,
  ImagePlugin,
  ParagraphPlugin,
  renderElementImage,
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
    return (
      <SlatePlugins
        id={id}
        initialValue={initialValueImages}
        withPlugins={withPlugins}
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
