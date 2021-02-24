import React from 'react';
import { boolean } from '@storybook/addon-knobs';
import {
  decoratePreview,
  EditablePlugins,
  HeadingPlugin,
  ParagraphPlugin,
  PreviewPlugin,
  renderLeafPreview,
  SlatePlugins,
} from '@udecode/slate-plugins';
import { initialValuePreview, options } from '../config/initialValues';

const id = 'Decorators/Preview Markdown';

export default {
  title: id,
  component: PreviewPlugin,
  subcomponents: {
    decoratePreview,
    renderLeafPreview,
  },
};

export const Example = () => {
  const plugins: any[] = [ParagraphPlugin(options), HeadingPlugin(options)];

  if (boolean('PreviewPlugin', true)) plugins.push(PreviewPlugin());

  const createReactEditor = () => () => {
    return (
      <SlatePlugins id={id} initialValue={initialValuePreview}>
        <EditablePlugins
          id={id}
          plugins={plugins}
          placeholder="Write some markdown..."
        />
      </SlatePlugins>
    );
  };

  const Editor = createReactEditor();

  return <Editor />;
};
