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

import { editableProps } from '@/plate/demo/editableProps';
import { createMyPlugins, MyEditor, MyValue } from '@/plate/demo/plate.types';
import { plateUI } from '@/plate/demo/plateUI';
import { autoformatPlugin } from '@/plate/demo/plugins/autoformatPlugin';
import { basicNodesPlugins } from '@/plate/demo/plugins/basicNodesPlugins';
import { exitBreakPlugin } from '@/plate/demo/plugins/exitBreakPlugin';
import { resetBlockTypePlugin } from '@/plate/demo/plugins/resetBlockTypePlugin';
import { softBreakPlugin } from '@/plate/demo/plugins/softBreakPlugin';
import { autoformatValue } from '@/plate/demo/values/autoformatValue';

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
