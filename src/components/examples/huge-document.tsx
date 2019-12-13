import React, { useMemo, useState } from 'react';
import { Range } from 'slate';
import { withHistory } from 'slate-history';
import {
  createCustomEditor,
  createEditorPlugins,
  CustomEditable,
  FormatPlugin,
} from 'slate-plugins';
import { Slate, withReact } from 'slate-react';
import { initialValueHugeDocument } from '../../config/initialValues';

export const plugins = [FormatPlugin()];

export const editorPlugins = createEditorPlugins(
  [withReact, withHistory],
  plugins
);

export const HugeDocument = () => {
  const [value, setValue] = useState(initialValueHugeDocument);
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
      <CustomEditable plugins={plugins} spellCheck autoFocus />
    </Slate>
  );
};
