import React, { useCallback, useState } from 'react';
import { withHistory } from 'slate-history';
import {
  createEditorPlugins,
  decorateHighlight,
  EditablePlugins,
  HighlightPlugin,
  ToolbarHighlight,
  useCreateEditor,
} from 'slate-plugins';
import { Slate, withReact } from 'slate-react';
import { initialValueSearchHighlighting } from './config/initialValues';

const plugins = [HighlightPlugin()];
const editorPlugins = createEditorPlugins([withReact, withHistory], plugins);

export const SearchHighlighting = () => {
  const [value, setValue] = useState(initialValueSearchHighlighting);
  const [search, setSearch] = useState<string>();

  const editor = useCreateEditor(editorPlugins);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={newValue => setValue(newValue)}
    >
      <ToolbarHighlight setSearch={setSearch} />
      <EditablePlugins
        plugins={plugins}
        decorate={[
          useCallback(entry => decorateHighlight(entry, search), [search]),
        ]}
      />
    </Slate>
  );
};
