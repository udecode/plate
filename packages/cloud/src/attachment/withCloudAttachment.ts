import {
  EElementOrText,
  insertNode,
  Value,
  WithPlatePlugin,
} from '@udecode/plate-common/server';
import Defer from 'p-defer';

import { PlateCloudEditor } from '../cloud/types';
import { UploadError, UploadSuccess } from '../upload';
import { CloudAttachmentPlugin, TCloudAttachmentElement } from './types';

type CloudAttachmentValue = TCloudAttachmentElement[];

// const uploadMap = new Map<string, Atom<Upload>>();

export const withCloudAttachment = <
  V extends Value = Value,
  E extends PlateCloudEditor<V> = PlateCloudEditor<V>,
>(
  editor: E,
  // eslint-disable-next-line unused-imports/no-unused-vars
  plugin: WithPlatePlugin<CloudAttachmentPlugin, V, E>
) => {
  /**
   * We create a deferredFinish which is an object with a `promise` and a way
   * to `resolve` or `reject` the Promise outside of the Promise. We use
   * `p-defer` library to do this. The `finish` Promise gets added to the
   * `origin` object so we can await `origin.finish` during the save process
   * to wait for all the files to finish uploading.
   */
  const deferredFinish = Defer<UploadSuccess | UploadError>();
  const finishPromise = deferredFinish.promise;

  editor.cloud.genericFileHandlers = {
    onStart(e) {
      const node: EElementOrText<CloudAttachmentValue> = {
        type: 'cloud_attachment',
        url: e.id,
        filename: e.file.name,
        bytes: e.file.size,
        children: [{ text: '' }],
      };
      insertNode<Value>(editor, node);
      editor.cloud.uploadStore.set.upload(e.id, {
        status: 'progress',
        url: e.url,
        sentBytes: 0,
        totalBytes: e.file.size,
        finishPromise,
      });
    },
    onProgress(e) {
      editor.cloud.uploadStore.set.upload(e.id, {
        status: 'progress',
        url: e.url,
        sentBytes: e.sentBytes,
        totalBytes: e.totalBytes,
        finishPromise,
      });
    },
    onError(e) {
      const upload: UploadError = {
        status: 'error',
        url: e.url,
        message: e.message,
      };
      editor.cloud.uploadStore.set.upload(e.id, upload);
      deferredFinish.resolve(upload);
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
