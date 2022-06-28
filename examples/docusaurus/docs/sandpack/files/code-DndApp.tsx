export const dndAppCode = `import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  createBasicElementsPlugin,
  createNodeIdPlugin,
  createPlateUI,
  Plate,
} from '@udecode/plate';
import { basicElementsValue } from './basic-elements/basicElementsValue';
import { editableProps } from './common/editableProps';
import { withStyledDraggables } from './dnd/withStyledDraggables';
import { createMyPlugins, MyValue } from './typescript/plateTypes';

let components = createPlateUI();
components = withStyledDraggables(components);

const plugins = createMyPlugins(
  [createBasicElementsPlugin(), createNodeIdPlugin()],
  {
    components,
  }
);

export default () => (
  <DndProvider backend={HTML5Backend}>
    <Plate<MyValue>
      editableProps={editableProps}
      plugins={plugins}
      initialValue={basicElementsValue}
    />
  </DndProvider>
);
`;

export const dndAppFile = {
  '/DndApp.tsx': dndAppCode,
};
