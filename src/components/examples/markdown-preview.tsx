import React, { useMemo, useState } from 'react';
import { Range } from 'slate';
import { withHistory } from 'slate-history';
import {
  createCustomEditor,
  createEditorPlugins,
  CustomEditable,
  MarkdownPreviewPlugin,
} from 'slate-plugins';
import { Slate, withReact } from 'slate-react';
import { initialValueMarkdownPreview } from '../../config/initialValues';

export const plugins = [MarkdownPreviewPlugin()];

export const editorPlugins = createEditorPlugins(
  [withReact, withHistory],
  plugins
);

export const MarkdownPreview = () => {
  const [value, setValue] = useState(initialValueMarkdownPreview);
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
      <CustomEditable plugins={plugins} placeholder="Write some markdown..." />
    </Slate>
  );
};
