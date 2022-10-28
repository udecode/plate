import React from 'react';
import {
  createCloudAttachmentPlugin,
  createCloudPlugin,
  Plate,
  PlateProvider,
} from '@udecode/plate';
import { basicNodesPlugins } from './basic-nodes/basicNodesPlugins';
import { cloudValue } from './cloud/cloudValue';
import { uploadStoreInitialValue } from './cloud/uploadStoreInitialValue';
import { editableProps } from './common/editableProps';
import { plateUI } from './common/plateUI';
import { createMyPlugins, MyValue } from './typescript/plateTypes';

const plugins = createMyPlugins(
  [
    ...basicNodesPlugins,
    createCloudPlugin({
      options: {
        apiKey: process.env.NEXT_PUBLIC_PORTIVE_API_KEY,
        uploadStoreInitialValue,
      },
    }),
    createCloudAttachmentPlugin(),
  ],
  {
    components: plateUI,
  }
);

export default () => (
  <PlateProvider<MyValue> plugins={plugins} initialValue={cloudValue}>
    <Plate<MyValue> editableProps={editableProps} />
  </PlateProvider>
);
