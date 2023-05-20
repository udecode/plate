import React from 'react';
import {
  createKbdPlugin,
  getPluginType,
  MARK_KBD,
  MarkToolbarButton,
  Plate,
  PlateProvider,
} from '@udecode/plate';
import {
  createMyPlugins,
  MyValue,
  useMyPlateEditorRef,
} from 'examples-next/src/lib/plate/typescript/plateTypes';
import { basicNodesPlugins } from './basic-nodes/basicNodesPlugins';
import { editableProps } from './common/editableProps';
import { Icons } from './common/icons';
import { plateUI } from './common/plateUI';
import { kbdValue } from './kbd/kbdValue';
import { Toolbar } from './toolbar/Toolbar';

function KbdToolbarButton() {
  const editor = useMyPlateEditorRef();

  return (
    <MarkToolbarButton
      type={getPluginType(editor, MARK_KBD)}
      icon={<Icons.kbd />}
    />
  );
}

const plugins = createMyPlugins([...basicNodesPlugins, createKbdPlugin()], {
  components: plateUI,
});

export default function KbdApp() {
  return (
    <PlateProvider<MyValue> plugins={plugins} initialValue={kbdValue}>
      <Toolbar>
        <KbdToolbarButton />
      </Toolbar>

      <Plate<MyValue> editableProps={editableProps} />
    </PlateProvider>
  );
}
