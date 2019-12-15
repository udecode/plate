import React, { useState } from 'react';
import { withHistory } from 'slate-history';
import {
  createEditorPlugins,
  EditablePlugins,
  FormatPlugin,
  HoveringToolbar,
  useCreateEditor,
} from 'slate-plugins';
import { Slate, withReact } from 'slate-react';
import { initialValueHoveringToolbar } from './config/initialValues';

const plugins = [FormatPlugin()];

const editorPlugins = createEditorPlugins([withReact, withHistory], plugins);

export const HoveringMenu = () => {
  const [value, setValue] = useState(initialValueHoveringToolbar);

  const editor = useCreateEditor(editorPlugins);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={newValue => setValue(newValue)}
    >
      <HoveringToolbar />
      <EditablePlugins plugins={plugins} placeholder="Enter some text..." />
    </Slate>
  );
};
