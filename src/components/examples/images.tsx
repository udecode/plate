import React, { useMemo, useState } from 'react';
import { Range } from 'slate';
import { withHistory } from 'slate-history';
import {
  createCustomEditor,
  createEditorPlugins,
  CustomEditable,
  ImagePlugin,
  InsertImageButton,
} from 'slate-plugins';
import { Slate, withReact } from 'slate-react';
import { initialValueImages } from 'config/initialValues';
import { Toolbar } from '../components';

export const plugins = [ImagePlugin()];

export const editorPlugins = createEditorPlugins(
  [withReact, withHistory],
  plugins
);

export const Images = () => {
  const [value, setValue] = useState(initialValueImages);
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
      <Toolbar>
        <InsertImageButton />
      </Toolbar>
      <CustomEditable plugins={plugins} placeholder="Enter some text..." />
    </Slate>
  );
};
