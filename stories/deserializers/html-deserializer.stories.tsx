import React, { useMemo, useState } from 'react';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import {
  ActionItemPlugin,
  BlockquotePlugin,
  BoldPlugin,
  CodePlugin,
  EditablePlugins,
  HeadingPlugin,
  HighlightPlugin,
  ImagePlugin,
  InlineCodePlugin,
  ItalicPlugin,
  LinkPlugin,
  ListPlugin,
  MentionPlugin,
  ParagraphPlugin,
  SoftBreakPlugin,
  StrikethroughPlugin,
  SubscriptPlugin,
  SuperscriptPlugin,
  TablePlugin,
  UnderlinePlugin,
  VideoPlugin,
  withDeserializeHtml,
  withImage,
  withLink,
  withList,
  withMention,
  withTable,
  withVoid,
} from '../../packages/slate-plugins/src';
import { initialValuePasteHtml, nodeTypes } from '../config/initialValues';

export default {
  title: 'Deserializers/HTML',
  component: withDeserializeHtml,
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
    ActionItemPlugin(nodeTypes),
    MentionPlugin(nodeTypes),
    VideoPlugin(nodeTypes),
    BoldPlugin(),
    InlineCodePlugin(),
    ItalicPlugin(),
    StrikethroughPlugin(),
    HighlightPlugin(),
    UnderlinePlugin(),
    SoftBreakPlugin(),
    SubscriptPlugin(),
    SuperscriptPlugin(),
  ];

  const createReactEditor = () => () => {
    const [value, setValue] = useState(initialValuePasteHtml);

    const editor = useMemo(
      () =>
        withVoid([nodeTypes.typeVideo])(
          withList(nodeTypes)(
            withMention(nodeTypes)(
              withImage(nodeTypes)(
                withDeserializeHtml(plugins)(
                  withLink(nodeTypes)(
                    withTable(nodeTypes)(withHistory(withReact(createEditor())))
                  )
                )
              )
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
          placeholder="Paste in some HTML..."
        />
      </Slate>
    );
  };

  const Editor = createReactEditor();

  return <Editor />;
};
