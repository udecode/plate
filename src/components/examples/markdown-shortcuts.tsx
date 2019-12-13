import React, { useMemo, useState } from 'react';
import { Range } from 'slate';
import { withHistory } from 'slate-history';
import {
  createCustomEditor,
  createEditorPlugins,
  CustomEditable,
  MarkdownShortcutsPlugin,
} from 'slate-plugins';
import { Slate, withReact } from 'slate-react';
import { initialValueMarkdownShortcuts } from '../../config/initialValues';

export const plugins = [MarkdownShortcutsPlugin()];

export const editorPlugins = createEditorPlugins(
  [withReact, withHistory],
  plugins
);

export const MarkdownShortcuts = () => {
  const [value, setValue] = useState(initialValueMarkdownShortcuts);
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
      <CustomEditable
        plugins={plugins}
        placeholder="Write some markdown..."
        spellCheck
        autoFocus
      />
    </Slate>
  );
};
