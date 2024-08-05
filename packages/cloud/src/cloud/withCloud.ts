import type { PlateEditor, WithOverride } from '@udecode/plate-common/server';

import * as portiveClient from '@portive/client';

import type {
  CloudEditorProps,
  CloudPluginOptions,
  FinishUploadsOptions,
} from './types';

import { createUploadStore } from '../upload/createUploadStore';
import { finishUploads } from './finishUploads';
import { getSaveValue } from './getSaveValue';
import { uploadFiles } from './uploadFiles';

export const withCloud: WithOverride<CloudPluginOptions> = ({
  editor: e,
  plugin,
}) => {
  const editor = e as CloudEditorProps & PlateEditor;

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
      return getSaveValue(editor.children, uploadStore.get.uploads());
    },
    uploadFiles: (files: Iterable<File>) => {
      uploadFiles(editor, files);
    },
    uploadStore,
  };

  return editor;
};
