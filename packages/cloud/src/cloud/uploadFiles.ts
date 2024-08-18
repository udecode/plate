import type { SlateEditor } from '@udecode/plate-common';

import * as portiveClient from '@portive/client';
import { nanoid } from '@udecode/plate-common';

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

export const uploadFile = (editor: SlateEditor, file: File) => {
  const { client } = editor.getOptions(CloudPlugin);
  const apiImage = editor.getApi(CloudImagePlugin);
  const apiAttachment = editor.getApi(CloudAttachmentPlugin);

  const id = `#${nanoid()}`;

  void portiveClient.uploadFile({
    client,
    file,
    onBeforeFetch(e) {
      const fileEvent = createFileEvent(id, e.clientFile);

      if (fileEvent.type === 'image') {
        apiImage.cloudImage?.onStart?.(fileEvent);
      } else {
        apiAttachment.cloudAttachment?.onStart?.(fileEvent);
      }
    },
    onError(e) {
      const fileEvent = createFileEvent(id, e.clientFile);

      if (fileEvent.type === 'image') {
        apiImage.cloudImage?.onError?.({
          ...fileEvent,
          message: e.message,
        });
      } else {
        apiAttachment.cloudAttachment?.onError?.({
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
        apiImage.cloudImage?.onProgress?.({
          ...fileEvent,
          ...progressEvent,
        });
      } else {
        apiAttachment.cloudAttachment?.onProgress?.({
          ...fileEvent,
          ...progressEvent,
        } as any);
      }
    },
    onSuccess(e) {
      const fileEvent = createFileEvent(id, e.clientFile);
      const { url } = e.hostedFile;

      if (fileEvent.type === 'image') {
        apiImage.cloudImage?.onSuccess?.({ ...fileEvent, url });
      } else {
        apiAttachment.cloudAttachment?.onSuccess?.({
          ...fileEvent,
          url,
        });
      }
    },
  });
};

export const uploadFiles = (editor: SlateEditor, files: Iterable<File>) => {
  for (const file of files) {
    uploadFile(editor, file);
  }
};
