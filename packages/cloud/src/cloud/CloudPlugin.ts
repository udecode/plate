import type { PluginConfig, Value } from '@udecode/plate-common';

import * as portiveClient from '@portive/client';
import { createTPlatePlugin } from '@udecode/plate-common/react';

import type { Upload } from '../upload';
import type { FinishUploadsOptions } from './types';

import { createUploadStore } from '../upload/createUploadStore';
import { finishUploads } from './finishUploads';
import { getSaveValue } from './getSaveValue';
import { onDropCloud, onPasteCloud } from './handlers';
import { uploadFiles } from './uploadFiles';

export type CloudConfig = PluginConfig<
  'cloud',
  {
    client?: portiveClient.Client;
    uploadStore?: ReturnType<typeof createUploadStore>;
    uploadStoreInitialValue?: Record<string, Upload>;
  } & portiveClient.ClientOptions,
  {
    cloud: {
      finishUploads: (options?: FinishUploadsOptions) => Promise<void>;
      getSaveValue: () => Value;
      uploadFiles: (files: Iterable<File>) => void;
    };
  }
>;

export const CloudPlugin = createTPlatePlugin<CloudConfig>({
  handlers: {
    onDrop: ({ editor, event }) => onDropCloud(editor, event),
    onPaste: ({ editor, event }) => onPasteCloud(editor, event),
  },
  key: 'cloud',
  options: {},
})
  .extend(({ editor, getOptions }) => {
    let client: portiveClient.Client;

    const { apiKey, apiOrigin, authToken, uploadStoreInitialValue } =
      getOptions();

    try {
      client = portiveClient.createClient({ apiKey, apiOrigin, authToken });
    } catch (error) {
      editor.api.debug.error(error, 'PORTIVE_CLIENT');
    }

    return {
      options: {
        client: client!,
        uploadStore: createUploadStore({
          uploads: uploadStoreInitialValue || {},
        }),
      },
    };
  })
  .extendApi(({ editor, getOptions }) => {
    return {
      finishUploads: async (options?: FinishUploadsOptions): Promise<void> => {
        return finishUploads(editor, options);
      },
      getSaveValue: (): Value => {
        return getSaveValue(
          editor.children,
          getOptions().uploadStore.get.uploads()
        );
      },
      uploadFiles: (files: Iterable<File>) => {
        uploadFiles(editor, files);
      },
    };
  });
