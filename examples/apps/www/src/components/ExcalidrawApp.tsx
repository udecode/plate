import React from 'react';
import { createSelectOnBackspacePlugin, Plate } from '@udecode/plate';
import {
  createExcalidrawPlugin,
  ELEMENT_EXCALIDRAW,
} from '@udecode/plate-excalidraw';

import { basicNodesPlugins } from '@/plate/basic-nodes/basicNodesPlugins';
import { editableProps } from '@/plate/common/editableProps';
import { ExcalidrawElement } from '@/plate/excalidraw/ExcalidrawElement';
import { excalidrawValue } from '@/plate/excalidraw/excalidrawValue';
import { MyPlatePlugin, MyValue } from '@/plate/typescript/plateTypes';

const plugins: MyPlatePlugin[] = [
  ...basicNodesPlugins,
  createExcalidrawPlugin({
    component: ExcalidrawElement,
  }),
  createSelectOnBackspacePlugin({
    options: { query: { allow: [ELEMENT_EXCALIDRAW] } },
  }),
];

export default function ExcalidrawApp() {
  return (
    <Plate<MyValue>
      editableProps={editableProps}
      initialValue={excalidrawValue}
      plugins={plugins}
    />
  );
}
