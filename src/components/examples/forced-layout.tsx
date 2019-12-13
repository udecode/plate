import React, { useMemo, useState } from 'react';
import { Range } from 'slate';
import { withHistory } from 'slate-history';
import {
  createCustomEditor,
  createEditorPlugins,
  CustomEditable,
  ForcedLayoutPlugin,
  FormatPlugin,
} from 'slate-plugins';
import { Slate, withReact } from 'slate-react';
import { initialValueForcedLayout } from 'config/initialValues';

export const plugins = [ForcedLayoutPlugin(), FormatPlugin()];

export const editorPlugins = createEditorPlugins(
  [withReact, withHistory],
  plugins
);

export const ForcedLayout = () => {
  const [value, setValue] = useState(initialValueForcedLayout);
  const [selection, setSelection] = useState<Range | null>(null);

  const editor = useMemo(() => createCustomEditor(editorPlugins), []);

  return (
    <Slate
      editor={editor}
      value={value}
      selection={selection}
      onChange={(newValue, newSelection) => {
        setValue(newValue);
        setSelection(newSelection);
      }}
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
