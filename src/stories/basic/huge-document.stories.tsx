import React, { useState } from 'react';
import { withHistory } from 'slate-history';
import { EditablePlugins, FormatPlugin, useCreateEditor } from 'slate-plugins';
import { Slate, withReact } from 'slate-react';
import { initialValueHugeDocument } from '../config/initialValues';

export default {
  title: 'Basic|Huge Document',
};

const plugins = [FormatPlugin()];

export const HugeDocument = () => {
  const [value, setValue] = useState(initialValueHugeDocument);
  const editor = useCreateEditor([withReact, withHistory], plugins);
  return (
    <Slate
      editor={editor}
      value={value}
      onChange={newValue => setValue(newValue)}
    >
      <EditablePlugins plugins={plugins} spellCheck autoFocus />
    </Slate>
  );
};
