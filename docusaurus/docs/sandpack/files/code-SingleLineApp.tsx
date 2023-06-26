export const singleLineAppCode = `import React from 'react';
import {
  createListPlugin,
  createSingleLinePlugin,
  createTablePlugin,
  Plate,
} from '@udecode/plate';
import { basicNodesPlugins } from './basic-nodes/basicNodesPlugins';
import { editableProps } from './common/editableProps';
import { plateUI } from './common/plateUI';
import { singleLineValue } from './single-line/singleLineValue';
import { createMyPlugins, MyValue } from './typescript/plateTypes';

const plugins = createMyPlugins(
  [
    ...basicNodesPlugins,
    createListPlugin(),
    createTablePlugin(),
    createSingleLinePlugin(),
  ],
  {
    components: plateUI,
  }
);

export default () => (
  <Plate<MyValue>
    editableProps={editableProps}
    plugins={plugins}
    initialValue={singleLineValue}
  />
);
`;

export const singleLineAppFile = {
  '/SingleLineApp.tsx': singleLineAppCode,
};
