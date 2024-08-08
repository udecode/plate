import * as portiveClient from '@portive/client';
import { nanoid } from '@udecode/plate-common/server';

import type { FileEvent, PlateCloudEditor, ProgressEvent } from './types';

const createFileEvent = (
  id: string,
  clientFile: portiveClient.ClientFile
): FileEvent => {
  if (clientFile.type === 'image') {
    return {
      file: clientFile.file,
      height: clientFile.height,
      id,
      type: 'image',
      url: clientFile.objectUrl,
      width: clientFile.width,
    };
  }

  return {
    file: clientFile.file,
    id,
    type: 'generic',
    url: clientFile.objectUrl,
  };
};

export const uploadFile = (editor: PlateCloudEditor, file: File) => {
  const id = `#${nanoid()}`;

  const { client } = editor.cloud;
  void portiveClient.uploadFile({
    client,
    file,
    onBeforeFetch(e) {
      const fileEvent = createFileEvent(id, e.clientFile);

      if (fileEvent.type === 'image') {
        editor.cloud.imageFileHandlers?.onStart?.(fileEvent);
      } else {
        editor.cloud.genericFileHandlers?.onStart?.(fileEvent);
      }
    },
    onError(e) {
      const fileEvent = createFileEvent(id, e.clientFile);

      if (fileEvent.type === 'image') {
        editor.cloud.imageFileHandlers?.onError?.({
          ...fileEvent,
          message: e.message,
        });
      } else {
        editor.cloud.genericFileHandlers?.onError?.({
          ...fileEvent,
          message: e.message,
        });
      }
    },
    onProgress(e) {
      const fileEvent = createFileEvent(id, e.clientFile);
      const progressEvent: ProgressEvent = {
        sentBytes: e.sentBytes,
        totalBytes: e.totalBytes,
      };

      if (fileEvent.type === 'image') {
        editor.cloud.imageFileHandlers?.onProgress?.({
          ...fileEvent,
          ...progressEvent,
        });
      } else {
        editor.cloud.genericFileHandlers?.onProgress?.({
          ...fileEvent,
          ...progressEvent,
        });
      }
    },
    onSuccess(e) {
      const fileEvent = createFileEvent(id, e.clientFile);
      const { url } = e.hostedFile;

      if (fileEvent.type === 'image') {
        editor.cloud.imageFileHandlers?.onSuccess?.({ ...fileEvent, url });
      } else {
        editor.cloud.genericFileHandlers?.onSuccess?.({ ...fileEvent, url });
      }
    },
  });
};

export const uploadFiles = (
  editor: PlateCloudEditor,
  files: Iterable<File>
) => {
  for (const file of files) {
    uploadFile(editor, file);
  }
};
