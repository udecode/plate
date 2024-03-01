import * as portiveClient from '@portive/client';
import { insertNode, Value, WithPlatePlugin } from '@udecode/plate-common';
import Defer from 'p-defer';

import { PlateCloudEditor } from '../cloud';
import { UploadError, UploadSuccess } from '../upload';
import {
  CloudImagePlugin,
  PlateCloudImageEditor,
  TCloudImageElement,
} from './types';

const DEFAULT_MAX_INITIAL_WIDTH = 320;
const DEFAULT_MAX_INITIAL_HEIGHT = 320;
const DEFAULT_MIN_RESIZE_WIDTH = 100;
const DEFAULT_MAX_RESIZE_WIDTH = 640;

export const withCloudImage = <
  V extends Value = Value,
  E extends PlateCloudImageEditor<V> = PlateCloudImageEditor<V>,
>(
  $editor: E,
  plugin: WithPlatePlugin<CloudImagePlugin, V, E>
) => {
  const editor = $editor as E & PlateCloudEditor<V>;
  const { maxInitialWidth, maxInitialHeight, minResizeWidth, maxResizeWidth } =
    {
      maxInitialWidth: DEFAULT_MAX_INITIAL_WIDTH,
      maxInitialHeight: DEFAULT_MAX_INITIAL_HEIGHT,
      minResizeWidth: DEFAULT_MIN_RESIZE_WIDTH,
      maxResizeWidth: DEFAULT_MAX_RESIZE_WIDTH,
      ...plugin.options,
    };

  editor.cloudImage = {
    maxInitialWidth,
    maxInitialHeight,
    minResizeWidth,
    maxResizeWidth,
  };

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
      const { width, height } = portiveClient.resizeIn(
        { width: e.width, height: e.height },
        { width: maxInitialWidth, height: maxInitialHeight }
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
