import * as portiveClient from '@portive/client';
import { type Value, createPlugin } from '@udecode/plate-common';

import type { Upload } from '../upload';
import type { FinishUploadsOptions } from './types';

import { createUploadStore } from '../upload/createUploadStore';
import { finishUploads } from './finishUploads';
import { getSaveValue } from './getSaveValue';
import { onDropCloud, onPasteCloud } from './handlers';
import { uploadFiles } from './uploadFiles';

export const CloudPlugin = createPlugin({
  handlers: {
    onDrop: ({ editor, event }) => onDropCloud(editor, event),
    onPaste: ({ editor, event }) => onPasteCloud(editor, event),
  },
  key: 'cloud',
  options: {} as {
    uploadStoreInitialValue?: Record<string, Upload>;
  } & portiveClient.ClientOptions,
}).extendApi(({ editor, plugin: { options } }) => {
  const { apiKey, apiOrigin, authToken, uploadStoreInitialValue } = options;

  let client: portiveClient.Client;

  try {
    client = portiveClient.createClient({ apiKey, apiOrigin, authToken });
  } catch (error) {
    editor.api.debug.error(error, 'PORTIVE_CLIENT');
  }

  const uploadStore = createUploadStore({
    uploads: uploadStoreInitialValue || {},
  });

  return {
    cloud: {
      client: client!,
      finishUploads: async (options?: FinishUploadsOptions): Promise<void> => {
        return finishUploads(editor, options);
      },
      getSaveValue: (): Value => {
        return getSaveValue(editor.children, uploadStore.get.uploads());
      },
      uploadFiles: (files: Iterable<File>) => {
        uploadFiles(editor, files);
      },
      uploadStore,
    },
  };
});
