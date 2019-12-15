import React, { useState } from 'react';
import { withHistory } from 'slate-history';
import {
  createEditorPlugins,
  EditablePlugins,
  ImagePlugin,
  InsertImageButton,
  useCreateEditor,
} from 'slate-plugins';
import { Toolbar } from 'slate-plugins/common/components/Toolbar';
import { Slate, withReact } from 'slate-react';
import { initialValueImages } from './config/initialValues';

const plugins = [ImagePlugin()];

const editorPlugins = createEditorPlugins([withReact, withHistory], plugins);

export const Images = () => {
  const [value, setValue] = useState(initialValueImages);

  const editor = useCreateEditor(editorPlugins);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={newValue => setValue(newValue)}
    >
      <Toolbar height={18}>
        <InsertImageButton />
      </Toolbar>
      <EditablePlugins plugins={plugins} placeholder="Enter some text..." />
    </Slate>
  );
};
