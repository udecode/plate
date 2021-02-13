import React, { useMemo, useState } from 'react';
import { boolean } from '@storybook/addon-knobs';
import {
  EditablePlugins,
  ELEMENT_IMAGE,
  HeadingPlugin,
  MediaEmbedPlugin,
  ParagraphPlugin,
  pipe,
  renderElementMediaEmbed,
  SlateDocument,
  withInlineVoid,
  withSelectOnBackspace,
} from '@udecode/slate-plugins';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import { initialValueEmbeds, options } from '../config/initialValues';

export default {
  title: 'Elements/Media Embed',
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
    const [value, setValue] = useState(initialValueEmbeds);

    const editor = useMemo(() => pipe(createEditor(), ...withPlugins), []);

    return (
      <Slate
        editor={editor}
        value={value}
        onChange={(newValue) => setValue(newValue as SlateDocument)}
      >
        <EditablePlugins plugins={plugins} placeholder="Enter some text..." />
      </Slate>
    );
  };

  const Editor = createReactEditor();

  return <Editor />;
};
