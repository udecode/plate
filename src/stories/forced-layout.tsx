import React, { useState } from 'react';
import { withHistory } from 'slate-history';
import {
  createEditorPlugins,
  EditablePlugins,
  ForcedLayoutPlugin,
  FormatPlugin,
  useCreateEditor,
} from 'slate-plugins';
import { Slate, withReact } from 'slate-react';
import { initialValueForcedLayout } from './config/initialValues';

const plugins = [ForcedLayoutPlugin(), FormatPlugin()];

const editorPlugins = createEditorPlugins([withReact, withHistory], plugins);

export const ForcedLayout = () => {
  const [value, setValue] = useState(initialValueForcedLayout);

  const editor = useCreateEditor(editorPlugins);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={newValue => setValue(newValue)}
    >
      <EditablePlugins
        plugins={plugins}
        placeholder="Enter a title…"
        spellCheck
        autoFocus
      />
    </Slate>
  );
};
