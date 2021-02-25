import React, { useMemo, useState } from 'react';
import {
  BlockquotePlugin,
  BoldPlugin,
  CodeBlockPlugin,
  CodePlugin,
  EditablePlugins,
  HeadingPlugin,
  ImagePlugin,
  ItalicPlugin,
  LinkPlugin,
  ListPlugin,
  ParagraphPlugin,
  pipe,
  SlateDocument,
  StrikethroughPlugin,
  TablePlugin,
  UnderlinePlugin,
  withCodeBlock,
  withDeserializeMd,
  withImageUpload,
  withInlineVoid,
  withLink,
  withList,
  withTable,
} from '@udecode/slate-plugins';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import { initialValuePasteMd, options } from '../config/initialValues';

export default {
  title: 'Deserializers/Markdown',
  component: withDeserializeMd,
};

const plugins = [
  ParagraphPlugin(options),
  BlockquotePlugin(options),
  CodeBlockPlugin(options),
  HeadingPlugin(options),
  ImagePlugin(options),
  LinkPlugin(options),
  ListPlugin(options),
  TablePlugin(options),
  BoldPlugin(options),
  CodePlugin(options),
  ItalicPlugin(options),
  StrikethroughPlugin(options),
  UnderlinePlugin(options),
];

const withPlugins = [
  withReact,
  withHistory,
  withLink(options),
  withList(options),
  withCodeBlock(options),
  withDeserializeMd(options),
  withImageUpload(options),
  withTable(options),
  withInlineVoid({ plugins }),
] as const;

export const Example = () => {
  const createReactEditor = () => () => {
    const [value, setValue] = useState(initialValuePasteMd);

    const editor = useMemo(() => pipe(createEditor(), ...withPlugins), []);

    return (
      <Slate
        editor={editor}
        value={value}
        onChange={(newValue) => setValue(newValue as SlateDocument)}
      >
        <EditablePlugins
          plugins={plugins}
          placeholder="Paste in some Markdown..."
        />
      </Slate>
    );
  };

  const Editor = createReactEditor();

  return <Editor />;
};
