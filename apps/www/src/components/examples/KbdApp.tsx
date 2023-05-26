import React from 'react';
import {
  createKbdPlugin,
  MARK_KBD,
  Plate,
  PlateProvider,
} from '@udecode/plate';

import { Icons } from '@/components/icons';
import { basicNodesPlugins } from '@/plate/basic-nodes/basicNodesPlugins';
import { editableProps } from '@/plate/demo/editableProps';
import { plateUI } from '@/plate/demo/plateUI';
import { kbdValue } from '@/plate/kbd/kbdValue';
import { HeadingToolbar } from '@/plate/toolbar/HeadingToolbar';
import { MarkToolbarButton } from '@/plate/toolbar/MarkToolbarButton';
import { createMyPlugins, MyValue } from '@/plate/typescript/plateTypes';

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
