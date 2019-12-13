import React, { useMemo, useState } from 'react';
import { withHistory } from 'slate-history';
import {
  createCustomEditor,
  createEditorPlugins,
  CustomEditable,
  MarkdownPreviewPlugin,
} from 'slate-plugins';
import { Slate, withReact } from 'slate-react';
import { initialValueMarkdownPreview } from 'config/initialValues';

const plugins = [MarkdownPreviewPlugin()];

const editorPlugins = createEditorPlugins([withReact, withHistory], plugins);

export const MarkdownPreview = () => {
  const [value, setValue] = useState(initialValueMarkdownPreview);

  const editor = useMemo(() => createCustomEditor(editorPlugins), []);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={newValue => setValue(newValue)}
    >
      <CustomEditable plugins={plugins} placeholder="Write some markdown..." />
    </Slate>
  );
};
