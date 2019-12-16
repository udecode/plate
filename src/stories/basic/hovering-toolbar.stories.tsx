import React, { useState } from 'react';
import { withHistory } from 'slate-history';
import {
  BoldPlugin,
  EditablePlugins,
  HoveringToolbar,
  ItalicPlugin,
  UnderlinePlugin,
  useCreateEditor,
} from 'slate-plugins';
import { Slate, withReact } from 'slate-react';
import { initialValueHoveringToolbar } from '../config/initialValues';

export default {
  title: 'Basic|HoveringToolbar',
};

const plugins = [BoldPlugin(), ItalicPlugin(), UnderlinePlugin()];

export const HoveringMenu = () => {
  const [value, setValue] = useState(initialValueHoveringToolbar);

  const editor = useCreateEditor([withReact, withHistory], plugins);

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
