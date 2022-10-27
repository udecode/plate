import React from 'react';
import {
  createCloudAttachmentPlugin,
  Plate,
  PlateProvider,
} from '@udecode/plate';
import { basicNodesPlugins } from './basic-nodes/basicNodesPlugins';
import { cloudValue } from './cloud/cloudValue';
import { editableProps } from './common/editableProps';
import { plateUI } from './common/plateUI';
import { createMyPlugins, MyValue } from './typescript/plateTypes';

const plugins = createMyPlugins(
  [...basicNodesPlugins, createCloudAttachmentPlugin()],
  {
    components: plateUI,
  }
);

export default () => (
  <PlateProvider<MyValue> plugins={plugins} initialValue={cloudValue}>
    <Plate<MyValue> editableProps={editableProps} />
  </PlateProvider>
);
