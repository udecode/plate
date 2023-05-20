import React from 'react';
import {
  createExitBreakPlugin,
  createListPlugin,
  createResetNodePlugin,
  createSoftBreakPlugin,
  createTablePlugin,
  createTrailingBlockPlugin,
  Plate,
} from '@udecode/plate';
import {
  createMyPlugins,
  MyValue,
} from 'examples-next/src/lib/plate/typescript/plateTypes';
import { basicElementsValue } from './basic-elements/basicElementsValue';
import { basicNodesPlugins } from './basic-nodes/basicNodesPlugins';
import { editableProps } from './common/editableProps';
import { plateUI } from './common/plateUI';
import { exitBreakPlugin } from './exit-break/exitBreakPlugin';
import { resetBlockTypePlugin } from './reset-node/resetBlockTypePlugin';
import { softBreakPlugin } from './soft-break/softBreakPlugin';
import { trailingBlockPlugin } from './trailing-block/trailingBlockPlugin';

const plugins = createMyPlugins(
  [
    ...basicNodesPlugins,
    createListPlugin(),
    createTablePlugin(),
    createTrailingBlockPlugin(trailingBlockPlugin),
    createResetNodePlugin(resetBlockTypePlugin),
    createSoftBreakPlugin(softBreakPlugin),
    createExitBreakPlugin(exitBreakPlugin),
  ],
  {
    components: plateUI,
  }
);

export default function ResetNodeApp() {
  return (
    <Plate<MyValue>
      editableProps={editableProps}
      plugins={plugins}
      initialValue={basicElementsValue}
    />
  );
}
