import React from 'react';
import {
  createListPlugin,
  createSingleLinePlugin,
  createTablePlugin,
  Plate,
} from '@udecode/plate';

import { basicNodesPlugins } from '@/plate/basic-nodes/basicNodesPlugins';
import { editableProps } from '@/plate/common/editableProps';
import { plateUI } from '@/plate/common/plateUI';
import { singleLineValue } from '@/plate/single-line/singleLineValue';
import { createMyPlugins, MyValue } from '@/plate/typescript/plateTypes';

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

export default function SingleLineApp() {
  return (
    <Plate<MyValue>
      editableProps={editableProps}
      plugins={plugins}
      initialValue={singleLineValue}
    />
  );
}
