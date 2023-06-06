import React from 'react';
import { createSingleLinePlugin } from '@udecode/plate-break';
import { Plate } from '@udecode/plate-common';
import { createListPlugin } from '@udecode/plate-list';
import { createTablePlugin } from '@udecode/plate-table';

import { editableProps } from '@/plate/demo/editableProps';
import { plateUI } from '@/plate/demo/plateUI';
import { basicNodesPlugins } from '@/plate/demo/plugins/basicNodesPlugins';
import { singleLineValue } from '@/plate/demo/values/singleLineValue';
import { createMyPlugins, MyValue } from '@/plate/plate.types';

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
