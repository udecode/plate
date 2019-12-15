import React, { useState } from 'react';
import { withHistory } from 'slate-history';
import {
  CheckListPlugin,
  createEditorPlugins,
  EditablePlugins,
  onKeyDownFormat,
  renderElementCheckList,
  renderElementFormat,
  renderLeafFormat,
  useCreateEditor,
  withFormat,
} from 'slate-plugins';
import { Slate, withReact } from 'slate-react';
import { initialValueCheckLists } from './config/initialValues';

const plugins = [CheckListPlugin()];

const editorPlugins = createEditorPlugins(
  [withFormat, withReact, withHistory],
  plugins
);

export const CheckLists = () => {
  const [value, setValue] = useState(initialValueCheckLists);

  const editor = useCreateEditor(editorPlugins);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={newValue => setValue(newValue)}
    >
      <EditablePlugins
        renderElement={[renderElementCheckList, renderElementFormat]}
        renderLeaf={[renderLeafFormat]}
        onKeyDown={[onKeyDownFormat]}
        placeholder="Get to work…"
        spellCheck
        autoFocus
      />
      {/* <EditablePlugins
        plugins={plugins}
        placeholder="Get to work…"
        spellCheck
        autoFocus
      /> */}
    </Slate>
  );
};
