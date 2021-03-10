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
import {
  initialValuePasteHtml,
  options,
  optionsSoftBreak,
} from '../config/initialValues';

const id = 'Deserializers/HTML';

export default {
  title: id,
  component: withDeserializeHTML,
};

export const Example = () => {
  const plugins = [
    ParagraphPlugin(),
    BlockquotePlugin(),
    CodeBlockPlugin(),
    HeadingPlugin(),
    ImagePlugin(),
    LinkPlugin(),
    ListPlugin(),
    TablePlugin(),
    TodoListPlugin(),
    MentionPlugin(),
    MediaEmbedPlugin(),
    BoldPlugin(),
    CodePlugin(),
    ItalicPlugin(),
    StrikethroughPlugin(),
    HighlightPlugin(),
    UnderlinePlugin(),
    SubscriptPlugin(),
    SuperscriptPlugin(),
    SoftBreakPlugin(optionsSoftBreak),
  ];

  const withPlugins = [
    withReact,
    withHistory,
    withTable(options),
    withLink({}, options),
    withCodeBlock({}, options),
    withList({}, options),
    withDeserializeHTML({ plugins }),
    withImageUpload({}, options),
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
