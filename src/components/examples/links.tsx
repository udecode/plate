import React, { useMemo, useState } from 'react';
import { withHistory } from 'slate-history';
import {
  createCustomEditor,
  createEditorPlugins,
  CustomEditable,
  LinkButton,
  LinkPlugin,
} from 'slate-plugins';
import { Slate, withReact } from 'slate-react';
import { initialValueLinks } from 'config/initialValues';
import { Toolbar } from '../components';

const plugins = [LinkPlugin()];

const editorPlugins = createEditorPlugins([withReact, withHistory], plugins);

export const Links = () => {
  const [value, setValue] = useState(initialValueLinks);

  const editor = useMemo(() => createCustomEditor(editorPlugins), []);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={newValue => setValue(newValue)}
    >
      <Toolbar>
        <LinkButton />
      </Toolbar>
      <CustomEditable plugins={plugins} placeholder="Enter some text..." />
    </Slate>
  );
};
