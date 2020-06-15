import React, { useMemo, useState } from 'react';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import {
  ActionItemPlugin,
  BlockquotePlugin,
  BoldPlugin,
  CodeBlockPlugin,
  CodePlugin,
  EditablePlugins,
  HeadingPlugin,
  HighlightPlugin,
  ImagePlugin,
  ItalicPlugin,
  LinkPlugin,
  ListPlugin,
  MediaEmbedPlugin,
  MentionPlugin,
  ParagraphPlugin,
  pipe,
  SlateDocument,
  SoftBreakPlugin,
  StrikethroughPlugin,
  SubscriptPlugin,
  SuperscriptPlugin,
  TablePlugin,
  UnderlinePlugin,
  withDeserializeHTML,
  withImageUpload,
  withInlineVoid,
  withLink,
  withList,
  withTable,
} from '../../packages/slate-plugins/src';
import { initialValuePasteHtml, nodeTypes } from '../config/initialValues';

export default {
  title: 'Deserializers/HTML',
  component: withDeserializeHTML,
};

const plugins = [
  ParagraphPlugin(nodeTypes),
  BlockquotePlugin(nodeTypes),
  CodeBlockPlugin(nodeTypes),
  HeadingPlugin(nodeTypes),
  ImagePlugin(nodeTypes),
  LinkPlugin(nodeTypes),
  ListPlugin(nodeTypes),
  TablePlugin(nodeTypes),
  ActionItemPlugin(nodeTypes),
  MentionPlugin(nodeTypes),
  MediaEmbedPlugin(nodeTypes),
  BoldPlugin(nodeTypes),
  CodePlugin(nodeTypes),
  ItalicPlugin(nodeTypes),
  StrikethroughPlugin(nodeTypes),
  HighlightPlugin(nodeTypes),
  UnderlinePlugin(nodeTypes),
  SubscriptPlugin(nodeTypes),
  SuperscriptPlugin(nodeTypes),
  SoftBreakPlugin(),
];

const withPlugins = [
  withReact,
  withHistory,
  withTable(nodeTypes),
  withLink(),
  withDeserializeHTML({ plugins }),
  withImageUpload(),
  withList(nodeTypes),
  withInlineVoid({ plugins }),
] as const;

export const Example = () => {
  const createReactEditor = () => () => {
    const [value, setValue] = useState(initialValuePasteHtml);

    const editor = useMemo(() => pipe(createEditor(), ...withPlugins), []);

    return (
      <Slate
        editor={editor}
        value={value}
        onChange={(newValue) => setValue(newValue as SlateDocument)}
      >
        <EditablePlugins
          plugins={plugins}
          placeholder="Paste in some HTML..."
        />
      </Slate>
    );
  };

  const Editor = createReactEditor();

  return <Editor />;
};
