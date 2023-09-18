import React from 'react';
import { uploadStoreInitialValue } from '@/plate/demo/cloud/uploadStoreInitialValue';
import { editableProps } from '@/plate/demo/editableProps';
import { plateUI } from '@/plate/demo/plateUI';
import { basicNodesPlugins } from '@/plate/demo/plugins/basicNodesPlugins';
import { cloudValue } from '@/plate/demo/values/cloudValue';
import {
  createCloudAttachmentPlugin,
  createCloudImagePlugin,
  createCloudPlugin,
  ELEMENT_CLOUD_ATTACHMENT,
  ELEMENT_CLOUD_IMAGE,
} from '@udecode/plate-cloud';
import { Plate } from '@udecode/plate-common';

import { createMyPlugins, MyValue } from '@/types/plate-types';
import { CloudAttachmentElement } from '@/registry/default/plate-ui/cloud-attachment-element';
import { CloudImageElement } from '@/registry/default/plate-ui/cloud-image-element';
import { CloudToolbarButtons } from '@/registry/default/plate-ui/cloud-toolbar-buttons';
import { Editor } from '@/registry/default/plate-ui/editor';
import { FixedToolbar } from '@/registry/default/plate-ui/fixed-toolbar';

const plugins = createMyPlugins(
  [
    ...basicNodesPlugins,
    createCloudPlugin({
      options: {
        /**
         * You can use either a Portive API Key `apiKey` or an Auth Token
         * `authToken` generated from the API Key.
         * https://www.portive.com/docs/auth/intro
         */
        // apiKey: 'PRTV_xxxx_xxxx'
        authToken:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InB1UFoyZTdlN0tUVzh0MjQifQ.eyJpYXQiOjE2Njg0NTUxMDksImV4cCI6MTcwMDAxMjcwOX0.xEznN3Wl6GqN57wsDGq0Z6giI4TvU32gvmMJUzcg2No',
        uploadStoreInitialValue, // don't need to specify this in actual app
      },
    }),
    createCloudAttachmentPlugin(),
    createCloudImagePlugin({
      options: {
        maxInitialWidth: 320,
        maxInitialHeight: 320,
        minResizeWidth: 100,
        maxResizeWidth: 720,
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

export default function CloudDemo() {
  return (
    <Plate<MyValue> plugins={plugins} initialValue={cloudValue}>
      <FixedToolbar>
        <CloudToolbarButtons />
      </FixedToolbar>

      <Editor className="mt-2" {...editableProps} />
    </Plate>
  );
}
