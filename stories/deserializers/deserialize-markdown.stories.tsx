import React from 'react';
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
  SlatePlugins,
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
import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import { initialValuePasteMd, options } from '../config/initialValues';

const id = 'Deserializers/Markdown';

export default {
  title: id,
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
    return (
      <SlatePlugins
        id={id}
        initialValue={initialValuePasteMd}
        withPlugins={withPlugins}
      >
        <EditablePlugins
          id={id}
          plugins={plugins}
          placeholder="Paste in some Markdown..."
        />
      </SlatePlugins>
    );
  };

  const Editor = createReactEditor();

  return <Editor />;
};
