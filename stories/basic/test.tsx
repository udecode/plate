import React, { useMemo, useState } from 'react';
import { createEditor, Node } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import {
  BoldPlugin,
  EditablePlugins,
  ItalicPlugin,
  UnderlinePlugin,
} from '../../packages/slate-plugins/src';

const initialValue: Node[] = [
  {
    children: [
      { text: 'This is editable plain text, just like a <textarea>!' },
    ],
  },
];

const plugins = [BoldPlugin(), ItalicPlugin(), UnderlinePlugin()];

export const Editor = () => {
  const [value, setValue] = useState(initialValue);

  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={newValue => setValue(newValue)}
    >
      <EditablePlugins plugins={plugins} placeholder="Enter some text..." />
    </Slate>
  );
};
