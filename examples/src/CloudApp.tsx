import React from 'react';
import {
  createCloudAttachmentPlugin,
  createCloudImagePlugin,
  createCloudPlugin,
  Plate,
  PlateProvider,
} from '@udecode/plate';
import { basicNodesPlugins } from './basic-nodes/basicNodesPlugins';
import { CloudToolbarButtons } from './cloud/CloudToolbarButtons';
import { cloudValue } from './cloud/cloudValue';
import { uploadStoreInitialValue } from './cloud/uploadStoreInitialValue';
import { editableProps } from './common/editableProps';
import { plateUI } from './common/plateUI';
import { Toolbar } from './toolbar/Toolbar';
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
    createCloudImagePlugin(),
  ],
  {
    components: plateUI,
  }
);

export default () => (
  <>
    <PlateProvider<MyValue> plugins={plugins} initialValue={cloudValue}>
      <Toolbar>
        <CloudToolbarButtons />
      </Toolbar>
      <Plate<MyValue> editableProps={editableProps} />
    </PlateProvider>
  </>
);
