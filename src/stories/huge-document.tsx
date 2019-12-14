import React, { useMemo, useState } from 'react';
import { withHistory } from 'slate-history';
import {
  createCustomEditor,
  createEditorPlugins,
  CustomEditable,
  FormatPlugin,
} from 'slate-plugins';
import { Slate, withReact } from 'slate-react';
import { initialValueHugeDocument } from './config/initialValues';

const plugins = [FormatPlugin()];

const editorPlugins = createEditorPlugins([withReact, withHistory], plugins);

export const HugeDocument = () => {
  const [value, setValue] = useState(initialValueHugeDocument);

  const editor = useMemo(() => createCustomEditor(editorPlugins), []);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={newValue => setValue(newValue)}
    >
      <CustomEditable plugins={plugins} spellCheck autoFocus />
    </Slate>
  );
};
