import React from 'react';
import { Plate } from '@udecode/plate';

import { basicNodesPlugins } from '@/plate/basic-nodes/basicNodesPlugins';
import { editableProps } from '@/plate/common/editableProps';
import { balloonToolbarValue } from '@/plate/toolbar/balloonToolbarValue';
import { MyValue } from '@/plate/typescript/plateTypes';

export default function BalloonToolbarApp() {
  return (
    <Plate<MyValue>
      editableProps={editableProps}
      plugins={basicNodesPlugins}
      initialValue={balloonToolbarValue}
    >
      {/* <MarkBalloonToolbar /> */}
    </Plate>
  );
}
