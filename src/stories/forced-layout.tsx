import React, { useMemo, useState } from 'react';
import { withHistory } from 'slate-history';
import {
  createCustomEditor,
  createEditorPlugins,
  CustomEditable,
  ForcedLayoutPlugin,
  FormatPlugin,
} from 'slate-plugins';
import { Slate, withReact } from 'slate-react';
import { initialValueForcedLayout } from './config/initialValues';

const plugins = [ForcedLayoutPlugin(), FormatPlugin()];

const editorPlugins = createEditorPlugins([withReact, withHistory], plugins);

export const ForcedLayout = () => {
  const [value, setValue] = useState(initialValueForcedLayout);

  const editor = useMemo(() => createCustomEditor(editorPlugins), []);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={newValue => setValue(newValue)}
    >
      <CustomEditable
        plugins={plugins}
        placeholder="Enter a title…"
        spellCheck
        autoFocus
      />
    </Slate>
  );
};
