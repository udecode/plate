import React, { useMemo, useState } from 'react';
import { withHistory } from 'slate-history';
import {
  createCustomEditor,
  createEditorPlugins,
  CustomEditable,
  VideoPlugin,
} from 'slate-plugins';
import { Slate, withReact } from 'slate-react';
import { initialValueEmbeds } from 'config/initialValues';

const plugins = [VideoPlugin()];

const editorPlugins = createEditorPlugins([withReact, withHistory], plugins);

export const Embeds = () => {
  const [value, setValue] = useState(initialValueEmbeds);

  const editor = useMemo(() => createCustomEditor(editorPlugins), []);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={newValue => setValue(newValue)}
    >
      <CustomEditable plugins={plugins} placeholder="Enter some text..." />
    </Slate>
  );
};
