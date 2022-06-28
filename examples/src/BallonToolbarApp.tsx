import React from 'react';
import { Plate } from '@udecode/plate';
import { balloonToolbarValue } from './balloon-toolbar/balloonToolbarValue';
import { MarkBallonToolbar } from './balloon-toolbar/MarkBallonToolbar';
import { basicNodesPlugins } from './basic-elements/basicNodesPlugins';
import { editableProps } from './common/editableProps';
import { MyValue } from './typescript/plateTypes';

export default () => (
  <Plate<MyValue>
    editableProps={editableProps}
    plugins={basicNodesPlugins}
    initialValue={balloonToolbarValue}
  >
    <MarkBallonToolbar />
  </Plate>
);
