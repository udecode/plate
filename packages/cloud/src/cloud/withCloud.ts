import type {
  PlateEditor,
  Value,
  WithPlatePlugin,
} from '@udecode/plate-common/server';

import * as portiveClient from '@portive/client';

import type {
  CloudEditorProps,
  CloudPlugin,
  FinishUploadsOptions,
} from './types';

import { createUploadStore } from '../upload/createUploadStore';
import { finishUploads } from './finishUploads';
import { getSaveValue } from './getSaveValue';
import { uploadFiles } from './uploadFiles';

export const withCloud = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
  EE extends CloudEditorProps<V> & E = CloudEditorProps<V> & E,
>(
  e: E,
  plugin: WithPlatePlugin<CloudPlugin, V, E>
) => {
  const editor = e as unknown as EE;

  const { apiKey, apiOrigin, authToken, uploadStoreInitialValue } =
    plugin.options;

  let client: portiveClient.Client;

  try {
    client = portiveClient.createClient({ apiKey, apiOrigin, authToken });
  } catch (error) {
    console.error(error);
  }

  const uploadStore = createUploadStore({
    uploads: uploadStoreInitialValue || {},
  });

  editor.cloud = {
    client: client!,
    finishUploads: async (options?: FinishUploadsOptions) => {
      return finishUploads(editor, options);
    },
    getSaveValue: () => {
      return getSaveValue<V>(editor.children, uploadStore.get.uploads());
    },
    uploadFiles: (files: Iterable<File>) => {
      uploadFiles(editor, files);
    },
    uploadStore,
  };

  return editor;
};
