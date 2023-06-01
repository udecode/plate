import React from 'react';
import {
  createExitBreakPlugin,
  createSoftBreakPlugin,
  createTablePlugin,
  Plate,
  PlateProvider,
} from '@udecode/plate';

import { HeadingToolbar } from '@/plate/aui/heading-toolbar';
import { TableDropdownMenu } from '@/plate/aui/table-dropdown-menu';
import { editableProps } from '@/plate/demo/editableProps';
import { plateUI } from '@/plate/demo/plateUI';
import { basicNodesPlugins } from '@/plate/demo/plugins/basicNodesPlugins';
import { exitBreakPlugin } from '@/plate/demo/plugins/exitBreakPlugin';
import { softBreakPlugin } from '@/plate/demo/plugins/softBreakPlugin';
import { tableValue } from '@/plate/demo/values/tableValue';
import { createMyPlugins, MyValue } from '@/types/plate.types';

const plugins = createMyPlugins(
  [
    ...basicNodesPlugins,
    createSoftBreakPlugin(softBreakPlugin),
    createExitBreakPlugin(exitBreakPlugin),
    createTablePlugin({
      options: {
        initialTableWidth: 600,
        // disableMarginLeft: true,
      },
    }),
  ],
  {
    components: plateUI,
  }
);

export default function TableApp() {
  return (
    <PlateProvider<MyValue> plugins={plugins} initialValue={tableValue}>
      <HeadingToolbar>
        <TableDropdownMenu />
      </HeadingToolbar>

      <Plate<MyValue> editableProps={editableProps} />
    </PlateProvider>
  );
}
