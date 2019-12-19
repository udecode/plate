import React, { useMemo, useState } from 'react';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import {
  BoldPlugin,
  EditablePlugins,
  HoveringToolbar,
  ItalicPlugin,
  UnderlinePlugin,
} from 'slate-plugins';
import { Slate, withReact } from 'slate-react';
import { initialValueHoveringToolbar } from '../config/initialValues';

export default {
  title: 'Basic/HoveringToolbar',
};

const plugins = [BoldPlugin(), ItalicPlugin(), UnderlinePlugin()];

export const HoveringMenu = () => {
  const [value, setValue] = useState(initialValueHoveringToolbar);

  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={newValue => setValue(newValue)}
    >
      <HoveringToolbar />
      <EditablePlugins plugins={plugins} placeholder="Enter some text..." />
    </Slate>
  );
};
