import React from 'react';
import { boolean } from '@storybook/addon-knobs';
import {
  EditablePlugins,
  HeadingPlugin,
  ParagraphPlugin,
  SlatePlugins,
} from '@udecode/slate-plugins';
import { initialValuePreview } from '../config/initialValues';
import { decoratePreview } from './plugin/decoratePreview';
import { PreviewPlugin } from './plugin/PreviewPlugin';
import { renderLeafPreview } from './plugin/renderLeafPreview';

const id = 'Examples/Preview Markdown';

export default {
  title: id,
  component: PreviewPlugin,
  subcomponents: {
    decoratePreview,
    renderLeafPreview,
  },
};

export const Example = () => {
  const plugins: any[] = [ParagraphPlugin(), HeadingPlugin()];

  if (boolean('PreviewPlugin', true)) plugins.push(PreviewPlugin());

  const createReactEditor = () => () => {
    return (
      <SlatePlugins id={id} initialValue={initialValuePreview}>
        <EditablePlugins
          plugins={plugins}
          editableProps={{
            placeholder: 'Write some markdown...',
          }}
        />
      </SlatePlugins>
    );
  };

  const Editor = createReactEditor();

  return <Editor />;
};
