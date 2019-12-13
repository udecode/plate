import React, { useMemo, useState } from 'react';
import { Range } from 'slate';
import { withHistory } from 'slate-history';
import {
  createCustomEditor,
  createEditorPlugins,
  CustomEditable,
  TablePlugin,
} from 'slate-plugins';
import { Slate, withReact } from 'slate-react';
import { initialValueTables } from '../../config/initialValues';

export const plugins = [TablePlugin()];

export const editorPlugins = createEditorPlugins(
  [withReact, withHistory],
  plugins
);

export const Tables = () => {
  const [value, setValue] = useState(initialValueTables);
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
      <CustomEditable plugins={plugins} />
    </Slate>
  );
};
