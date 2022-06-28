export const lineHeightAppCode = `import React from 'react';
import { LineWeight } from '@styled-icons/material/LineWeight';
import {
  createLineHeightPlugin,
  LineHeightToolbarDropdown,
  Plate,
} from '@udecode/plate';
import { basicNodesPlugins } from './basic-nodes/basicNodesPlugins';
import { editableProps } from './common/editableProps';
import { plateUI } from './common/plateUI';
import { lineHeightPlugin } from './line-height/lineHeightPlugin';
import { lineHeightValue } from './line-height/lineHeightValue';
import { Toolbar } from './toolbar/Toolbar';
import { createMyPlugins, MyValue } from './typescript/plateTypes';

const plugins = createMyPlugins(
  [...basicNodesPlugins, createLineHeightPlugin(lineHeightPlugin)],
  {
    components: plateUI,
  }
);

export default () => (
  <>
    <Toolbar>
      <LineHeightToolbarDropdown icon={<LineWeight />} />
    </Toolbar>

    <Plate<MyValue>
      editableProps={editableProps}
      plugins={plugins}
      initialValue={lineHeightValue}
    />
  </>
);
`;

export const lineHeightAppFile = {
  '/LineHeightApp.tsx': lineHeightAppCode,
};
