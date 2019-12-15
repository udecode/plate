import React, { useState } from 'react';
import { withHistory } from 'slate-history';
import {
  createEditorPlugins,
  EditablePlugins,
  MarkdownShortcutsPlugin,
  useCreateEditor,
} from 'slate-plugins';
import { Slate, withReact } from 'slate-react';
import { initialValueMarkdownShortcuts } from './config/initialValues';

const plugins = [MarkdownShortcutsPlugin()];

const editorPlugins = createEditorPlugins([withReact, withHistory], plugins);

export const MarkdownShortcuts = () => {
  const [value, setValue] = useState(initialValueMarkdownShortcuts);

  const editor = useCreateEditor(editorPlugins);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={newValue => setValue(newValue)}
    >
      <EditablePlugins
        plugins={plugins}
        placeholder="Write some markdown..."
        spellCheck
        autoFocus
      />
    </Slate>
  );
};
