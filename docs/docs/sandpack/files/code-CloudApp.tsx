export const cloudAppCode = `import React from 'react';
import { Plate, PlateProvider } from '@udecode/plate';
import {
  createCloudAttachmentPlugin,
  createCloudImagePlugin,
  createCloudPlugin,
  ELEMENT_CLOUD_ATTACHMENT,
  ELEMENT_CLOUD_IMAGE,
} from '@udecode/plate-cloud';
import {
  CloudAttachmentElement,
  CloudImageElement,
} from '@udecode/plate-ui-cloud';
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
        uploadStoreInitialValue, // don't need to specify this in actual app
      },
    }),
    createCloudAttachmentPlugin(),
    createCloudImagePlugin({
      options: {
        maxInitialWidth: 320,
        maxInitialHeight: 320,
      },
    }),
  ],
  {
    components: {
      ...plateUI,
      [ELEMENT_CLOUD_ATTACHMENT]: CloudAttachmentElement,
      [ELEMENT_CLOUD_IMAGE]: CloudImageElement,
    },
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
`;

export const cloudAppFile = {
  '/CloudApp.tsx': cloudAppCode,
};
