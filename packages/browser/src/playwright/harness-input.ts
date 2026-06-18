import { expect, type Locator, type Page } from '@playwright/test';
import {
  copyPayloadThroughEvent,
  cutPayloadThroughEvent,
  insertDataThroughHandle,
  pastePayloadThroughEvent,
  readClipboardHtml,
  readClipboardText,
  readClipboardTypes,
  shouldUseSyntheticHtmlPaste,
  toPlainText,
  withExclusiveClipboardAccess,
  writeClipboardHtml,
  writeClipboardText,
} from './clipboard';
import { insertTextThroughHandle } from './dom-text';
import { didPasteApplyText } from './dom-text-actions';
import {
  commitSyntheticCompositionText,
  composeText,
  composeTextDirect,
  enableCompositionKeyEvents,
  startSyntheticComposition,
  updateSyntheticComposition,
} from './ime';
import type { SurfaceTarget } from './surface';
import type { SlateBrowserEditorHarness } from './types';

export const createEditorHarnessClipboard = ({
  getHarness,
  page,
  root,
  surface,
}: {
  getHarness: () => SlateBrowserEditorHarness;
  page: Page;
  root: Locator;
  surface: SurfaceTarget;
}): SlateBrowserEditorHarness['clipboard'] => ({
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
  cutEventPayload: async () => cutPayloadThroughEvent(root),
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

        await new Promise((resolve) => setTimeout(resolve, 20));
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
    slateFragment?: string | null;
    text: string;
  }) => {
    await pastePayloadThroughEvent(root, payload);
  },
  pasteNativeText: async (text: string) => {
    await withExclusiveClipboardAccess(async () => {
      await writeClipboardText(surface, text);
      await root.press('ControlOrMeta+V');
      await page.waitForTimeout(50);
    });
  },
  pasteText: async (text: string) => {
    await withExclusiveClipboardAccess(async () => {
      const harness = getHarness();
      const beforeSelectedText = await harness.get.selectedText();
      const beforeSelection = await harness.selection.get();
      const beforeText = await harness.get.modelText();
      const beforeTraceLength = (await harness.get.kernelTrace()).length;

      await harness.focus();

      try {
        await writeClipboardText(surface, text);
      } catch {
        await insertDataThroughHandle(root, { text });
        return;
      }

      await root.press('ControlOrMeta+V');
      await page.waitForTimeout(50);

      const afterSelection = await harness.selection.get();
      const afterText = await harness.get.modelText();
      const afterTrace = await harness.get.kernelTrace();

      if (
        !(await didPasteApplyText({
          afterSelection,
          afterText,
          afterTrace,
          beforeSelectedText,
          beforeSelection,
          beforeTraceLength,
          beforeText,
          root,
          text,
        }))
      ) {
        await insertTextThroughHandle(root, text);
      }
    });
  },
  pasteHtml: async (html: string, plainText?: string) => {
    await withExclusiveClipboardAccess(async () => {
      const harness = getHarness();
      const beforeSelectedText = await harness.get.selectedText();
      const beforeSelection = await harness.selection.get();
      const beforeText = await harness.get.modelText();
      const beforeTraceLength = (await harness.get.kernelTrace()).length;
      const text = plainText ?? (await toPlainText(surface, html));

      await harness.focus();

      if (await shouldUseSyntheticHtmlPaste(surface)) {
        await pastePayloadThroughEvent(root, { html, text });
        return;
      }

      try {
        await writeClipboardHtml(surface, html, text);
      } catch {
        await insertDataThroughHandle(root, { html, text });
        return;
      }

      await root.press('ControlOrMeta+V');
      await page.waitForTimeout(50);

      const afterSelection = await harness.selection.get();
      const afterText = await harness.get.modelText();
      const afterTrace = await harness.get.kernelTrace();

      if (
        !(await didPasteApplyText({
          afterSelection,
          afterText,
          afterTrace,
          beforeSelectedText,
          beforeSelection,
          beforeTraceLength,
          beforeText,
          root,
          text,
        }))
      ) {
        await pastePayloadThroughEvent(root, { html, text });
      }
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
}): SlateBrowserEditorHarness['ime'] => ({
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
