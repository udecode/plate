import { ClientFile, uploadFile as uploadFileToPortive } from '@portive/client';
import { Value } from '@udecode/plate-core';
import { nanoid } from 'nanoid';
import { CloudEditor, FileEvent, ProgressEvent } from './types';

function createFileEvent(id: string, clientFile: ClientFile): FileEvent {
  if (clientFile.type === 'image') {
    return {
      id,
      type: 'image',
      file: clientFile.file,
      url: clientFile.objectUrl,
      width: clientFile.width,
      height: clientFile.height,
    };
  }
  return {
    id,
    type: 'generic',
    file: clientFile.file,
    url: clientFile.objectUrl,
  };
}

export function uploadFile<V extends Value = Value>(
  editor: CloudEditor<V>,
  file: File
) {
  const id = `#${nanoid()}`;
  const { client } = editor.cloud;
  uploadFileToPortive({
    client,
    file,
    onBeforeFetch(e) {
      const fileEvent = createFileEvent(id, e.clientFile);
      if (fileEvent.type === 'image') {
        console.log(1111);
        editor.cloud.imageFileHandlers?.onStart?.(fileEvent);
      } else {
        editor.cloud.genericFileHandlers?.onStart?.(fileEvent);
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
}

export function uploadFiles<V extends Value = Value>(
  editor: CloudEditor<V>,
  files: Iterable<File>
) {
  for (const file of files) {
    uploadFile(editor, file);
  }
}
