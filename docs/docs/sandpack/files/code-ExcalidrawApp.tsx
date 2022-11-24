export const excalidrawAppCode = `import React from 'react';
import { 
  createSelectOnBackspacePlugin,
  Plate,
  PlateProvider,
  HeadingToolbar,
} from '@udecode/plate';
import {
  createExcalidrawPlugin,
  ELEMENT_EXCALIDRAW,
  ExcalidrawElement,
} from '@udecode/plate-ui-excalidraw';
import { Pencil } from '@styled-icons/boxicons-regular';
import { basicNodesPlugins } from './basic-nodes/basicNodesPlugins';
import { editableProps } from './common/editableProps';
import { excalidrawValue } from './excalidraw/excalidrawValue';
import { ExcalidrawElementToolbarButton } from './excalidraw/ExcalidrawToolbarButton';
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
  <PlateProvider<MyValue> plugins={plugins} initialValue={excalidrawValue}>
    <HeadingToolbar>
      <ExcalidrawElementToolbarButton icon={<div>excalidraw</div>} />
    </HeadingToolbar>
    <Plate<MyValue> editableProps={editableProps} />
  </PlateProvider>
);
`;

export const excalidrawAppFile = {
  '/ExcalidrawApp.tsx': excalidrawAppCode,
};
