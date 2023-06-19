export const excalidrawAppCode = `import React from 'react';
import { createSelectOnBackspacePlugin, Plate } from '@udecode/plate';
import {
  createExcalidrawPlugin,
  ELEMENT_EXCALIDRAW,
  ExcalidrawElement,
} from '@udecode/plate-ui-excalidraw';
import { basicNodesPlugins } from './basic-nodes/basicNodesPlugins';
import { editableProps } from './common/editableProps';
import { excalidrawValue } from './excalidraw/excalidrawValue';
import { MyPlatePlugin, MyValue } from './typescript/plateTypes';

const plugins: MyPlatePlugin[] = [
  ...basicNodesPlugins,
  createExcalidrawPlugin({
    component: ExcalidrawElement,
  }),
  createSelectOnBackspacePlugin({
    options: { query: { allow: [ELEMENT_EXCALIDRAW] } },
  }),
];

export default () => (
  <Plate<MyValue>
    editableProps={editableProps}
    initialValue={excalidrawValue}
    plugins={plugins}
  />
);
`;

export const excalidrawAppFile = {
  '/ExcalidrawApp.tsx': excalidrawAppCode,
};
