import {
  createPliteBrowserEditorHarness,
  recordPliteBrowserRuntimeErrors,
} from '@platejs/test/playwright';
import { expect, type Page, test } from '@playwright/test';

const ROUTE = '/blocks/code-block-codemirror-demo';
const CONTROL = 'code-block-selection-control';
const afterPaint = (page: Page) =>
  page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      })
  );

async function capture(
  page: Page,
  clip: { x: number; y: number; width: number; height: number }
) {
  const png = await page.screenshot({
    clip,
    caret: 'hide',
    animations: 'disabled',
  });
  const pixels = await page.evaluate(async (base64) => {
    const bytes = Uint8Array.from(atob(base64), (value) => value.charCodeAt(0));
    const bitmap = await createImageBitmap(
      new Blob([bytes], { type: 'image/png' })
    );
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const context = canvas.getContext('2d')!;
    context.drawImage(bitmap, 0, 0);
    return Array.from(
      context.getImageData(0, 0, bitmap.width, bitmap.height).data
    );
  }, png.toString('base64'));
  return { png, pixels };
}

function difference(a: number[], b: number[]) {
  expect(a.length).toBe(b.length);
  let changed = 0;
  for (let index = 0; index < a.length; index += 4) {
    if (
      Math.max(
        ...[0, 1, 2].map((channel) =>
          Math.abs(a[index + channel] - b[index + channel])
        )
      ) > 12
    ) {
      changed += 1;
    }
  }
  return changed;
}

for (const backward of [false, true]) {
  test(`code-block: paints ${backward ? 'backward' : 'forward'} cross-boundary selection once`, async ({
    page,
  }, info) => {
    expect(info.retry).toBe(0);
    const errors = recordPliteBrowserRuntimeErrors(page);
    try {
      await page.goto(ROUTE, { waitUntil: 'commit' });
      const root = page
        .locator('.plite-editor[contenteditable="true"]')
        .first();
      const editor = createPliteBrowserEditorHarness(
        page,
        'code-block:selection-paint',
        root
      );
      await editor.ready({ editor: 'visible', text: 'Huge Code Block' });
      const input = page.locator('[data-code-block-codemirror-input]');
      const host = page.locator('[data-code-block-codemirror]');
      const original = await editor.get.modelBlockText(2);
      const prose = await editor.get.modelBlockText(1);
      await editor.selection.collapse({ path: [2, 0], offset: 0 });
      await editor.focus();
      const start = { path: [1, 0], offset: prose!.length - 4 };
      const end = { path: [2, 0], offset: 5 };
      const selection = backward
        ? { anchor: end, focus: start }
        : { anchor: start, focus: end };
      await editor.selection.select(selection);
      await editor.assert.selection(selection);
      await afterPaint(page);
      const selectionRect = await host
        .locator('.cm-line')
        .first()
        .evaluate((line) => {
          const walker = document.createTreeWalker(line, NodeFilter.SHOW_TEXT);
          const text = walker.nextNode()!;
          const range = document.createRange();
          range.setStart(text, 0);
          range.setEnd(text, 5);
          const rect = range.getBoundingClientRect();
          return {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
          };
        });
      // The top two rows sample background, outside glyph ink, using the same clip for every control.
      const clip = {
        x: Math.ceil(selectionRect.x) + 1,
        y: Math.ceil(selectionRect.y),
        width: Math.floor(selectionRect.width) - 2,
        height: 2,
      };
      const setControl = async (layerCount: number | null) => {
        await page.evaluate(
          ({ id, rect, layers }) => {
            document
              .querySelectorAll(`[data-${id}]`)
              .forEach((element) => element.remove());
            if (layers === null) return;
            const style = document.createElement('style');
            style.setAttribute(`data-${id}`, '');
            style.textContent =
              '[data-code-block-model-selection] { background-color: transparent !important; }';
            document.head.append(style);
            for (let index = 0; index < layers; index++) {
              const overlay = document.createElement('div');
              overlay.setAttribute(`data-${id}`, '');
              Object.assign(overlay.style, {
                position: 'fixed',
                pointerEvents: 'none',
                zIndex: '99999',
                left: `${rect.x}px`,
                top: `${rect.y}px`,
                width: `${rect.width}px`,
                height: `${rect.height}px`,
                background: 'color-mix(in srgb, var(--brand) 25%, transparent)',
              });
              document.body.append(overlay);
            }
          },
          { id: CONTROL, rect: selectionRect, layers: layerCount }
        );
        await afterPaint(page);
      };
      const actual = await capture(page, clip);
      await setControl(1);
      const single = await capture(page, clip);
      await setControl(0);
      const absent = await capture(page, clip);
      const absentAgain = await capture(page, clip);
      await setControl(2);
      const duplicate = await capture(page, clip);
      await setControl(null);
      for (const [name, image] of Object.entries({
        actual,
        single,
        absent,
        duplicate,
      })) {
        await info.attach(`selection-${name}`, {
          body: image.png,
          contentType: 'image/png',
        });
      }
      const receipt = {
        positive: difference(single.pixels, absent.pixels),
        negative: difference(absent.pixels, absentAgain.pixels),
        duplicate: difference(duplicate.pixels, single.pixels),
        actual: difference(actual.pixels, single.pixels),
      };
      await info.attach('pixel-classification', {
        body: JSON.stringify(receipt),
        contentType: 'application/json',
      });
      expect(receipt.positive, 'positive-control: pass').toBeGreaterThan(50);
      expect(receipt.negative, 'negative-control: pass').toBeLessThanOrEqual(2);
      expect(receipt.duplicate, 'duplicate-control: pass').toBeGreaterThan(50);
      expect(
        receipt.actual,
        'model intersection matches one painted layer'
      ).toBeLessThanOrEqual(2);
      await editor.assert.selection(selection);
      expect(
        await input.evaluate((element) =>
          element.contains(window.getSelection()?.focusNode ?? null)
        )
      ).toBe(false);
      await editor.selection.collapse({ path: [2, 0], offset: 5 });
      await editor.focus();
      await expect(
        host.locator('[data-code-block-model-selection]')
      ).toHaveCount(0);
      await expect(input).toBeFocused();
      await page.keyboard.insertText('x');
      await expect
        .poll(() => editor.get.modelBlockText(2))
        .toBe(`${original!.slice(0, 5)}x${original!.slice(5)}`);
      errors.assertNone();
    } finally {
      errors.stop();
    }
  });
}
