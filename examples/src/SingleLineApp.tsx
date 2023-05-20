import React from 'react';
import {
  createListPlugin,
  createSingleLinePlugin,
  createTablePlugin,
  Plate,
} from '@udecode/plate';
import {
  createMyPlugins,
  MyValue,
} from 'examples-next/src/lib/plate/typescript/plateTypes';
import { basicNodesPlugins } from './basic-nodes/basicNodesPlugins';
import { editableProps } from './common/editableProps';
import { plateUI } from './common/plateUI';
import { singleLineValue } from './single-line/singleLineValue';

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
