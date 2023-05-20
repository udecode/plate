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
import {
  createMyPlugins,
  MyValue,
} from 'examples-next/src/lib/plate/typescript/plateTypes';
import { basicNodesPlugins } from './basic-nodes/basicNodesPlugins';
import { editableProps } from './common/editableProps';
import { plateUI } from './common/plateUI';
import { exitBreakPlugin } from './exit-break/exitBreakPlugin';
import { ListToolbarButtons } from './list/ListToolbarButtons';
import { listValue } from './list/listValue';
import { resetBlockTypePlugin } from './reset-node/resetBlockTypePlugin';
import { softBreakPlugin } from './soft-break/softBreakPlugin';
import { Toolbar } from './toolbar/Toolbar';

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
      <Toolbar>
        <ListToolbarButtons />
      </Toolbar>

      <Plate<MyValue> editableProps={editableProps} />
    </PlateProvider>
  );
}
