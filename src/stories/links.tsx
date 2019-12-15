import React, { useState } from 'react';
import { withHistory } from 'slate-history';
import {
  createEditorPlugins,
  EditablePlugins,
  LinkButton,
  LinkPlugin,
  useCreateEditor,
} from 'slate-plugins';
import { Toolbar } from 'slate-plugins/common/components/Toolbar';
import { Slate, withReact } from 'slate-react';
import { initialValueLinks } from './config/initialValues';

const plugins = [LinkPlugin()];

const editorPlugins = createEditorPlugins([withReact, withHistory], plugins);

export const Links = () => {
  const [value, setValue] = useState(initialValueLinks);

  const editor = useCreateEditor(editorPlugins);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={newValue => setValue(newValue)}
    >
      <Toolbar>
        <LinkButton />
      </Toolbar>
      <EditablePlugins plugins={plugins} placeholder="Enter some text..." />
    </Slate>
  );
};
