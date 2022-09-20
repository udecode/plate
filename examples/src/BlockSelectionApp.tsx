import React from 'react';
import { createNodeIdPlugin, Plate } from '@udecode/plate';
import { createBlockSelectionPlugin } from '@udecode/plate-selection';
import { basicNodesPlugins } from './basic-nodes/basicNodesPlugins';
import { basicNodesValue } from './basic-nodes/basicNodesValue';
import { editableProps } from './common/editableProps';
import { plateUI } from './common/plateUI';
import { getNodesWithId } from './dnd/getNodesWithId';
import { createMyPlugins, MyValue } from './typescript/plateTypes';

const plugins = createMyPlugins(
  [...basicNodesPlugins, createNodeIdPlugin(), createBlockSelectionPlugin()],
  {
    components: plateUI,
  }
);

const initialValue = getNodesWithId(basicNodesValue);

export default () => (
  <Plate<MyValue>
    editableProps={editableProps}
    plugins={plugins}
    initialValue={initialValue}
  />
);
