export const softBreakAppCode = `import React from 'react';
import {
  createExitBreakPlugin,
  createListPlugin,
  createResetNodePlugin,
  createSoftBreakPlugin,
  createTablePlugin,
  createTrailingBlockPlugin,
  Plate,
} from '@udecode/plate';
import { basicNodesPlugins } from './basic-nodes/basicNodesPlugins';
import { editableProps } from './common/editableProps';
import { plateUI } from './common/plateUI';
import { exitBreakPlugin } from './exit-break/exitBreakPlugin';
import { resetBlockTypePlugin } from './reset-node/resetBlockTypePlugin';
import { softBreakPlugin } from './soft-break/softBreakPlugin';
import { softBreakValue } from './soft-break/softBreakValue';
import { trailingBlockPlugin } from './trailing-block/trailingBlockPlugin';
import { createMyPlugins, MyValue } from './typescript/plateTypes';

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

export default () => (
  <Plate<MyValue>
    editableProps={editableProps}
    plugins={plugins}
    initialValue={softBreakValue}
  />
);
`;

export const softBreakAppFile = {
  '/SoftBreakApp.tsx': softBreakAppCode,
};
