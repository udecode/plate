import React, { useMemo, useState } from 'react';
import { Range } from 'slate';
import { Slate } from 'slate-react';
import { CustomEditable } from 'plugins/common/components/CustomEditable';
import { createCustomEditor } from 'plugins/common/helpers/createCustomEditor';
import { CreateEditablePlugins } from 'plugins/common/helpers/createEditablePlugins';
import {
  onKeyDownFormat,
  renderElementFormat,
  renderLeafFormat,
} from '../richtext/FormatPlugin';
import { initialValue } from './check-lists.config';
import { editorPlugins, plugins } from './check-lists.plugins';
import { renderElementCheckList } from './CheckListPlugin';

export const CheckLists = () => {
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
      <CreateEditablePlugins
        renderElement={[renderElementCheckList, renderElementFormat]}
        renderLeaf={[renderLeafFormat]}
        onKeyDown={[onKeyDownFormat]}
        placeholder="Get to work…"
        spellCheck
        autoFocus
      />
      {/* <CustomEditable
        plugins={plugins}
        placeholder="Get to work…"
        spellCheck
        autoFocus
      /> */}
    </Slate>
  );
};
