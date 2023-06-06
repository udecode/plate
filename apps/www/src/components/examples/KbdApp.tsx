import React from 'react';
import { Plate, PlateProvider } from '@udecode/plate-common';
import { createKbdPlugin, MARK_KBD } from '@udecode/plate-kbd';

import { Icons } from '@/components/icons';
import { FixedToolbar } from '@/components/plate-ui/fixed-toolbar';
import { MarkToolbarButton } from '@/components/plate-ui/mark-toolbar-button';
import { editableProps } from '@/plate/demo/editableProps';
import { plateUI } from '@/plate/demo/plateUI';
import { basicNodesPlugins } from '@/plate/demo/plugins/basicNodesPlugins';
import { kbdValue } from '@/plate/demo/values/kbdValue';
import { createMyPlugins, MyValue } from '@/plate/plate.types';

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
      <FixedToolbar>
        <KbdToolbarButton />
      </FixedToolbar>

      <Plate<MyValue> editableProps={editableProps} />
    </PlateProvider>
  );
}
