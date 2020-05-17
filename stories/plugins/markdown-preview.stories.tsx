import React, { useMemo, useState } from 'react';
import { boolean } from '@storybook/addon-knobs';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import {
  decoratePreview,
  EditablePlugins,
  MarkdownPreviewPlugin,
  ParagraphPlugin,
  pipe,
  renderLeafPreview,
} from '../../packages/slate-plugins/src';
import {
  initialValueMarkdownPreview,
  nodeTypes,
} from '../config/initialValues';

export default {
  title: 'Plugins/Markdown Preview',
  component: MarkdownPreviewPlugin,
  subcomponents: {
    decoratePreview,
    renderLeafPreview,
  },
};

const withPlugins = [withReact, withHistory] as const;

export const Example = () => {
  const plugins: any[] = [ParagraphPlugin(nodeTypes)];

  if (boolean('MarkdownPreviewPlugin', true))
    plugins.push(MarkdownPreviewPlugin());

  const createReactEditor = () => () => {
    const [value, setValue] = useState(initialValueMarkdownPreview);

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
