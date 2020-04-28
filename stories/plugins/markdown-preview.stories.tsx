import React, { useMemo, useState } from 'react';
import { boolean } from '@storybook/addon-knobs';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import {
  decoratePreview,
  EditablePlugins,
  MarkdownPreviewPlugin,
  renderLeafPreview,
} from '../../packages/slate-plugins/src';
import { initialValueMarkdownPreview } from '../config/initialValues';

export default {
  title: 'Plugins/Markdown Preview',
  component: MarkdownPreviewPlugin,
  subcomponents: {
    decoratePreview,
    renderLeafPreview,
  },
};

export const Example = () => {
  const plugins: any[] = [];

  if (boolean('MarkdownPreviewPlugin', true))
    plugins.push(MarkdownPreviewPlugin());

  const createReactEditor = () => () => {
    const [value, setValue] = useState(initialValueMarkdownPreview);

    const editor = useMemo(() => withHistory(withReact(createEditor())), []);

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
