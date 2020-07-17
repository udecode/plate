import React, { useMemo, useState } from 'react';
import {
  EditablePlugins,
  HeadingPlugin,
  ParagraphPlugin,
  pipe,
  SlateDocument,
} from '@udecode/slate-plugins';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import { initialValueHugeDocument, options } from '../config/initialValues';

export default {
  title: 'Examples/Huge Document',
};

const plugins = [ParagraphPlugin(options), HeadingPlugin(options)];

const withPlugins = [withReact, withHistory] as const;

export const Example = () => {
  const [value, setValue] = useState(initialValueHugeDocument);

  const editor = useMemo(() => pipe(createEditor(), ...withPlugins), []);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={(newValue) => setValue(newValue as SlateDocument)}
    >
      <EditablePlugins plugins={plugins} spellCheck autoFocus />
    </Slate>
  );
};
