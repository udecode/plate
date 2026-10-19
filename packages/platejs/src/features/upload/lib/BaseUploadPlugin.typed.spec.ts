import { createFilesClient, type UploadOutcome } from 'files-sdk/client';

import { createEditor } from '../../../core';
import {
  BaseUploadPlugin,
  type UploadClient,
  type UploadFailure,
} from './BaseUploadPlugin';

const assertUploadInference = () => {
  const narrowClient: UploadClient = {
    upload: async (file, options) => {
      options?.onProgress?.(
        { fraction: 1, loaded: file.size, total: file.size },
        []
      );
      return { key: file.name, size: file.size, type: file.type };
    },
  };
  const plugin = BaseUploadPlugin.configure({
    initialState: {
      client: createFilesClient({ endpoint: '/api/files' }),
      getUrl: (outcome) => {
        outcome satisfies UploadOutcome;
        return `/api/files?op=download&key=${encodeURIComponent(outcome.key)}`;
      },
      onError: (failure) => {
        failure satisfies UploadFailure;
      },
    },
  });
  const editor = createEditor({ plugins: [plugin] });
  const key = editor.key([0])!;

  editor.plugin(plugin).update.submit([], { slot: key });
  editor.plugin(plugin).update.submit([], { before: key });
  editor.plugin(plugin).update.submit([], { after: key, replaceEmpty: true });
  editor.plugin(plugin).api.cancel(key);

  // @ts-expect-error slot placement cannot be mixed with block insertion
  editor.plugin(plugin).update.submit([], { after: key, slot: key });
  // @ts-expect-error the public cancel API exposes only the live node key
  editor.plugin(plugin).api.cancel(key, {});

  BaseUploadPlugin.configure({
    initialState: {
      client: narrowClient,
      // @ts-expect-error durable URLs are resolved synchronously
      getUrl: async (outcome) => outcome.key,
    },
  });
};

void assertUploadInference;
