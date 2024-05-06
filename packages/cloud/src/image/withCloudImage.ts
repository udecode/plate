import * as portiveClient from '@portive/client';
import {
  type Value,
  type WithPlatePlugin,
  insertNode,
} from '@udecode/plate-common/server';
import Defer from 'p-defer';

import type { PlateCloudEditor } from '../cloud';
import type { UploadError, UploadSuccess } from '../upload';
import type {
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
  const { maxInitialHeight, maxInitialWidth, maxResizeWidth, minResizeWidth } =
    {
      maxInitialHeight: DEFAULT_MAX_INITIAL_HEIGHT,
      maxInitialWidth: DEFAULT_MAX_INITIAL_WIDTH,
      maxResizeWidth: DEFAULT_MAX_RESIZE_WIDTH,
      minResizeWidth: DEFAULT_MIN_RESIZE_WIDTH,
      ...plugin.options,
    };

  editor.cloudImage = {
    maxInitialHeight,
    maxInitialWidth,
    maxResizeWidth,
    minResizeWidth,
  };

  /**
   * We create a deferredFinish which is an object with a `promise` and a way to
   * `resolve` or `reject` the Promise outside of the Promise. We use `p-defer`
   * library to do this. The `finish` Promise gets added to the `origin` object
   * so we can await `origin.finish` during the save process to wait for all the
   * files to finish uploading.
   */
  const deferredFinish = Defer<UploadError | UploadSuccess>();
  const finishPromise = deferredFinish.promise;

  editor.cloud.imageFileHandlers = {
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
      const { height, width } = portiveClient.resizeIn(
        { height: e.height, width: e.width },
        { height: maxInitialHeight, width: maxInitialWidth }
      );
      const node: TCloudImageElement = {
        bytes: e.file.size,
        children: [{ text: '' }],
        height,
        maxHeight: e.height,
        maxWidth: e.width,
        type: 'cloud_image',
        url: e.id,
        width,
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
