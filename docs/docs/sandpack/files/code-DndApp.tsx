export const dndAppCode = `import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  createBasicElementsPlugin,
  createDndPlugin,
  createNodeIdPlugin,
  Plate,
} from '@udecode/plate';
import { basicElementsValue } from './basic-elements/basicElementsValue';
import { editableProps } from './common/editableProps';
import { plateUI } from './common/plateUI';
import { createNodesWithId } from './dnd/createNodesWithId';
import { withStyledDraggables } from './dnd/withStyledDraggables';
import { createMyPlugins, MyValue } from './typescript/plateTypes';

// set drag handle next to each block
const components = withStyledDraggables(plateUI);

// set id to each block
const initialValue = createNodesWithId(basicElementsValue);

const plugins = createMyPlugins(
  [createBasicElementsPlugin(), createNodeIdPlugin(), createDndPlugin()],
  {
    components,
  }
);

export default () => (
  <DndProvider backend={HTML5Backend}>
    <Plate<MyValue>
      editableProps={editableProps}
      plugins={plugins}
      initialValue={initialValue}
    />
  </DndProvider>
);
`;

export const dndAppFile = {
  '/DndApp.tsx': dndAppCode,
};
