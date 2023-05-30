import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  createBasicElementsPlugin,
  createNodeIdPlugin,
  Plate,
} from '@udecode/plate';
import { createDndPlugin } from '@udecode/plate-dnd';

import { withDraggables } from '@/plate/aui/with-draggables';
import { editableProps } from '@/plate/demo/editableProps';
import { createMyPlugins, MyValue } from '@/plate/demo/plate.types';
import { plateUI } from '@/plate/demo/plateUI';
import { basicElementsValue } from '@/plate/demo/values/basicElementsValue';

// set drag handle next to each block
const components = withDraggables(plateUI);

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
