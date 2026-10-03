import { expect, type Locator, type Page, test } from '@playwright/test';

import {
  clearKernelTraceThroughHandle,
  copyPayloadThroughNativeEvent,
  copyPayloadThroughEvent,
  cutPayloadThroughNativeEvent,
  cutPayloadThroughEvent,
  insertDataThroughHandle,
  pastePayloadThroughEvent,
  readClipboardHtml,
  readClipboardText,
  readClipboardTypes,
  toPlainText,
  withExclusiveClipboardAccess,
  writeClipboardHtml,
  writeClipboardText,
} from './clipboard';
import {
  commitSyntheticCompositionText,
  composeText,
  composeTextDirect,
  enableCompositionKeyEvents,
  startSyntheticComposition,
  updateSyntheticComposition,
} from './ime';
import type { SurfaceTarget } from './surface';
import type {
  BrowserClipboardTransport,
  BrowserEditorHarness,
  BrowserTestOptions,
} from './types';

const CLIPBOARD_TRANSPORTS = new Set<BrowserClipboardTransport>([
  'event',
  'handle',
  'native',
]);

/** Reads the running Playwright project's `use.clipboardTransport`, or undefined outside a test. */
export const readProjectClipboardTransport = ():
  | BrowserClipboardTransport
  | undefined => {
  let info: ReturnType<typeof test.info>;

  try {
    info = test.info();
  } catch {
    return undefined;
  }

  const value = (info.project.use as BrowserTestOptions).clipboardTransport;

  if (value !== undefined && !CLIPBOARD_TRANSPORTS.has(value)) {
    throw new Error(
      `Invalid use.clipboardTransport ${String(value)}: use 'native', 'event' or 'handle'.`
    );
  }

  return value;
};

const pasteThroughTransport = async ({
  getHarness,
  page,
  payload,
  root,
  surface,
  transport,
}: {
  getHarness: () => BrowserEditorHarness;
  page: Page;
  payload: { html?: string; text: string };
  root: Locator;
  surface: SurfaceTarget;
  transport: BrowserClipboardTransport | undefined;
}) => {
  if (!transport) {
    throw new Error(
      "Set use.clipboardTransport ('native', 'event' or 'handle') on this Playwright project before pasting."
    );
  }

  test.info().annotations.push({
    description: transport === 'handle' ? 'handle (stand-in)' : transport,
    type: 'clipboard-transport',
  });

  const harness = getHarness();
  await harness.focus();
  await clearKernelTraceThroughHandle(root);

  // Clipboard inserts commit under the paste tag, and an applied paste changes
  // the document; a traced insert-data command only shows that the kernel
  // planned one, and a handler can still cancel it or only move the selection.
  const pasteCommitVersion = async () => {
    const commit = (await harness.get.lastCommit()) as {
      changedRoots?: unknown[];
      tags?: string[];
      version?: number;
    } | null;

    return commit?.tags?.includes('paste') && commit.changedRoots?.length
      ? (commit.version ?? null)
      : null;
  };
  const before = await pasteCommitVersion();
  // A handler can apply part of a paste and then throw.
  const pageErrors: Error[] = [];
  const onPageError = (error: Error) => pageErrors.push(error);

  page.on('pageerror', onPageError);

  try {
    if (transport === 'handle') {
      await insertDataThroughHandle(root, payload);
    } else if (transport === 'event') {
      await pastePayloadThroughEvent(root, payload);
    } else {
      await (payload.html
        ? writeClipboardHtml(surface, payload.html, payload.text)
        : writeClipboardText(surface, payload.text));
      await page.keyboard.press('ControlOrMeta+V');
    }

    await expect
      .poll(
        async () => {
          const after = await pasteCommitVersion();

          return after !== null && after !== before;
        },
        { message: `The ${transport} paste did not apply`, timeout: 2000 }
      )
      .toBe(true);
  } finally {
    page.off('pageerror', onPageError);
  }

  if (pageErrors.length > 0) {
    throw new Error(`The ${transport} paste threw: ${pageErrors[0].message}`, {
      cause: pageErrors[0],
    });
  }
};

export const createEditorHarnessClipboard = ({
  clipboardTransport,
  getHarness,
  page,
  root,
  surface,
}: {
  clipboardTransport: BrowserClipboardTransport | undefined;
  getHarness: () => BrowserEditorHarness;
  page: Page;
  root: Locator;
  surface: SurfaceTarget;
}): BrowserEditorHarness['clipboard'] => ({
  copy: async () => {
    await withExclusiveClipboardAccess(async () => {
      await getHarness().selection.selectAll();
      await root.press('ControlOrMeta+C');
    });
  },
  readText: async () =>
    withExclusiveClipboardAccess(async () => readClipboardText(surface)),
  readHtml: async () =>
    withExclusiveClipboardAccess(async () => readClipboardHtml(surface)),
  copyEventPayload: async () => copyPayloadThroughEvent(root),
  copyNativeEventPayload: async () =>
    withExclusiveClipboardAccess(async () =>
      copyPayloadThroughNativeEvent(root)
    ),
  cutEventPayload: async () => cutPayloadThroughEvent(root),
  cutNativeEventPayload: async () =>
    withExclusiveClipboardAccess(async () =>
      cutPayloadThroughNativeEvent(root)
    ),
  copyPayload: async () =>
    withExclusiveClipboardAccess(async () => {
      await root.press('ControlOrMeta+C');

      let html: string | null = null;
      let text = '';
      let types: string[] = [];

      for (let attempt = 0; attempt < 5; attempt++) {
        const payload = await Promise.all([
          readClipboardHtml(surface),
          readClipboardText(surface),
          readClipboardTypes(surface),
        ]);
        html = payload[0];
        text = payload[1];
        types = payload[2];

        if (html || text || types.length > 0) {
          break;
        }

        await new Promise((resolve) => {
          setTimeout(resolve, 20);
        });
      }

      if (!html && !text && types.length === 0) {
        throw new Error('Clipboard stayed empty after copy shortcut');
      }

      return {
        html,
        text,
        types,
      };
    }),
  pasteEventPayload: async (payload: {
    html?: string | null;
    fragment?: string | null;
    text: string;
  }) => {
    await pastePayloadThroughEvent(root, payload);
  },
  pasteNativeText: async (text: string) => {
    await withExclusiveClipboardAccess(async () => {
      await writeClipboardText(surface, text);
      await page.keyboard.press('ControlOrMeta+V');
      await page.waitForTimeout(50);
    });
  },
  pasteText: async (text: string) => {
    await withExclusiveClipboardAccess(async () => {
      await pasteThroughTransport({
        getHarness,
        page,
        payload: { text },
        root,
        surface,
        transport: clipboardTransport,
      });
    });
  },
  pasteHtml: async (html: string, plainText?: string) => {
    await withExclusiveClipboardAccess(async () => {
      await pasteThroughTransport({
        getHarness,
        page,
        payload: {
          html,
          text: plainText ?? (await toPlainText(surface, html)),
        },
        root,
        surface,
        transport: clipboardTransport,
      });
    });
  },
  assert: {
    textContains: async (expected: string) => {
      const payload = await getHarness().clipboard.copyPayload();
      expect(payload.text).toContain(expected);
    },
    htmlContains: async (expected: string) => {
      const payload = await getHarness().clipboard.copyPayload();
      expect(payload.html).toContain(expected);
    },
    htmlEquals: async (expected: string) => {
      const payload = await getHarness().clipboard.copyPayload();
      expect(payload.html).toBe(expected);
    },
    types: async (expected: string[]) => {
      const payload = await getHarness().clipboard.copyPayload();
      expect(payload.types).toEqual(expect.arrayContaining(expected));
    },
  },
});

export const createEditorHarnessIme = ({
  page,
  surface,
}: {
  page: Page;
  surface: SurfaceTarget;
}): BrowserEditorHarness['ime'] => ({
  enableKeyEvents: async () => {
    await enableCompositionKeyEvents(surface);
  },
  startSynthetic: async ({ text = '' } = {}) => {
    await enableCompositionKeyEvents(surface);
    await startSyntheticComposition(surface, text);
  },
  updateSynthetic: async ({ text }) => {
    await updateSyntheticComposition(surface, text);
  },
  commitSynthetic: async ({ text }) => {
    await commitSyntheticCompositionText(surface, text);
  },
  compose: async ({
    text,
    steps = [text],
    committedText = text,
    transport,
  }) => {
    await enableCompositionKeyEvents(surface);
    await composeText(page, surface, steps, committedText, { transport });
  },
  composeDirect: async ({ text }) => {
    await composeTextDirect(page, text);
  },
});
