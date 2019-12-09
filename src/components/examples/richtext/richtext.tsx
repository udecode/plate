import React, { useMemo, useState } from 'react';
import { Range } from 'slate';
import { Slate } from 'slate-react';
import { CustomEditable } from 'plugins/common/components/CustomEditable';
import { createCustomEditor } from 'plugins/common/helpers/createCustomEditor';
import { Toolbar } from '../../components';
import { initialValue } from './config';
import { FormatButton } from './FormatButton';
import { editorPlugins, plugins } from './plugins';

export const RichText = () => {
  const [value, setValue] = useState(initialValue);
  const [selection, setSelection] = useState<Range | null>(null);

  const editor = useMemo(() => createCustomEditor(editorPlugins), []);

  return (
    <Slate
      editor={editor}
      value={value}
      selection={selection}
      onChange={(newValue, newSelection) => {
        setValue(newValue);
        setSelection(newSelection);
      }}
    >
      <Toolbar>
        <FormatButton format="bold" icon="format_bold" />
        <FormatButton format="italic" icon="format_italic" />
        <FormatButton format="underlined" icon="format_underlined" />
        <FormatButton format="code" icon="code" />
        <FormatButton format="heading-one" icon="looks_one" />
        <FormatButton format="heading-two" icon="looks_two" />
        <FormatButton format="block-quote" icon="format_quote" />
        <FormatButton format="numbered-list" icon="format_list_numbered" />
        <FormatButton format="bulleted-list" icon="format_list_bulleted" />
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
