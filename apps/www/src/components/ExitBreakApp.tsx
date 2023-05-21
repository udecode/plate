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

import { basicNodesPlugins } from '@/plate/basic-nodes/basicNodesPlugins';
import { editableProps } from '@/plate/common/editableProps';
import { plateUI } from '@/plate/common/plateUI';
import { exitBreakPlugin } from '@/plate/exit-break/exitBreakPlugin';
import { exitBreakValue } from '@/plate/exit-break/exitBreakValue';
import { resetBlockTypePlugin } from '@/plate/reset-node/resetBlockTypePlugin';
import { softBreakPlugin } from '@/plate/soft-break/softBreakPlugin';
import { trailingBlockPlugin } from '@/plate/trailing-block/trailingBlockPlugin';
import { createMyPlugins, MyValue } from '@/plate/typescript/plateTypes';

const plugins = createMyPlugins(
  [
    ...basicNodesPlugins,
    createListPlugin(),
    createTablePlugin(),
    createResetNodePlugin(resetBlockTypePlugin),
    createSoftBreakPlugin(softBreakPlugin),
    createTrailingBlockPlugin(trailingBlockPlugin),
    createExitBreakPlugin(exitBreakPlugin),
  ],
  {
    components: plateUI,
  }
);

export default function ExitBreakApp() {
  return (
    <Plate<MyValue>
      editableProps={editableProps}
      plugins={plugins}
      initialValue={exitBreakValue}
    />
  );
}
