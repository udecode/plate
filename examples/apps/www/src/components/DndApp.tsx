import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  createBasicElementsPlugin,
  createNodeIdPlugin,
  Plate,
} from '@udecode/plate';
import { createDndPlugin } from '@udecode/plate-dnd';

import { basicElementsValue } from '@/plate/basic-elements/basicElementsValue';
import { editableProps } from '@/plate/common/editableProps';
import { plateUI } from '@/plate/common/plateUI';
import { withStyledDraggables } from '@/plate/dnd/withStyledDraggables';
import { createMyPlugins, MyValue } from '@/plate/typescript/plateTypes';

// set drag handle next to each block
const components = withStyledDraggables(plateUI);

// set id to each block
const initialValue = basicElementsValue;

const plugins = createMyPlugins(
  [
    createBasicElementsPlugin(),
    createNodeIdPlugin(),
    createDndPlugin({ options: { enableScroller: true } }),
  ],
  {
    components,
  }
);

export default function DndApp() {
  return (
    <DndProvider backend={HTML5Backend}>
      <Plate<MyValue>
        editableProps={editableProps}
        plugins={plugins}
        initialValue={initialValue}
      />
    </DndProvider>
  );
}
