import React, { useState } from 'react';
import { boolean } from '@storybook/addon-knobs';
import { withHistory } from 'slate-history';
import {
  decoratePreview,
  EditablePlugins,
  MarkdownPreviewPlugin,
  renderLeafPreview,
} from 'slate-plugins';
import { Slate, withReact } from 'slate-react';
import { initialValueMarkdownPreview } from '../config/initialValues';

export default {
  title: 'Plugins/MarkdownPreviewPlugin',
};

export const MarkdownPreview = () => {
  const plugins: any[] = [];
  const decorate = [];
  const renderLeaf = [];
  if (boolean('MarkdownPreviewPlugin', true))
    plugins.push(MarkdownPreviewPlugin());
  else {
    if (boolean('decoratePreview', false)) decorate.push(decoratePreview);
    if (boolean('renderLeafLink', false)) renderLeaf.push(renderLeafPreview);
  }

  const createReactEditor = () => () => {
    const [value, setValue] = useState(initialValueMarkdownPreview);

    const editor = useMemo(() => withHistory(withReact(createEditor())), []);
    const editor = useCreateEditor([withReact, withHistory], plugins);

    return (
      <Slate
        editor={editor}
        value={value}
        onChange={newValue => setValue(newValue)}
      >
        <EditablePlugins
          plugins={plugins}
          decorate={decorate}
          renderLeaf={renderLeaf}
          placeholder="Write some markdown..."
        />
      </Slate>
    );
  };

  const Editor = createReactEditor();

  return <Editor />;
};
