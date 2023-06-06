import React from 'react';
import { Plate } from '@udecode/plate-common';
import { createNodeIdPlugin } from '@udecode/plate-node-id';
import { createBlockSelectionPlugin } from '@udecode/plate-selection';

import { editableProps } from '@/plate/demo/editableProps';
import { plateUI } from '@/plate/demo/plateUI';
import { basicNodesPlugins } from '@/plate/demo/plugins/basicNodesPlugins';
import { basicNodesValue } from '@/plate/demo/values/basicNodesValue';
import { createMyPlugins, MyValue } from '@/plate/plate.types';

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
