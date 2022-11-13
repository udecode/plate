import { resizeIn } from '@portive/client';
import { insertNode, Value, WithPlatePlugin } from '@udecode/plate-core';
import Defer from 'p-defer';
import { PlateCloudEditor } from '../cloud/types';
import { UploadError, UploadSuccess } from '../upload';
import { CloudImagePlugin, TCloudImageElement } from './types';

export const withCloudImage = <
  V extends Value = Value,
  E extends PlateCloudEditor<V> = PlateCloudEditor<V>
>(
  editor: E,
  plugin: WithPlatePlugin<CloudImagePlugin, V, E>
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

  editor.cloud.imageFileHandlers = {
    onStart(e) {
      const { maxInitialWidth, maxInitialHeight } = plugin.options;
      const { width, height } = resizeIn(
        { width: e.width, height: e.height },
        { width: maxInitialWidth || 320, height: maxInitialHeight || 320 }
      );
      const node: TCloudImageElement = {
        type: 'cloud_image',
        url: e.id,
        bytes: e.file.size,
        width,
        height,
        maxWidth: e.width,
        maxHeight: e.height,
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
