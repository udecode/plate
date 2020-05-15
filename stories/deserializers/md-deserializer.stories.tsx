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

export const Example = () => {
  const plugins = [
    ParagraphPlugin(nodeTypes),
    BlockquotePlugin(nodeTypes),
    CodePlugin(nodeTypes),
    HeadingPlugin(nodeTypes),
    ImagePlugin(nodeTypes),
    LinkPlugin(nodeTypes),
    ListPlugin(nodeTypes),
    TablePlugin(nodeTypes),
    BoldPlugin(),
    InlineCodePlugin(),
    ItalicPlugin(),
    StrikethroughPlugin(),
    UnderlinePlugin(),
  ];

  const createReactEditor = () => () => {
    const [value, setValue] = useState(initialValuePasteMd);

    const editor = useMemo(
      () =>
        withTable(nodeTypes)(
          withImage(nodeTypes)(
            withDeserializeMd(plugins)(
              withLink(nodeTypes)(withHistory(withReact(createEditor())))
            )
          )
        ),
      []
    );

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
