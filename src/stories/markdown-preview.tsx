import React, { useState } from 'react';
import { withHistory } from 'slate-history';
import {
  createEditorPlugins,
  EditablePlugins,
  MarkdownPreviewPlugin,
  useCreateEditor,
} from 'slate-plugins';
import { Slate, withReact } from 'slate-react';
import { initialValueMarkdownPreview } from './config/initialValues';

const plugins = [MarkdownPreviewPlugin()];

const editorPlugins = createEditorPlugins([withReact, withHistory], plugins);

export const MarkdownPreview = () => {
  const [value, setValue] = useState(initialValueMarkdownPreview);

  const editor = useCreateEditor(editorPlugins);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={newValue => setValue(newValue)}
    >
      <EditablePlugins plugins={plugins} placeholder="Write some markdown..." />
    </Slate>
  );
};
