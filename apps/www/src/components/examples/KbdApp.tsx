import React from 'react';
import {
  createKbdPlugin,
  getPluginType,
  MARK_KBD,
  Plate,
  PlateProvider,
} from '@udecode/plate';

import { Icons } from '@/components/icons';
import { basicNodesPlugins } from '@/plate/basic-nodes/basicNodesPlugins';
import { editableProps } from '@/plate/common/editableProps';
import { plateUI } from '@/plate/common/plateUI';
import { kbdValue } from '@/plate/kbd/kbdValue';
import { HeadingToolbar } from '@/plate/toolbar/HeadingToolbar';
import { MarkToolbarButton } from '@/plate/toolbar/MarkToolbarButton';
import {
  createMyPlugins,
  MyValue,
  useMyPlateEditorRef,
} from '@/plate/typescript/plateTypes';

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
      <HeadingToolbar>
        <KbdToolbarButton />
      </HeadingToolbar>

      <Plate<MyValue> editableProps={editableProps} />
    </PlateProvider>
  );
}
