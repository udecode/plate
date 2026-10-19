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
  let delayMs = 0;
  let disposal = new AbortController();
  const urls = new Map<string, string>();
  const objectUrls = new Set<string>();
  const isAllowedUrl = (url: string) => objectUrls.has(url) || isUrl(url);
  const client: UploadClient = {
    upload: async (file, options) => {
      const signal = options?.signal
        ? AbortSignal.any([options.signal, disposal.signal])
        : disposal.signal;
      signal.throwIfAborted();

      const key = crypto.randomUUID();
      const type = file.type || 'application/octet-stream';
      const reportProgress = (
        fraction: number,
        status: 'success' | 'uploading'
      ) => {
        const loaded = Math.round(file.size * fraction);

        options?.onProgress?.({ fraction, loaded, total: file.size }, [
          {
            file,
            key,
            loaded,
            name: file.name,
            progress: fraction,
            size: file.size,
            status,
            total: file.size,
            type,
          },
        ]);
      };
      const uploadDelayMs = delayMs;

      if (uploadDelayMs > 0) {
        reportProgress(0, 'uploading');
        await new Promise<void>((resolve, reject) => {
          const startedAt = performance.now();
          const interval = window.setInterval(() => {
            reportProgress(
              Math.min((performance.now() - startedAt) / uploadDelayMs, 0.99),
              'uploading'
            );
          }, 100);
          const timeout = window.setTimeout(() => {
            cleanup();
            resolve();
          }, uploadDelayMs);
          const abort = () => {
            cleanup();
            // oxlint-disable-next-line typescript/prefer-promise-reject-errors -- Reject with the caller's AbortSignal.reason, as fetch does.
            reject(signal.reason);
          };
          const cleanup = () => {
            window.clearInterval(interval);
            window.clearTimeout(timeout);
            signal.removeEventListener('abort', abort);
          };

          signal.addEventListener('abort', abort, { once: true });
          if (signal.aborted) abort();
        });
      }

      signal.throwIfAborted();
      const url = URL.createObjectURL(file);
      urls.set(key, url);
      objectUrls.add(url);

      reportProgress(1, 'success');

      return { key, lastModified: file.lastModified, size: file.size, type };
    },
  };

  return {
    dispose: () => {
      disposal.abort();
      // React StrictMode disposes and then reuses the same kit.
      disposal = new AbortController();
      for (const url of urls.values()) URL.revokeObjectURL(url);
      urls.clear();
      objectUrls.clear();
    },
    setSimulatedDelayMs: (value: number) => {
      delayMs = value;
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
