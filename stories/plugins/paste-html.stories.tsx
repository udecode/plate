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
  withImage,
  withLink,
  withPasteHtml,
  withTable,
} from '../../packages/slate-plugins/src';
import { initialValuePasteHtml } from '../config/initialValues';

export default {
  title: 'Plugins/Paste Html',
  component: withPasteHtml,
};

export const Example = () => {
  const plugins = [
    BlockquotePlugin(),
    BoldPlugin(),
    CodePlugin(),
    HeadingPlugin(),
    ImagePlugin(),
    InlineCodePlugin(),
    ItalicPlugin(),
    LinkPlugin(),
    ListPlugin(),
    ParagraphPlugin(),
    StrikethroughPlugin(),
    TablePlugin(),
    UnderlinePlugin(),
  ];

  const createReactEditor = () => () => {
    const [value, setValue] = useState(initialValuePasteHtml);

    const editor = useMemo(
      () =>
        withTable(
          withImage(
            withPasteHtml(plugins)(
              withLink(withHistory(withReact(createEditor())))
            )
          )
        ),
      []
    );

    return (
      <Slate
        editor={editor}
        value={value}
        onChange={newValue => setValue(newValue)}
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
