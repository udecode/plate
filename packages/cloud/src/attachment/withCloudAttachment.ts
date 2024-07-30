import {
  type EElementOrText,
  type Value,
  type WithOverride,
  insertNode,
} from '@udecode/plate-common/server';
import Defer from 'p-defer';

import type { PlateCloudEditor } from '../cloud/types';
import type { UploadError, UploadSuccess } from '../upload';
import type { TCloudAttachmentElement } from './types';

type CloudAttachmentValue = TCloudAttachmentElement[];

// const uploadMap = new Map<string, Atom<Upload>>();

export const withCloudAttachment: WithOverride = (_editor) => {
  const editor = _editor as PlateCloudEditor;

  /**
   * We create a deferredFinish which is an object with a `promise` and a way to
   * `resolve` or `reject` the Promise outside of the Promise. We use `p-defer`
   * library to do this. The `finish` Promise gets added to the `origin` object
   * so we can await `origin.finish` during the save process to wait for all the
   * files to finish uploading.
   */
  const deferredFinish = Defer<UploadError | UploadSuccess>();
  const finishPromise = deferredFinish.promise;

  editor.cloud.genericFileHandlers = {
    onError(e) {
      const upload: UploadError = {
        message: e.message,
        status: 'error',
        url: e.url,
      };
      editor.cloud.uploadStore.set.upload(e.id, upload);
      deferredFinish.resolve(upload);
    },
    onProgress(e) {
      editor.cloud.uploadStore.set.upload(e.id, {
        finishPromise,
        sentBytes: e.sentBytes,
        status: 'progress',
        totalBytes: e.totalBytes,
        url: e.url,
      });
    },
    onStart(e) {
      const node: EElementOrText<CloudAttachmentValue> = {
        bytes: e.file.size,
        children: [{ text: '' }],
        filename: e.file.name,
        type: 'cloud_attachment',
        url: e.id,
      };
      insertNode<Value>(editor, node);
      editor.cloud.uploadStore.set.upload(e.id, {
        finishPromise,
        sentBytes: 0,
        status: 'progress',
        totalBytes: e.file.size,
        url: e.url,
      });
    },
    onSuccess(e) {
      const upload: UploadSuccess = {
        status: 'success',
        url: e.url,
      };
      editor.cloud.uploadStore.set.upload(e.id, upload);
      deferredFinish.resolve(upload);
    },
  };

  return editor;
};
