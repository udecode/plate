import React from 'react';
import {
  createExitBreakPlugin,
  createSoftBreakPlugin,
} from '@udecode/plate-break';
import { Plate } from '@udecode/plate-common';
import { createListPlugin } from '@udecode/plate-list';
import { createResetNodePlugin } from '@udecode/plate-reset-node';
import { createTablePlugin } from '@udecode/plate-table';
import { createTrailingBlockPlugin } from '@udecode/plate-trailing-block';

import { editableProps } from '@/plate/demo/editableProps';
import { plateUI } from '@/plate/demo/plateUI';
import { basicNodesPlugins } from '@/plate/demo/plugins/basicNodesPlugins';
import { exitBreakPlugin } from '@/plate/demo/plugins/exitBreakPlugin';
import { resetBlockTypePlugin } from '@/plate/demo/plugins/resetBlockTypePlugin';
import { softBreakPlugin } from '@/plate/demo/plugins/softBreakPlugin';
import { trailingBlockPlugin } from '@/plate/demo/plugins/trailingBlockPlugin';
import { exitBreakValue } from '@/plate/demo/values/exitBreakValue';
import { createMyPlugins, MyValue } from '@/plate/plate.types';

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
