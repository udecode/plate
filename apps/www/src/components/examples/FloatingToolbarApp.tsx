import React from 'react';
import { Plate } from '@udecode/plate';

import { editableProps } from '@/plate/demo/editableProps';
import { MyValue } from '@/plate/demo/plate.types';
import { basicNodesPlugins } from '@/plate/demo/plugins/basicNodesPlugins';
import { floatingToolbarValue } from '@/plate/demo/values/floatingToolbarValue';

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
