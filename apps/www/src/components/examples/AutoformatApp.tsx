import React from 'react';
import {
  AutoformatPlugin,
  createAutoformatPlugin,
} from '@udecode/plate-autoformat';
import {
  createExitBreakPlugin,
  createSoftBreakPlugin,
} from '@udecode/plate-break';
import { Plate } from '@udecode/plate-common';
import { createHorizontalRulePlugin } from '@udecode/plate-horizontal-rule';
import { createListPlugin } from '@udecode/plate-list';
import { createResetNodePlugin } from '@udecode/plate-reset-node';

import { editableProps } from '@/plate/demo/editableProps';
import { plateUI } from '@/plate/demo/plateUI';
import { autoformatPlugin } from '@/plate/demo/plugins/autoformatPlugin';
import { basicNodesPlugins } from '@/plate/demo/plugins/basicNodesPlugins';
import { exitBreakPlugin } from '@/plate/demo/plugins/exitBreakPlugin';
import { resetBlockTypePlugin } from '@/plate/demo/plugins/resetBlockTypePlugin';
import { softBreakPlugin } from '@/plate/demo/plugins/softBreakPlugin';
import { autoformatValue } from '@/plate/demo/values/autoformatValue';
import { createMyPlugins, MyEditor, MyValue } from '@/plate/plate.types';

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
