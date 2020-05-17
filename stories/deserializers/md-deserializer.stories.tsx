import React, { useMemo, useState } from 'react';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import {
  BlockquotePlugin,
  BoldPlugin,
  CodePlugin,
  EditablePlugins,
  HeadingPlugin,
  ImagePlugin,
  InlineCodePlugin,
  ItalicPlugin,
  LinkPlugin,
  ListPlugin,
  ParagraphPlugin,
  pipe,
  StrikethroughPlugin,
  TablePlugin,
  UnderlinePlugin,
  withDeserializeMd,
  withImage,
  withLink,
  withTable,
} from '../../packages/slate-plugins/src';
import { initialValuePasteMd, nodeTypes } from '../config/initialValues';

export default {
  title: 'Deserializers/Markdown',
  component: withDeserializeMd,
};

const plugins = [
  ParagraphPlugin(nodeTypes),
  BlockquotePlugin(nodeTypes),
  CodePlugin(nodeTypes),
  HeadingPlugin(nodeTypes),
  ImagePlugin(nodeTypes),
  LinkPlugin(nodeTypes),
  ListPlugin(nodeTypes),
  TablePlugin(nodeTypes),
  BoldPlugin(nodeTypes),
  InlineCodePlugin(nodeTypes),
  ItalicPlugin(nodeTypes),
  StrikethroughPlugin(nodeTypes),
  UnderlinePlugin(nodeTypes),
];

const withPlugins = [
  withReact,
  withHistory,
  withLink(nodeTypes),
  withDeserializeMd(plugins),
  withImage(nodeTypes),
  withTable(nodeTypes),
] as const;

export const Example = () => {
  const createReactEditor = () => () => {
    const [value, setValue] = useState(initialValuePasteMd);

    const editor = useMemo(() => pipe(createEditor(), ...withPlugins), []);

    return (
      <Slate
        editor={editor}
        value={value}
        onChange={(newValue) => setValue(newValue)}
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
