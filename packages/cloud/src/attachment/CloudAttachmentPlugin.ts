import { insertNode } from '@udecode/plate-common';
import { createPlatePlugin } from '@udecode/plate-common/react';
import Defer from 'p-defer';

import type { UploadError, UploadSuccess } from '../upload';
import type { TCloudAttachmentElement } from './types';

import { CloudPlugin, type FileEvent, type SuccessEvent } from '../cloud';

export const CloudAttachmentPlugin = createPlatePlugin({
  dependencies: ['cloud'],
  isElement: true,
  isVoid: true,
  key: 'cloud_attachment',
}).extendApi(({ editor }) => {
  const { uploadStore } = editor.getOptions(CloudPlugin);

  const deferredFinish = Defer<UploadError | UploadSuccess>();
  const finishPromise = deferredFinish.promise;

  return {
    cloudAttachment: {
      onError(e: ErrorEvent & FileEvent) {
        const upload: UploadError = {
          message: e.message,
          status: 'error',
          url: e.url,
        };
        uploadStore.set.upload(e.id, upload);
        deferredFinish.resolve(upload);
      },
      onProgress(e: FileEvent & ProgressEvent) {
        uploadStore.set.upload(e.id, {
          finishPromise,
          sentBytes: (e as any).sentBytes,
          status: 'progress',
          totalBytes: (e as any).totalBytes,
          url: e.url,
        });
      },
      onStart(e: FileEvent) {
        const node: TCloudAttachmentElement = {
          bytes: e.file.size,
          children: [{ text: '' }],
          filename: e.file.name,
          type: 'cloud_attachment',
          url: e.id,
        };

        insertNode(editor, node);

        uploadStore.set.upload(e.id, {
          finishPromise,
          sentBytes: 0,
          status: 'progress',
          totalBytes: e.file.size,
          url: e.url,
        });
      },
      onSuccess(e: FileEvent & SuccessEvent) {
        const upload: UploadSuccess = {
          status: 'success',
          url: e.url,
        };
        uploadStore.set.upload(e.id, upload);
        deferredFinish.resolve(upload);
      },
    },
  };
});
