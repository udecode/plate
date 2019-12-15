import React, { useState } from 'react';
import { withHistory } from 'slate-history';
import {
  createEditorPlugins,
  EditablePlugins,
  useCreateEditor,
  VideoPlugin,
} from 'slate-plugins';
import { Slate, withReact } from 'slate-react';
import { initialValueEmbeds } from './config/initialValues';

const plugins = [VideoPlugin()];

const editorPlugins = createEditorPlugins([withReact, withHistory], plugins);

export const Embeds = () => {
  const [value, setValue] = useState(initialValueEmbeds);

  const editor = useCreateEditor(editorPlugins);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={newValue => setValue(newValue)}
    >
      <EditablePlugins plugins={plugins} placeholder="Enter some text..." />
    </Slate>
  );
};
