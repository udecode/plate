/* eslint-disable no-alert */
import React, { useMemo, useState } from 'react';
import { Range } from 'slate';
import { withHistory } from 'slate-history';
import {
  createCustomEditor,
  createEditorPlugins,
  CustomEditable,
  LinkButton,
  LinkPlugin,
} from 'slate-plugins';
import { Slate, withReact } from 'slate-react';
import { initialValueLinks } from '../../config/initialValues';
import { Toolbar } from '../components';

export const plugins = [LinkPlugin()];

export const editorPlugins = createEditorPlugins(
  [withReact, withHistory],
  plugins
);

export const Links = () => {
  const [value, setValue] = useState(initialValueLinks);
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
        <LinkButton />
      </Toolbar>
      <CustomEditable plugins={plugins} placeholder="Enter some text..." />
    </Slate>
  );
};
