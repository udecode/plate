import * as portiveClient from '@portive/client';
import { type PlateEditor, getPluginApi } from '@udecode/plate-common';
import { nanoid } from '@udecode/plate-common/server';

import type { FileEvent, ProgressEvent } from './types';

import { CloudAttachmentPlugin } from '../attachment';
import { CloudImagePlugin } from '../image';
import { CloudPlugin } from './CloudPlugin';

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

export const uploadFile = (editor: PlateEditor, file: File) => {
  const api = getPluginApi(editor, CloudPlugin);
  const apiImage = getPluginApi(editor, CloudImagePlugin);
  const apiAttachment = getPluginApi(editor, CloudAttachmentPlugin);

  const id = `#${nanoid()}`;

  void portiveClient.uploadFile({
    client: api.cloud.client,
    file,
    onBeforeFetch(e) {
      const fileEvent = createFileEvent(id, e.clientFile);

      if (fileEvent.type === 'image') {
        apiImage.cloud.imageFileHandlers?.onStart?.(fileEvent);
      } else {
        apiAttachment.cloud.genericFileHandlers?.onStart?.(fileEvent);
      }
    },
    onError(e) {
      const fileEvent = createFileEvent(id, e.clientFile);

      if (fileEvent.type === 'image') {
        apiImage.cloud.imageFileHandlers?.onError?.({
          ...fileEvent,
          message: e.message,
        });
      } else {
        apiAttachment.cloud.genericFileHandlers?.onError?.({
          ...fileEvent,
          message: e.message,
        } as any);
      }
    },
    onProgress(e) {
      const fileEvent = createFileEvent(id, e.clientFile);
      const progressEvent: ProgressEvent = {
        sentBytes: e.sentBytes,
        totalBytes: e.totalBytes,
      };

      if (fileEvent.type === 'image') {
        apiImage.cloud.imageFileHandlers?.onProgress?.({
          ...fileEvent,
          ...progressEvent,
        });
      } else {
        apiAttachment.cloud.genericFileHandlers?.onProgress?.({
          ...fileEvent,
          ...progressEvent,
        } as any);
      }
    },
    onSuccess(e) {
      const fileEvent = createFileEvent(id, e.clientFile);
      const { url } = e.hostedFile;

      if (fileEvent.type === 'image') {
        apiImage.cloud.imageFileHandlers?.onSuccess?.({ ...fileEvent, url });
      } else {
        apiAttachment.cloud.genericFileHandlers?.onSuccess?.({
          ...fileEvent,
          url,
        });
      }
    },
  });
};

export const uploadFiles = (editor: PlateEditor, files: Iterable<File>) => {
  for (const file of files) {
    uploadFile(editor, file);
  }
};
