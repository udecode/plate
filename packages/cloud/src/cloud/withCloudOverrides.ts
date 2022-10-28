import { createClient } from '@portive/client';
import { Value, WithPlatePlugin } from '@udecode/plate-core';
import { createUploadStore } from '../upload/createUploadStore';
import { CloudEditor, CloudPlugin } from './types';
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
  editor.cloud = {
    client,
    uploadFiles: (files: Iterable<File>) => {
      uploadFiles(editor, files);
    },
    useUploadStore: createUploadStore({
      uploads: uploadStoreInitialValue || {},
    }),
  };
  return editor;
}
