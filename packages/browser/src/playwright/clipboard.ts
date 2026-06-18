import { unlinkSync, writeFileSync } from 'node:fs';

import type { Locator } from '@playwright/test';

import { SLATE_BROWSER_HANDLE_KEY } from './constants';
import type { SurfaceTarget } from './surface';
import type { ClipboardPayloadSnapshot } from './types';

const CLIPBOARD_LOCK_PATH = `${process.cwd()}/.slate-browser-clipboard.lock`;

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

/** Run a callback while holding the shared clipboard access lock. */
export const withExclusiveClipboardAccess = async <T>(
  work: () => Promise<T> | T
) => {
  let acquired = false;

  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      writeFileSync(CLIPBOARD_LOCK_PATH, String(process.pid), {
        flag: 'wx',
      });
      acquired = true;
      break;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
        throw error;
      }

      await sleep(50);
    }
  }

  if (!acquired) {
    throw new Error('Timed out waiting for exclusive clipboard access');
  }

  try {
    return await work();
  } finally {
    try {
      unlinkSync(CLIPBOARD_LOCK_PATH);
    } catch {
      // Ignore lock cleanup races on process shutdown.
    }
  }
};

export const writeClipboardText = async (
  surface: SurfaceTarget,
  text: string
) => {
  await surface.evaluate(async (value) => {
    await navigator.clipboard.writeText(value);
  }, text);
};

export const writeClipboardHtml = async (
  surface: SurfaceTarget,
  html: string,
  text: string
) => {
  await surface.evaluate(
    async ({ html: nextHtml, text: nextText }) => {
      const item = new ClipboardItem({
        'text/html': new Blob([nextHtml], { type: 'text/html' }),
        'text/plain': new Blob([nextText], { type: 'text/plain' }),
      });

      await navigator.clipboard.write([item]);
    },
    { html, text }
  );
};

export const readClipboardText = async (surface: SurfaceTarget) =>
  surface.evaluate(async () => navigator.clipboard.readText());

export const readClipboardHtml = async (surface: SurfaceTarget) =>
  surface.evaluate(async () => {
    const contents = await navigator.clipboard.read();

    for (const item of contents) {
      if (item.types.includes('text/html')) {
        const blob = await item.getType('text/html');
        return blob.text();
      }
    }

    return null;
  });

export const readClipboardTypes = async (surface: SurfaceTarget) =>
  surface.evaluate(async () => {
    const contents = await navigator.clipboard.read();
    const types = new Set<string>();

    for (const item of contents) {
      item.types.forEach((type) => {
        types.add(type);
      });
    }

    return Array.from(types);
  });

export const toPlainText = async (surface: SurfaceTarget, html: string) =>
  surface.evaluate((markup) => {
    const container = document.createElement('div');
    container.innerHTML = markup;
    return container.textContent ?? '';
  }, html);

export const shouldUseSyntheticHtmlPaste = async (surface: SurfaceTarget) =>
  surface.evaluate(() => {
    const userAgent = navigator.userAgent;

    return (
      userAgent.includes('AppleWebKit') &&
      !['Chrome', 'Chromium', 'Edg/'].some((token) => userAgent.includes(token))
    );
  });

export const copyPayloadThroughEvent = async (
  root: Locator
): Promise<ClipboardPayloadSnapshot> =>
  root.evaluate((element: HTMLElement) => {
    const data = new DataTransfer();
    const event = new ClipboardEvent('copy', {
      bubbles: true,
      cancelable: true,
    });

    Object.defineProperty(event, 'clipboardData', {
      value: data,
    });

    element.dispatchEvent(event);

    return {
      html: data.getData('text/html') || null,
      slateFragment: data.getData('application/x-slate-fragment') || null,
      text: data.getData('text/plain'),
      types: Array.from(data.types),
    };
  });

export const cutPayloadThroughEvent = async (
  root: Locator
): Promise<ClipboardPayloadSnapshot> =>
  root.evaluate((element: HTMLElement) => {
    const data = new DataTransfer();
    const event = new ClipboardEvent('cut', {
      bubbles: true,
      cancelable: true,
    });

    Object.defineProperty(event, 'clipboardData', {
      value: data,
    });

    element.dispatchEvent(event);

    return {
      html: data.getData('text/html') || null,
      slateFragment: data.getData('application/x-slate-fragment') || null,
      text: data.getData('text/plain'),
      types: Array.from(data.types),
    };
  });

export const pastePayloadThroughEvent = async (
  root: Locator,
  payload: { html?: string | null; slateFragment?: string | null; text: string }
) =>
  root.evaluate(
    async (
      element: HTMLElement,
      nextPayload: {
        html?: string | null;
        key: string;
        slateFragment?: string | null;
        text: string;
      }
    ) => {
      const beforeText = element.textContent;
      const handle = (element as Record<string, any>)[nextPayload.key];
      const beforeModelText =
        typeof handle?.getText === 'function' ? handle.getText() : null;
      const data = new DataTransfer();

      if (nextPayload.html) {
        data.setData('text/html', nextPayload.html);
      }
      if (nextPayload.slateFragment) {
        data.setData('application/x-slate-fragment', nextPayload.slateFragment);
      }
      data.setData('text/plain', nextPayload.text);

      const event = new ClipboardEvent('paste', {
        bubbles: true,
        cancelable: true,
      });

      Object.defineProperty(event, 'clipboardData', {
        value: data,
      });

      const wasNotCanceled = element.dispatchEvent(event);
      await new Promise((resolve) => setTimeout(resolve, 0));

      if (
        wasNotCanceled &&
        !event.defaultPrevented &&
        element.textContent === beforeText &&
        (beforeModelText == null ||
          typeof handle?.getText !== 'function' ||
          handle.getText() === beforeModelText)
      ) {
        if (!handle?.insertData) {
          throw new Error('This editor surface does not expose insertData');
        }

        handle.insertData({
          html: nextPayload.html ?? undefined,
          slateFragment: nextPayload.slateFragment ?? undefined,
          text: nextPayload.text,
        });
      }
    },
    { ...payload, key: SLATE_BROWSER_HANDLE_KEY }
  );

export const insertDataThroughHandle = async (
  root: Locator,
  payload: { html?: string | null; slateFragment?: string | null; text: string }
) =>
  root.evaluate(
    (
      element: HTMLElement,
      nextPayload: {
        html?: string | null;
        key: string;
        slateFragment?: string | null;
        text: string;
      }
    ) => {
      const handle = (element as Record<string, any>)[nextPayload.key];

      if (!handle?.insertData) {
        throw new Error('This editor surface does not expose insertData');
      }

      handle.insertData({
        html: nextPayload.html ?? undefined,
        slateFragment: nextPayload.slateFragment ?? undefined,
        text: nextPayload.text,
      });
    },
    { ...payload, key: SLATE_BROWSER_HANDLE_KEY }
  );
