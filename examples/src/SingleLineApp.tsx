import React from 'react';
import {
  createListPlugin,
  createPlateUI,
  createTablePlugin,
  Plate,
} from '@udecode/plate';
import { createSingleLinePlugin } from '@udecode/plate-break/src/index';
import { basicNodesPlugins } from './basic-elements/basicNodesPlugins';
import { editableProps } from './common/editableProps';
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
    components: createPlateUI(),
  }
);

export default () => (
  <Plate<MyValue>
    editableProps={editableProps}
    plugins={plugins}
    initialValue={singleLineValue}
  />
);
