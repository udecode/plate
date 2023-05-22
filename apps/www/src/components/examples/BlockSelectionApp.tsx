import React from 'react';
import { createNodeIdPlugin, Plate } from '@udecode/plate';
import { createBlockSelectionPlugin } from '@udecode/plate-selection';

import { basicNodesPlugins } from '@/plate/basic-nodes/basicNodesPlugins';
import { basicNodesValue } from '@/plate/basic-nodes/basicNodesValue';
import { editableProps } from '@/plate/common/editableProps';
import { plateUI } from '@/plate/common/plateUI';
import { createMyPlugins, MyValue } from '@/plate/typescript/plateTypes';

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
