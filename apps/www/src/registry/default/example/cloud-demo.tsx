import React from 'react';

import { BasicElementsPlugin } from '@udecode/plate-basic-elements';
import { BasicMarksPlugin } from '@udecode/plate-basic-marks';
import {
  CloudAttachmentPlugin,
  CloudImagePlugin,
  CloudPlugin,
} from '@udecode/plate-cloud';
import { Plate } from '@udecode/plate-common/react';
import { usePlateEditor } from '@udecode/plate-core/react';

import { uploadStoreInitialValue } from '@/plate/demo/cloud/uploadStoreInitialValue';
import { editableProps } from '@/plate/demo/editableProps';
import { PlateUI } from '@/plate/demo/plate-ui';
import { cloudValue } from '@/plate/demo/values/cloudValue';
import { CloudAttachmentElement } from '@/registry/default/plate-ui/cloud-attachment-element';
import { CloudImageElement } from '@/registry/default/plate-ui/cloud-image-element';
import { CloudToolbarButtons } from '@/registry/default/plate-ui/cloud-toolbar-buttons';
import { Editor } from '@/registry/default/plate-ui/editor';
import { FixedToolbar } from '@/registry/default/plate-ui/fixed-toolbar';

export default function CloudDemo() {
  const editor = usePlateEditor({
    override: { components: PlateUI },
    plugins: [
      BasicElementsPlugin,
      BasicMarksPlugin,
      CloudPlugin.configure({
        authToken:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InB1UFoyZTdlN0tUVzh0MjQifQ.eyJpYXQiOjE2Njg0NTUxMDksImV4cCI6MTcwMDAxMjcwOX0.xEznN3Wl6GqN57wsDGq0Z6giI4TvU32gvmMJUzcg2No',
        uploadStoreInitialValue,
      }),
      CloudAttachmentPlugin.withComponent(CloudAttachmentElement),
      CloudImagePlugin.configure({
        maxInitialHeight: 320,
        maxInitialWidth: 320,
        maxResizeWidth: 720,
        minResizeWidth: 100,
      }).withComponent(CloudImageElement),
    ],
    value: cloudValue,
  });
  console.log(editor.api);

  return (
    <Plate editor={editor}>
      <FixedToolbar>
        <CloudToolbarButtons />
      </FixedToolbar>

      <Editor className="mt-2" {...editableProps} />
    </Plate>
  );
}
