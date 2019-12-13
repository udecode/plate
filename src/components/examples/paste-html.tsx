import React, { useMemo, useState } from 'react';
import { Range } from 'slate';
import { withHistory } from 'slate-history';
import {
  createCustomEditor,
  createEditorPlugins,
  CustomEditable,
  PasteHtmlPlugin,
} from 'slate-plugins';
import { Slate, withReact } from 'slate-react';
import { initialValuePasteHtml } from 'config/initialValues';

export const plugins = [PasteHtmlPlugin()];

export const editorPlugins = createEditorPlugins(
  [withReact, withHistory],
  plugins
);

export const PasteHtml = () => {
  const [value, setValue] = useState(initialValuePasteHtml);
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
      <CustomEditable plugins={plugins} placeholder="Paste in some HTML..." />
    </Slate>
  );
};
