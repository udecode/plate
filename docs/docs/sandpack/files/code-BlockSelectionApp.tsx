export const blockSelectionAppCode = `import React from 'react';
import {
  createBlockSelectionPlugin,
  createNodeIdPlugin,
  Plate,
} from '@udecode/plate';
import { basicNodesPlugins } from './basic-nodes/basicNodesPlugins';
import { basicNodesValue } from './basic-nodes/basicNodesValue';
import { editableProps } from './common/editableProps';
import { plateUI } from './common/plateUI';
import { createNodesWithId } from './dnd/createNodesWithId';
import { createMyPlugins, MyValue } from './typescript/plateTypes';

const plugins = createMyPlugins(
  [...basicNodesPlugins, createNodeIdPlugin(), createBlockSelectionPlugin()],
  {
    components: plateUI,
  }
);

const initialValue = createNodesWithId(basicNodesValue);

export default () => (
  <Plate<MyValue>
    editableProps={editableProps}
    plugins={plugins}
    initialValue={initialValue}
  />
);
`;

export const blockSelectionAppFile = {
  '/BlockSelectionApp.tsx': blockSelectionAppCode,
};
