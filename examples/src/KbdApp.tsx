import React from 'react';
import { Keyboard } from '@styled-icons/material/Keyboard';
import {
  createKbdPlugin,
  getPluginType,
  MARK_KBD,
  MarkToolbarButton,
  Plate,
} from '@udecode/plate';
import { basicNodesPlugins } from './basic-nodes/basicNodesPlugins';
import { editableProps } from './common/editableProps';
import { plateUI } from './common/plateUI';
import { kbdValue } from './kbd/kbdValue';
import { Toolbar } from './toolbar/Toolbar';
import {
  createMyPlugins,
  MyValue,
  useMyPlateEditorRef,
} from './typescript/plateTypes';

const KbdToolbarButton = () => {
  const editor = useMyPlateEditorRef()!;

  return (
    <MarkToolbarButton
      type={getPluginType(editor, MARK_KBD)}
      icon={<Keyboard />}
    />
  );
};

const plugins = createMyPlugins([...basicNodesPlugins, createKbdPlugin()], {
  components: plateUI,
});

export default () => (
  <>
    <Toolbar>
      <KbdToolbarButton />
    </Toolbar>

    <Plate<MyValue>
      editableProps={editableProps}
      plugins={plugins}
      initialValue={kbdValue}
    />
  </>
);
