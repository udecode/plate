import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { createBasicElementsPlugin } from '@udecode/plate-basic-elements';
import { Plate } from '@udecode/plate-common';
import { createDndPlugin } from '@udecode/plate-dnd';
import { createNodeIdPlugin } from '@udecode/plate-node-id';

import { withDraggables } from '@/components/plate-ui/with-draggables';
import { editableProps } from '@/plate/demo/editableProps';
import { plateUI } from '@/plate/demo/plateUI';
import { basicElementsValue } from '@/plate/demo/values/basicElementsValue';
import { createMyPlugins, MyValue } from '@/plate/plate.types';

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
