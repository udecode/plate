import React, { useMemo, useState } from 'react';
import { Range } from 'slate';
import { withHistory } from 'slate-history';
import {
  CheckListPlugin,
  createCustomEditor,
  createEditorPlugins,
  CustomEditable,
  onKeyDownFormat,
  renderElementCheckList,
  renderElementFormat,
  renderLeafFormat,
  withFormat,
} from 'slate-plugins';
import { Slate, withReact } from 'slate-react';
import { initialValueCheckLists } from 'config/initialValues';

const plugins = [CheckListPlugin()];

const editorPlugins = createEditorPlugins(
  [withFormat, withReact, withHistory],
  plugins
);

export const CheckLists = () => {
  const [value, setValue] = useState(initialValueCheckLists);
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
