import * as portiveClient from '@portive/client';
import { createPlugin } from '@udecode/plate-common/server';

import type {
  CloudPluginApi,
  CloudPluginOptions,
  FinishUploadsOptions,
} from './types';

import { createUploadStore } from '../upload/createUploadStore';
import { finishUploads } from './finishUploads';
import { getSaveValue } from './getSaveValue';
import { onDropCloud, onPasteCloud } from './handlers';
import { uploadFiles } from './uploadFiles';

export const KEY_CLOUD = 'cloud';

export const CloudPlugin = createPlugin<
  'cloud',
  CloudPluginOptions,
  CloudPluginApi
>({
  handlers: {
    onDrop: ({ editor, event }) => onDropCloud(editor as any, event),
    onPaste: ({ editor, event }) => onPasteCloud(editor as any, event),
  },
  key: KEY_CLOUD,
}).extendApi(({ editor, plugin: { options } }) => {
  const { apiKey, apiOrigin, authToken, uploadStoreInitialValue } = options;

  let client: portiveClient.Client;

  try {
    client = portiveClient.createClient({ apiKey, apiOrigin, authToken });
  } catch (error) {
    console.error(error);
  }

  const uploadStore = createUploadStore({
    uploads: uploadStoreInitialValue || {},
  });

  return {
    cloud: {
      client: client!,
      finishUploads: async (options?: FinishUploadsOptions) => {
        return finishUploads(editor, options);
      },
      getSaveValue: () => {
        return getSaveValue(editor.children, uploadStore.get.uploads());
      },
      uploadFiles: (files: Iterable<File>) => {
        uploadFiles(editor, files);
      },
      uploadStore,
    },
  };
});
