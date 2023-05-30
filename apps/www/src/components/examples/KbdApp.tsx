import React from 'react';
import {
  createKbdPlugin,
  MARK_KBD,
  Plate,
  PlateProvider,
} from '@udecode/plate';

import { Icons } from '@/components/icons';
import { HeadingToolbar } from '@/plate/aui/heading-toolbar';
import { MarkToolbarButton } from '@/plate/aui/mark-toolbar-button';
import { editableProps } from '@/plate/demo/editableProps';
import { createMyPlugins, MyValue } from '@/plate/demo/plate.types';
import { plateUI } from '@/plate/demo/plateUI';
import { basicNodesPlugins } from '@/plate/demo/plugins/basicNodesPlugins';
import { kbdValue } from '@/plate/demo/values/kbdValue';

function KbdToolbarButton() {
  return (
    <MarkToolbarButton nodeType={MARK_KBD}>
      <Icons.kbd />
    </MarkToolbarButton>
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
