import React, { useMemo, useState } from "react";
import { createEditor } from "slate";
import { withHistory } from "slate-history";
import { Slate, withReact } from "slate-react";
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
  withLink,
  withPasteMd
} from "../../packages/slate-plugins/src";
import { initialValuePasteMd } from "../config/initialValues";

export default {
  title: "Plugins/Paste Markdown",
  component: withPasteMd
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
    UnderlinePlugin()
  ];

  const createReactEditor = () => () => {
    const [value, setValue] = useState(initialValuePasteMd);

    const editor = useMemo(
      () => withPasteMd(withLink(withHistory(withReact(createEditor())))),
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
          placeholder="Paste in some Markdown..."
        />
      </Slate>
    );
  };

  const Editor = createReactEditor();

  return <Editor />;
};
