import React, { useMemo, useState } from 'react';
import { Range } from 'slate';
import { withHistory } from 'slate-history';
import {
  createCustomEditor,
  createEditorPlugins,
  CustomEditable,
  FormatPlugin,
  HoveringToolbar,
} from 'slate-plugins';
import { Slate, withReact } from 'slate-react';
import { initialValueHoveringToolbar } from 'config/initialValues';

export const plugins = [FormatPlugin()];

export const editorPlugins = createEditorPlugins(
  [withReact, withHistory],
  plugins
);

export const HoveringMenu = () => {
  const [value, setValue] = useState(initialValueHoveringToolbar);
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
      <HoveringToolbar />
      <CustomEditable plugins={plugins} placeholder="Enter some text..." />
    </Slate>
  );
};
