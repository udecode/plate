import React, { useMemo, useState } from 'react';
import { boolean } from '@storybook/addon-knobs';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import {
  decoratePreview,
  EditablePlugins,
  ParagraphPlugin,
  pipe,
  PreviewPlugin,
  renderLeafPreview,
} from 'slate-plugins-next/src';
import { Slate, withReact } from 'slate-react';
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
  const plugins: any[] = [ParagraphPlugin(nodeTypes)];

  if (boolean('PreviewPlugin', true)) plugins.push(PreviewPlugin());

  const createReactEditor = () => () => {
    const [value, setValue] = useState(initialValuePreview);

    const editor = useMemo(() => pipe(createEditor(), ...withPlugins), []);

    return (
      <Slate
        editor={editor}
        value={value}
        onChange={(newValue) => setValue(newValue)}
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
