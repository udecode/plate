import React from 'react';
import { Plate } from '@udecode/plate';

import { editableProps } from '@/plate/demo/editableProps';
import { basicNodesPlugins } from '@/plate/demo/plugins/basicNodesPlugins';
import { floatingToolbarValue } from '@/plate/demo/values/floatingToolbarValue';
import { MyValue } from '@/types/plate.types';

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
