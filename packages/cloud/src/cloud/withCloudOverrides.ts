import { createClient } from '@portive/client';
import { Value, WithPlatePlugin } from '@udecode/plate-core';
import { createUploadStore } from '../upload/createUploadStore';
import { finishUploads } from './finishUploads';
import { getSaveValue } from './getSaveValue';
import { CloudEditor, CloudPlugin, FinishUploadsOptions } from './types';
import { uploadFiles } from './uploadFiles';

export function withCloudOverrides<
  V extends Value = Value,
  E extends CloudEditor<V> = CloudEditor<V>
>(editor: E, plugin: WithPlatePlugin<CloudPlugin, V, E>) {
  const {
    apiKey,
    authToken,
    apiOrigin,
    uploadStoreInitialValue,
  } = plugin.options;
  const client = createClient({ apiKey, authToken, apiOrigin });
  const useUploadStore = createUploadStore({
    uploads: uploadStoreInitialValue || {},
  });
  editor.cloud = {
    client,
    uploadFiles: (files: Iterable<File>) => {
      uploadFiles(editor, files);
    },
    useUploadStore,
    getSaveValue: () => {
      return getSaveValue<V>(
        editor.children,
        useUploadStore.getState().uploads
      );
    },
    finishUploads: async (options?: FinishUploadsOptions) => {
      return finishUploads(editor, options);
    },
  };
  return editor;
}
