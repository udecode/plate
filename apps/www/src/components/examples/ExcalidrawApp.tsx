import React from 'react';
import { Plate } from '@udecode/plate-common';
import {
  createExcalidrawPlugin,
  ELEMENT_EXCALIDRAW,
} from '@udecode/plate-excalidraw';
import { createSelectOnBackspacePlugin } from '@udecode/plate-select';

import { ExcalidrawElement } from '@/components/plate-ui/excalidraw-element';
import { editableProps } from '@/plate/demo/editableProps';
import { basicNodesPlugins } from '@/plate/demo/plugins/basicNodesPlugins';
import { excalidrawValue } from '@/plate/demo/values/excalidrawValue';
import { MyPlatePlugin, MyValue } from '@/plate/plate.types';

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
