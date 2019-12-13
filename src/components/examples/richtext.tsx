import React, { useMemo, useState } from 'react';
import { withHistory } from 'slate-history';
import {
  BlockButton,
  createCustomEditor,
  createEditorPlugins,
  CustomEditable,
  FormatPlugin,
  MarkButton,
} from 'slate-plugins';
import { Slate, withReact } from 'slate-react';
import { initialValueRichText } from 'config/initialValues';
import { Toolbar } from '../components';

const plugins = [FormatPlugin()];

const editorPlugins = createEditorPlugins([withReact, withHistory], plugins);

export const RichText = () => {
  const [value, setValue] = useState(initialValueRichText);

  const editor = useMemo(() => createCustomEditor(editorPlugins), []);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={newValue => setValue(newValue)}
    >
      <Toolbar>
        <MarkButton format="bold" icon="format_bold" />
        <MarkButton format="italic" icon="format_italic" />
        <MarkButton format="underline" icon="format_underlined" />
        <MarkButton format="code" icon="code" />
        <BlockButton format="heading-one" icon="looks_one" />
        <BlockButton format="heading-two" icon="looks_two" />
        <BlockButton format="block-quote" icon="format_quote" />
        <BlockButton format="numbered-list" icon="format_list_numbered" />
        <BlockButton format="bulleted-list" icon="format_list_bulleted" />
      </Toolbar>
      <CustomEditable
        plugins={plugins}
        placeholder="Enter some rich text…"
        spellCheck
        autoFocus
      />
    </Slate>
  );
};
