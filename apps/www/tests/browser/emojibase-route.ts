import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';

import type { BrowserContext, Page, Route } from '@playwright/test';

const EMOJIBASE_URL = 'https://cdn.jsdelivr.net/npm/emojibase-data@17.0.0/';
// Playwright loads this file as CommonJS and the typing probe as ESM, so the
// package resolves from the working directory: apps/www or the repository root.
const resolveEmojibaseDir = () => {
  for (const app of ['.', 'apps/www']) {
    try {
      return path.dirname(
        createRequire(path.resolve(app, 'package.json')).resolve(
          'emojibase-data/package.json'
        )
      );
    } catch {
      // Not installed under this directory; try the next one.
    }
  }

  throw new Error('emojibase-data is not installed in apps/www.');
};

const emojibaseDir = resolveEmojibaseDir();

/**
 * Serves the pinned Emojibase CDN files from the installed `emojibase-data`
 * package and aborts every other request that leaves localhost, so emoji
 * cases never touch the network. `allowOtherHosts` lets other hosts through
 * for a remote app. The handle takes Emojibase offline, or holds its
 * responses until the returned release runs.
 */
export const routeEmojibase = async (
  target: BrowserContext | Page,
  { allowOtherHosts = false }: { allowOtherHosts?: boolean } = {}
) => {
  let offline = false;
  let held: Promise<void> | undefined;

  await target.route(
    (url) => !['127.0.0.1', 'localhost'].includes(url.hostname),
    async (route: Route) => {
      const url = route.request().url();

      if (!url.startsWith(EMOJIBASE_URL) && allowOtherHosts) {
        await route.continue();
        return;
      }
      if (!url.startsWith(EMOJIBASE_URL) || offline) {
        await route.abort('internetdisconnected');
        return;
      }

      const file = path.join(emojibaseDir, url.slice(EMOJIBASE_URL.length));

      if (!file.startsWith(`${emojibaseDir}${path.sep}`)) {
        await route.abort('accessdenied');
        return;
      }

      await held;

      if (offline) {
        await route.abort('internetdisconnected');
        return;
      }

      await route.fulfill({
        body: route.request().method() === 'HEAD' ? '' : await readFile(file),
        contentType: 'application/json',
        headers: { etag: `"${path.basename(file)}@17.0.0"` },
      });
    }
  );

  return {
    hold() {
      let release = () => {};

      held = new Promise<void>((resolve) => {
        release = resolve;
      });

      return release;
    },
    setOffline(value: boolean) {
      offline = value;
    },
  };
};
