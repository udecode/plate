import React from 'react';
import {
  AutoformatPlugin,
  createAutoformatPlugin,
  createExitBreakPlugin,
  createHorizontalRulePlugin,
  createListPlugin,
  createResetNodePlugin,
  createSoftBreakPlugin,
  Plate,
} from '@udecode/plate';

import { autoformatPlugin } from '@/plate/autoformat/autoformatPlugin';
import { autoformatValue } from '@/plate/autoformat/autoformatValue';
import { basicNodesPlugins } from '@/plate/basic-nodes/basicNodesPlugins';
import { editableProps } from '@/plate/common/editableProps';
import { plateUI } from '@/plate/common/plateUI';
import { exitBreakPlugin } from '@/plate/exit-break/exitBreakPlugin';
import { resetBlockTypePlugin } from '@/plate/reset-node/resetBlockTypePlugin';
import { softBreakPlugin } from '@/plate/soft-break/softBreakPlugin';
import {
  createMyPlugins,
  MyEditor,
  MyValue,
} from '@/plate/typescript/plateTypes';

const plugins = createMyPlugins(
  [
    ...basicNodesPlugins,
    createListPlugin(),
    createHorizontalRulePlugin(),
    createResetNodePlugin(resetBlockTypePlugin),
    createSoftBreakPlugin(softBreakPlugin),
    createExitBreakPlugin(exitBreakPlugin),
    createAutoformatPlugin<AutoformatPlugin<MyValue, MyEditor>, MyValue>(
      autoformatPlugin
    ),
  ],
  {
    components: plateUI,
  }
);

export default function AutoformatApp() {
  return (
    <Plate<MyValue>
      editableProps={editableProps}
      initialValue={autoformatValue}
      plugins={plugins}
    />
  );
}
