import React, { useMemo, useState } from 'react';
import { Range } from 'slate';
import { Slate } from 'slate-react';
import { CustomEditable } from 'plugins/common/components/CustomEditable';
import { createCustomEditor } from 'plugins/common/helpers/createCustomEditor';
import { initialValue } from './search-highlighting.config';
import { editorPlugins, plugins } from './search-highlighting.plugins';
import { ToolbarHighlight } from './ToolbarHighlight';

export const SearchHighlighting = () => {
  const [value, setValue] = useState(initialValue);
  const [selection, setSelection] = useState<Range | null>(null);
  const [search, setSearch] = useState<string>();
  const pluginProps = useMemo(() => ({ search }), [search]);
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
      <ToolbarHighlight setSearch={setSearch} />
      <CustomEditable plugins={plugins} pluginProps={pluginProps} />
    </Slate>
  );
};
