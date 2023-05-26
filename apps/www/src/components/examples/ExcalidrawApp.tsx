import React from 'react';
import { createSelectOnBackspacePlugin, Plate } from '@udecode/plate';
import {
  createExcalidrawPlugin,
  ELEMENT_EXCALIDRAW,
} from '@udecode/plate-excalidraw';

import { editableProps } from '@/plate/demo/editableProps';
import { MyPlatePlugin, MyValue } from '@/plate/demo/plate.types';
import { basicNodesPlugins } from '@/plate/demo/plugins/basicNodesPlugins';
import { excalidrawValue } from '@/plate/demo/values/excalidrawValue';
import { ExcalidrawElement } from '@/plate/excalidraw/ExcalidrawElement';

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
