import React from 'react';
import { createNodeIdPlugin, Plate } from '@udecode/plate';
import { createBlockSelectionPlugin } from '@udecode/plate-selection';

import { editableProps } from '@/plate/demo/editableProps';
import { plateUI } from '@/plate/demo/plateUI';
import { basicNodesPlugins } from '@/plate/demo/plugins/basicNodesPlugins';
import { basicNodesValue } from '@/plate/demo/values/basicNodesValue';
import { createMyPlugins, MyValue } from '@/types/plate.types';

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
