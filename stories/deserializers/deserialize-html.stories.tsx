import React, { useMemo, useState } from 'react';
import {
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
  TodoListPlugin,
  UnderlinePlugin,
  withCodeBlock,
  withDeserializeHTML,
  withImageUpload,
  withInlineVoid,
  withLink,
  withList,
  withTable,
} from '@udecode/slate-plugins';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import { initialValuePasteHtml, options } from '../config/initialValues';

export default {
  title: 'Deserializers/HTML',
  component: withDeserializeHTML,
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
  TodoListPlugin(options),
  MentionPlugin(options),
  MediaEmbedPlugin(options),
  BoldPlugin(options),
  CodePlugin(options),
  ItalicPlugin(options),
  StrikethroughPlugin(options),
  HighlightPlugin(options),
  UnderlinePlugin(options),
  SubscriptPlugin(options),
  SuperscriptPlugin(options),
  SoftBreakPlugin(),
];

const withPlugins = [
  withReact,
  withHistory,
  withTable(options),
  withLink(options),
  withCodeBlock(options),
  withList(options),
  withDeserializeHTML({ plugins }),
  withImageUpload(),
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
