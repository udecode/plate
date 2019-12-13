import React, { useMemo, useState } from 'react';
import { Range } from 'slate';
import { withHistory } from 'slate-history';
import {
  createCustomEditor,
  createEditorPlugins,
  CustomEditable,
  HighlightPlugin,
  ToolbarHighlight,
} from 'slate-plugins';
import { Slate, withReact } from 'slate-react';
import { initialValueSearchHighlighting } from 'config/initialValues';

export const plugins = [HighlightPlugin()];

export const editorPlugins = createEditorPlugins(
  [withReact, withHistory],
  plugins
);

export const SearchHighlighting = () => {
  const [value, setValue] = useState(initialValueSearchHighlighting);
  const [selection, setSelection] = useState<Range | null>(null);
  const [search, setSearch] = useState<string>();
  const pluginProps = useMemo(() => ({ search }), [search]);
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
      <ToolbarHighlight setSearch={setSearch} />
      <CustomEditable plugins={plugins} pluginProps={pluginProps} />
    </Slate>
  );
};
