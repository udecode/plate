import React from 'react';
import { createNodeIdPlugin, Plate } from '@udecode/plate';
import { createBlockSelectionPlugin } from '@udecode/plate-selection';
import {
  createMyPlugins,
  MyValue,
} from 'examples-next/src/lib/plate/typescript/plateTypes';
import { basicNodesPlugins } from './basic-nodes/basicNodesPlugins';
import { basicNodesValue } from './basic-nodes/basicNodesValue';
import { editableProps } from './common/editableProps';
import { plateUI } from './common/plateUI';

const plugins = createMyPlugins(
  [...basicNodesPlugins, createNodeIdPlugin(), createBlockSelectionPlugin()],
  {
    components: plateUI,
  }
);

export default function BlockSelectionApp() {
  return (
    <Plate<MyValue>
      editableProps={editableProps}
      plugins={plugins}
      initialValue={basicNodesValue}
    />
  );
}
