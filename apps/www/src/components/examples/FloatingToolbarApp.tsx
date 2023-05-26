import React from 'react';
import { Plate } from '@udecode/plate';

import { basicNodesPlugins } from '@/plate/basic-nodes/basicNodesPlugins';
import { editableProps } from '@/plate/demo/editableProps';
import { floatingToolbarValue } from '@/plate/toolbar/floatingToolbarValue';
import { MyValue } from '@/plate/typescript/plateTypes';

export default function FloatingToolbarApp() {
  return (
    <Plate<MyValue>
      editableProps={editableProps}
      plugins={basicNodesPlugins}
      initialValue={floatingToolbarValue}
    >
      {/* <MarkFloatingToolbar /> */}
    </Plate>
  );
}
