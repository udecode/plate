import React, { useMemo, useState } from 'react';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import {
  EditablePlugins,
  HeadingPlugin,
  ParagraphPlugin,
} from '../../packages/slate-plugins/src';
import { initialValueHugeDocument, nodeTypes } from '../config/initialValues';

export default {
  title: 'Examples/Huge Document',
};

const plugins = [ParagraphPlugin(nodeTypes), HeadingPlugin(nodeTypes)];

export const Example = () => {
  const [value, setValue] = useState(initialValueHugeDocument);

  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={(newValue) => setValue(newValue)}
    >
      <EditablePlugins plugins={plugins} spellCheck autoFocus />
    </Slate>
  );
};
