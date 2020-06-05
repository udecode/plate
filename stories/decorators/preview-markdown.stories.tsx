import React, { useMemo, useState } from 'react';
import { boolean } from '@storybook/addon-knobs';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import {
  decoratePreview,
  EditablePlugins,
  HeadingPlugin,
  ParagraphPlugin,
  pipe,
  PreviewPlugin,
  renderLeafPreview,
  SlateDocument,
} from '../../packages/slate-plugins/src';
import { initialValuePreview, nodeTypes } from '../config/initialValues';

export default {
  title: 'Decorators/Preview Markdown',
  component: PreviewPlugin,
  subcomponents: {
    decoratePreview,
    renderLeafPreview,
  },
};

const withPlugins = [withReact, withHistory] as const;

export const Example = () => {
  const plugins: any[] = [ParagraphPlugin(nodeTypes), HeadingPlugin(nodeTypes)];

  if (boolean('PreviewPlugin', true)) plugins.push(PreviewPlugin());

  const createReactEditor = () => () => {
    const [value, setValue] = useState(initialValuePreview);

    const editor = useMemo(() => pipe(createEditor(), ...withPlugins), []);

    return (
      <Slate
        editor={editor}
        value={value}
        onChange={(newValue) => setValue(newValue as SlateDocument)}
      >
        <EditablePlugins
          plugins={plugins}
          placeholder="Write some markdown..."
        />
      </Slate>
    );
  };

  const Editor = createReactEditor();

  return <Editor />;
};
