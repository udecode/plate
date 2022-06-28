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
import { autoformatPlugin } from './autoformat/autoformatPlugin';
import { autoformatValue } from './autoformat/autoformatValue';
import { basicNodesPlugins } from './basic-nodes/basicNodesPlugins';
import { editableProps } from './common/editableProps';
import { plateUI } from './common/plateUI';
import { exitBreakPlugin } from './exit-break/exitBreakPlugin';
import { resetBlockTypePlugin } from './reset-node/resetBlockTypePlugin';
import { softBreakPlugin } from './soft-break/softBreakPlugin';
import { createMyPlugins, MyEditor, MyValue } from './typescript/plateTypes';

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

export default () => (
  <Plate<MyValue>
    editableProps={editableProps}
    initialValue={autoformatValue}
    plugins={plugins}
  />
);
