import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  createBasicElementsPlugin,
  createNodeIdPlugin,
  Plate,
} from '@udecode/plate';
import { createDndPlugin } from '@udecode/plate-dnd';
import {
  createMyPlugins,
  MyValue,
} from 'examples-next/src/lib/plate/typescript/plateTypes';
import { basicElementsValue } from './basic-elements/basicElementsValue';
import { editableProps } from './common/editableProps';
import { plateUI } from './common/plateUI';
import { withStyledDraggables } from './dnd/withStyledDraggables';

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
