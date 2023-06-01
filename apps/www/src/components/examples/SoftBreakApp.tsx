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

import { editableProps } from '@/plate/demo/editableProps';
import { plateUI } from '@/plate/demo/plateUI';
import { basicNodesPlugins } from '@/plate/demo/plugins/basicNodesPlugins';
import { exitBreakPlugin } from '@/plate/demo/plugins/exitBreakPlugin';
import { resetBlockTypePlugin } from '@/plate/demo/plugins/resetBlockTypePlugin';
import { softBreakPlugin } from '@/plate/demo/plugins/softBreakPlugin';
import { trailingBlockPlugin } from '@/plate/demo/plugins/trailingBlockPlugin';
import { softBreakValue } from '@/plate/demo/values/softBreakValue';
import { createMyPlugins, MyValue } from '@/types/plate.types';

const plugins = createMyPlugins(
  [
    ...basicNodesPlugins,
    createListPlugin(),
    createTablePlugin(),
    createResetNodePlugin(resetBlockTypePlugin),
    createExitBreakPlugin(exitBreakPlugin),
    createTrailingBlockPlugin(trailingBlockPlugin),
    createSoftBreakPlugin(softBreakPlugin),
  ],
  {
    components: plateUI,
  }
);

export default function SoftBreakApp() {
  return (
    <Plate<MyValue>
      editableProps={editableProps}
      plugins={plugins}
      initialValue={softBreakValue}
    />
  );
}
