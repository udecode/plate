import { EElementOrText, insertNode, Value } from '@udecode/plate-core';
import { CloudEditor } from '../cloud/types';
import { TCloudAttachmentElement } from './types';

type CloudAttachmentValue = TCloudAttachmentElement[];

// const uploadMap = new Map<string, Atom<Upload>>();

export function withCloudAttachmentOverrides<
  V extends Value = Value,
  E extends CloudEditor<V> = CloudEditor<V>
>(editor: E) {
  editor.cloud.genericFileHandlers = {
    onStart(e) {
      console.log('start', e);
      const node: EElementOrText<CloudAttachmentValue> = {
        type: 'cloud_attachment',
        url: e.id,
        filename: e.file.name,
        bytes: e.file.size,
        children: [{ text: '' }],
      };
      insertNode<Value>(editor, node);
      editor.cloud.useUploadStore.getState().setUpload(e.id, {
        status: 'progress',
        sentBytes: 0,
        totalBytes: e.file.size,
      });
    },
    onProgress(e) {
      console.log('progress', e);
      editor.cloud.useUploadStore.getState().setUpload(e.id, {
        status: 'progress',
        sentBytes: e.sentBytes,
        totalBytes: e.totalBytes,
      });
    },
    onError(e) {
      console.log('error', e);
      editor.cloud.useUploadStore.getState().setUpload(e.id, {
        status: 'error',
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
