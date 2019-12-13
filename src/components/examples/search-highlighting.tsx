import React, { useMemo, useState } from 'react';
import { withHistory } from 'slate-history';
import {
  createCustomEditor,
  createEditorPlugins,
  CustomEditable,
  HighlightPlugin,
  ToolbarHighlight,
} from 'slate-plugins';
import { Slate, withReact } from 'slate-react';
import { initialValueSearchHighlighting } from 'config/initialValues';

const plugins = [HighlightPlugin()];

const editorPlugins = createEditorPlugins([withReact, withHistory], plugins);

export const SearchHighlighting = () => {
  const [value, setValue] = useState(initialValueSearchHighlighting);
  const [search, setSearch] = useState<string>();
  const pluginProps = useMemo(() => ({ search }), [search]);
  const editor = useMemo(() => createCustomEditor(editorPlugins), []);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={newValue => setValue(newValue)}
    >
      <ToolbarHighlight setSearch={setSearch} />
      <CustomEditable plugins={plugins} pluginProps={pluginProps} />
    </Slate>
  );
};
