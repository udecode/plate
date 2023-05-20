import React from 'react';
import { createSelectOnBackspacePlugin, Plate } from '@udecode/plate';
import {
  createExcalidrawPlugin,
  ELEMENT_EXCALIDRAW,
  ExcalidrawElement,
} from '@udecode/plate-excalidraw';
import {
  MyPlatePlugin,
  MyValue,
} from 'examples-next/src/lib/plate/typescript/plateTypes';
import { basicNodesPlugins } from './basic-nodes/basicNodesPlugins';
import { editableProps } from './common/editableProps';
import { excalidrawValue } from './excalidraw/excalidrawValue';

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
