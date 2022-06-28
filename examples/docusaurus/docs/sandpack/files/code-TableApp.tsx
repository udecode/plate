export const tableAppCode = `import React from 'react';
import {
  createExitBreakPlugin,
  createPlateUI,
  createSoftBreakPlugin,
  createTablePlugin,
  HeadingToolbar,
  Plate,
} from '@udecode/plate';
import { basicNodesPlugins } from './basic-nodes/basicNodesPlugins';
import { editableProps } from './common/editableProps';
import { exitBreakPlugin } from './exit-break/exitBreakPlugin';
import { softBreakPlugin } from './soft-break/softBreakPlugin';
import { TableToolbarButtons } from './table/TableToolbarButtons';
import { tableValue } from './table/tableValue';
import { createMyPlugins, MyValue } from './typescript/plateTypes';

const plugins = createMyPlugins(
  [
    ...basicNodesPlugins,
    createSoftBreakPlugin(softBreakPlugin),
    createExitBreakPlugin(exitBreakPlugin),
    createTablePlugin(),
  ],
  {
    components: createPlateUI(),
  }
);

export default () => (
  <>
    <HeadingToolbar>
      <TableToolbarButtons />
    </HeadingToolbar>

    <Plate<MyValue>
      editableProps={editableProps}
      plugins={plugins}
      initialValue={tableValue}
    />
  </>
);
`;

export const tableAppFile = {
  '/TableApp.tsx': tableAppCode,
};
