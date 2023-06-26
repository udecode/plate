export const balloonToolbarAppCode = `import React from 'react';
import { Plate } from '@udecode/plate';
import { balloonToolbarValue } from './balloon-toolbar/balloonToolbarValue';
import { MarkBalloonToolbar } from './balloon-toolbar/MarkBalloonToolbar';
import { basicNodesPlugins } from './basic-nodes/basicNodesPlugins';
import { editableProps } from './common/editableProps';
import { MyValue } from './typescript/plateTypes';

export default () => (
  <Plate<MyValue>
    editableProps={editableProps}
    plugins={basicNodesPlugins}
    initialValue={balloonToolbarValue}
  >
    <MarkBalloonToolbar />
  </Plate>
);
`;

export const balloonToolbarAppFile = {
  '/BalloonToolbarApp.tsx': balloonToolbarAppCode,
};
