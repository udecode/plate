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
      id,
      file: clientFile.file,
      height: clientFile.height,
      type: 'image',
      url: clientFile.objectUrl,
      width: clientFile.width,
    };
  }

  return {
    id,
    file: clientFile.file,
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
        apiImage.cloud_image?.onStart?.(fileEvent);
      } else {
        apiAttachment.cloud_attachment?.onStart?.(fileEvent);
      }
    },
    onError(e) {
      const fileEvent = createFileEvent(id, e.clientFile);

      if (fileEvent.type === 'image') {
        apiImage.cloud_image?.onError?.({
          ...fileEvent,
          message: e.message,
        });
      } else {
        apiAttachment.cloud_attachment?.onError?.({
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
        apiImage.cloud_image?.onProgress?.({
          ...fileEvent,
          ...progressEvent,
        });
      } else {
        apiAttachment.cloud_attachment?.onProgress?.({
          ...fileEvent,
          ...progressEvent,
        } as any);
      }
    },
    onSuccess(e) {
      const fileEvent = createFileEvent(id, e.clientFile);
      const { url } = e.hostedFile;

      if (fileEvent.type === 'image') {
        apiImage.cloud_image?.onSuccess?.({ ...fileEvent, url });
      } else {
        apiAttachment.cloud_attachment?.onSuccess?.({
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
