import React, { useState } from 'react';
import { withHistory } from 'slate-history';
import {
  createEditorPlugins,
  EditablePlugins,
  FormatPlugin,
  useCreateEditor,
} from 'slate-plugins';
import { Slate, withReact } from 'slate-react';
import { initialValueHugeDocument } from './config/initialValues';

const plugins = [FormatPlugin()];

const editorPlugins = createEditorPlugins([withReact, withHistory], plugins);

export const HugeDocument = () => {
  const [value, setValue] = useState(initialValueHugeDocument);

  const editor = useCreateEditor(editorPlugins);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={newValue => setValue(newValue)}
    >
      <EditablePlugins plugins={plugins} spellCheck autoFocus />
    </Slate>
  );
};
