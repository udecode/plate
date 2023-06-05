import React from 'react';
import { createLineHeightPlugin, Plate, PlateProvider } from '@udecode/plate';

import { FixedToolbar } from '@/components/plate-ui/fixed-toolbar';
import { LineHeightDropdownMenu } from '@/components/plate-ui/line-height-dropdown-menu';
import { editableProps } from '@/plate/demo/editableProps';
import { plateUI } from '@/plate/demo/plateUI';
import { basicNodesPlugins } from '@/plate/demo/plugins/basicNodesPlugins';
import { lineHeightPlugin } from '@/plate/demo/plugins/lineHeightPlugin';
import { lineHeightValue } from '@/plate/demo/values/lineHeightValue';
import { createMyPlugins, MyValue } from '@/types/plate.types';

const plugins = createMyPlugins(
  [...basicNodesPlugins, createLineHeightPlugin(lineHeightPlugin)],
  {
    components: plateUI,
  }
);

export default function LineHeightApp() {
  return (
    <PlateProvider<MyValue> plugins={plugins} initialValue={lineHeightValue}>
      <FixedToolbar>
        <LineHeightDropdownMenu />
      </FixedToolbar>

      <Plate<MyValue> editableProps={editableProps} />
    </PlateProvider>
  );
}
