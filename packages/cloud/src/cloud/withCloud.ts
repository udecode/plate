import { Client, createClient } from '@portive/client';
import { Value, WithPlatePlugin } from '@udecode/plate-core';
import { createUploadStore } from '../upload/createUploadStore';
import { finishUploads } from './finishUploads';
import { getSaveValue } from './getSaveValue';
import { CloudPlugin, FinishUploadsOptions, PlateCloudEditor } from './types';
import { uploadFiles } from './uploadFiles';

export const withCloud = <
  V extends Value = Value,
  E extends PlateCloudEditor<V> = PlateCloudEditor<V>
>(
  editor: E,
  plugin: WithPlatePlugin<CloudPlugin, V, E>
) => {
  const {
    apiKey,
    authToken,
    apiOrigin,
    uploadStoreInitialValue,
  } = plugin.options;

  let client: Client;
  try {
    client = createClient({ apiKey, authToken, apiOrigin });
  } catch (err) {
    console.error(err);
  }

  const uploadStore = createUploadStore({
    uploads: uploadStoreInitialValue || {},
  });

  editor.cloud = {
    client: client!,
    uploadFiles: (files: Iterable<File>) => {
      uploadFiles(editor, files);
    },
    uploadStore,
    getSaveValue: () => {
      return getSaveValue<V>(editor.children, uploadStore.get.uploads());
    },
    finishUploads: async (options?: FinishUploadsOptions) => {
      return finishUploads(editor, options);
    },
  };

  return editor;
};
