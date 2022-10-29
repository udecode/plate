import { resizeIn } from '@portive/client';
import { insertNode, Value, WithPlatePlugin } from '@udecode/plate-core';
import { CloudEditor } from '../cloud/types';
import { CloudImagePlugin, TCloudImageElement } from './types';

export function withCloudImageOverrides<
  V extends Value = Value,
  E extends CloudEditor<V> = CloudEditor<V>
>(editor: E, plugin: WithPlatePlugin<CloudImagePlugin, V, E>) {
  editor.cloud.imageFileHandlers = {
    onStart(e) {
      console.log('start', e);
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
      editor.cloud.useUploadStore.getState().setUpload(e.id, {
        status: 'progress',
        url: e.url,
        sentBytes: 0,
        totalBytes: e.file.size,
      });
    },
    onProgress(e) {
      console.log('progress', e);
      editor.cloud.useUploadStore.getState().setUpload(e.id, {
        status: 'progress',
        url: e.url,
        sentBytes: e.sentBytes,
        totalBytes: e.totalBytes,
      });
    },
    onError(e) {
      console.log('error', e);
      editor.cloud.useUploadStore.getState().setUpload(e.id, {
        status: 'error',
        url: e.url,
        message: e.message,
      });
    },
    onSuccess(e) {
      console.log('success', e);
      editor.cloud.useUploadStore.getState().setUpload(e.id, {
        status: 'success',
        url: e.url,
      });
    },
  };
  return editor;
}
