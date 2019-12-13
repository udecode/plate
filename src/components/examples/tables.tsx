import React, { useMemo, useState } from 'react';
import { withHistory } from 'slate-history';
import {
  createCustomEditor,
  createEditorPlugins,
  CustomEditable,
  TablePlugin,
} from 'slate-plugins';
import { Slate, withReact } from 'slate-react';
import { initialValueTables } from 'config/initialValues';

const plugins = [TablePlugin()];

const editorPlugins = createEditorPlugins([withReact, withHistory], plugins);

export const Tables = () => {
  const [value, setValue] = useState(initialValueTables);

  const editor = useMemo(() => createCustomEditor(editorPlugins), []);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={newValue => setValue(newValue)}
    >
      <CustomEditable plugins={plugins} />
    </Slate>
  );
};
