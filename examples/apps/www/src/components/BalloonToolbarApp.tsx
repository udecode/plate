import React from 'react';
import { Plate } from '@udecode/plate';

import { balloonToolbarValue } from '@/plate/balloon-toolbar/balloonToolbarValue';
import { MarkBalloonToolbar } from '@/plate/balloon-toolbar/MarkBalloonToolbar';
import { basicNodesPlugins } from '@/plate/basic-nodes/basicNodesPlugins';
import { editableProps } from '@/plate/common/editableProps';
import { MyValue } from '@/plate/typescript/plateTypes';

export default function BalloonToolbarApp() {
  return (
    <Plate<MyValue>
      editableProps={editableProps}
      plugins={basicNodesPlugins}
      initialValue={balloonToolbarValue}
    >
      <MarkBalloonToolbar />
    </Plate>
  );
}
