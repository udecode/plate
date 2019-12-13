import React, { useMemo, useState } from 'react';
import { Range } from 'slate';
import { withHistory } from 'slate-history';
import {
  createCustomEditor,
  createEditorPlugins,
  CustomEditable,
  VideoPlugin,
} from 'slate-plugins';
import { Slate, withReact } from 'slate-react';
import { initialValueEmbeds } from 'config/initialValues';

export const plugins = [VideoPlugin()];

export const editorPlugins = createEditorPlugins(
  [withReact, withHistory],
  plugins
);

export const Embeds = () => {
  const [value, setValue] = useState(initialValueEmbeds);
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
      <CustomEditable plugins={plugins} placeholder="Enter some text..." />
    </Slate>
  );
};
