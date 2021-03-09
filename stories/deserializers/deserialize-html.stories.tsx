import React from 'react';
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
  SlatePlugins,
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
import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import { initialValuePasteHtml, options } from '../config/initialValues';

const id = 'Deserializers/HTML';

export default {
  title: id,
  component: withDeserializeHTML,
};

export const Example = () => {
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

  return (
    <SlatePlugins
      id={id}
      initialValue={initialValuePasteHtml}
      withPlugins={withPlugins}
    >
      <EditablePlugins
        plugins={plugins}
        editableProps={{
          placeholder: 'Paste in some HTML...',
        }}
      />
    </SlatePlugins>
  );
};
