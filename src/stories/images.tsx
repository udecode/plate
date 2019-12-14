import React, { useMemo, useState } from 'react';
import { withHistory } from 'slate-history';
import {
  createCustomEditor,
  createEditorPlugins,
  CustomEditable,
  ImagePlugin,
  InsertImageButton,
} from 'slate-plugins';
import { Toolbar } from 'slate-plugins/common/components/Toolbar';
import { Slate, withReact } from 'slate-react';
import { initialValueImages } from './config/initialValues';

const plugins = [ImagePlugin()];

const editorPlugins = createEditorPlugins([withReact, withHistory], plugins);

export const Images = () => {
  const [value, setValue] = useState(initialValueImages);

  const editor = useMemo(() => createCustomEditor(editorPlugins), []);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={newValue => setValue(newValue)}
    >
      <Toolbar>
        <InsertImageButton />
      </Toolbar>
      <CustomEditable plugins={plugins} placeholder="Enter some text..." />
    </Slate>
  );
};
