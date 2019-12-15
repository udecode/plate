import React, { useState } from 'react';
import { withHistory } from 'slate-history';
import {
  createEditorPlugins,
  EditablePlugins,
  PasteHtmlPlugin,
  useCreateEditor,
} from 'slate-plugins';
import { Slate, withReact } from 'slate-react';
import { initialValuePasteHtml } from './config/initialValues';

const plugins = [PasteHtmlPlugin()];

const editorPlugins = createEditorPlugins([withReact, withHistory], plugins);

export const PasteHtml = () => {
  const [value, setValue] = useState(initialValuePasteHtml);

  const editor = useCreateEditor(editorPlugins);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={newValue => setValue(newValue)}
    >
      <EditablePlugins plugins={plugins} placeholder="Paste in some HTML..." />
    </Slate>
  );
};
