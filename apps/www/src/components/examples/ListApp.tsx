import React from 'react';
import {
  createExitBreakPlugin,
  createListPlugin,
  createResetNodePlugin,
  createSoftBreakPlugin,
  createTodoListPlugin,
  Plate,
  PlateProvider,
} from '@udecode/plate';

import { editableProps } from '@/plate/demo/editableProps';
import { createMyPlugins, MyValue } from '@/plate/demo/plate.types';
import { plateUI } from '@/plate/demo/plateUI';
import { basicNodesPlugins } from '@/plate/demo/plugins/basicNodesPlugins';
import { exitBreakPlugin } from '@/plate/demo/plugins/exitBreakPlugin';
import { resetBlockTypePlugin } from '@/plate/demo/plugins/resetBlockTypePlugin';
import { softBreakPlugin } from '@/plate/demo/plugins/softBreakPlugin';
import { listValue } from '@/plate/demo/values/listValue';
import { HeadingToolbar } from '@/plate/toolbar/HeadingToolbar';

const plugins = createMyPlugins(
  [
    ...basicNodesPlugins,
    createResetNodePlugin(resetBlockTypePlugin),
    createSoftBreakPlugin(softBreakPlugin),
    createExitBreakPlugin(exitBreakPlugin),
    createListPlugin(),
    createTodoListPlugin(),
  ],
  {
    components: plateUI,
  }
);

export default function ListApp() {
  return (
    <PlateProvider<MyValue> plugins={plugins} initialValue={listValue}>
      <HeadingToolbar>{/* <ListToolbarButtons /> */}</HeadingToolbar>

      <Plate<MyValue> editableProps={editableProps} />
    </PlateProvider>
  );
}
