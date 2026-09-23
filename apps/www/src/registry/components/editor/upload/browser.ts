import { isUrl } from 'platejs';
import {
  AudioPlugin,
  FilePlugin,
  ImagePlugin,
  VideoPlugin,
} from 'platejs/media/react';
import type { UploadClient } from 'platejs/upload';
import { UploadPlugin } from 'platejs/upload/react';

export const createBrowserUploadKit = () => {
  const urls = new Map<string, string>();
  const objectUrls = new Set<string>();
  const isAllowedUrl = (url: string) => objectUrls.has(url) || isUrl(url);
  const client: UploadClient = {
    upload: async (file, options) => {
      options?.signal?.throwIfAborted();

      const key = crypto.randomUUID();
      const url = URL.createObjectURL(file);
      urls.set(key, url);
      objectUrls.add(url);
      const type = file.type || 'application/octet-stream';

      options?.onProgress?.(
        { fraction: 1, loaded: file.size, total: file.size },
        [
          {
            file,
            key,
            loaded: file.size,
            name: file.name,
            progress: 1,
            size: file.size,
            status: 'success',
            total: file.size,
            type,
          },
        ]
      );

      return { key, lastModified: file.lastModified, size: file.size, type };
    },
  };

  return {
    dispose: () => {
      for (const url of urls.values()) URL.revokeObjectURL(url);
      urls.clear();
      objectUrls.clear();
    },
    plugins: [
      ImagePlugin.configure({ initialState: { isUrl: isAllowedUrl } }),
      VideoPlugin.configure({ initialState: { isUrl: isAllowedUrl } }),
      AudioPlugin.configure({ initialState: { isUrl: isAllowedUrl } }),
      FilePlugin.configure({ initialState: { isUrl: isAllowedUrl } }),
      UploadPlugin.configure({
        initialState: {
          client,
          getUrl: ({ key }) => {
            const url = urls.get(key);
            if (!url) throw new Error('Missing playground upload URL.');

            return url;
          },
        },
      }),
    ],
  };
};
