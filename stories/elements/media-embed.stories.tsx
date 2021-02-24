import React from 'react';
import { boolean } from '@storybook/addon-knobs';
import {
  EditablePlugins,
  ELEMENT_IMAGE,
  HeadingPlugin,
  MediaEmbedPlugin,
  ParagraphPlugin,
  renderElementMediaEmbed,
  SlatePlugins,
  withInlineVoid,
  withSelectOnBackspace,
} from '@udecode/slate-plugins';
import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import { initialValueEmbeds, options } from '../config/initialValues';

const id = 'Elements/Media Embed';

export default {
  title: id,
  component: MediaEmbedPlugin,
  subcomponents: {
    renderElementMediaEmbed,
  },
};

export const Example = () => {
  const plugins: any[] = [ParagraphPlugin(options), HeadingPlugin(options)];
  if (boolean('MediaEmbedPlugin', true))
    plugins.push(MediaEmbedPlugin(options));

  const withPlugins = [
    withReact,
    withHistory,
    withInlineVoid({ plugins }),
    withSelectOnBackspace({ allow: [ELEMENT_IMAGE] }),
  ] as const;

  const createReactEditor = () => () => {
    return (
      <SlatePlugins
        id={id}
        initialValue={initialValueEmbeds}
        withPlugins={withPlugins}
      >
        <EditablePlugins
          id={id}
          plugins={plugins}
          placeholder="Enter some text..."
        />
      </SlatePlugins>
    );
  };

  const Editor = createReactEditor();

  return <Editor />;
};
