import {
  createPliteBrowserEditorHarness,
  recordPliteBrowserRuntimeErrors,
} from '@platejs/browser/playwright';
import { expect, type Locator, type Page, test } from '@playwright/test';

const AI_CASE_ID = 'ai:floating-menu-single-shell';
const LINK_CASE_ID = 'link:floating-toolbar-visible-boundary';
const TABLE_CASE_ID = 'table:floating-toolbar-single-shell';

type PixelImage = {
  data: number[];
  height: number;
  width: number;
};

const afterPaint = (page: Page) =>
  page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      })
  );

const capturePixels = async (page: Page, surface: Locator) => {
  const png = await surface.screenshot({
    animations: 'disabled',
    caret: 'hide',
  });
  const image = await page.evaluate(async (base64): Promise<PixelImage> => {
    const bytes = Uint8Array.from(atob(base64), (value) => value.charCodeAt(0));
    const bitmap = await createImageBitmap(
      new Blob([bytes], { type: 'image/png' })
    );
    const canvas = document.createElement('canvas');
    canvas.height = bitmap.height;
    canvas.width = bitmap.width;
    const context = canvas.getContext('2d');

    if (!context) throw new Error('Unable to decode screenshot pixels');

    context.drawImage(bitmap, 0, 0);

    return {
      data: Array.from(
        context.getImageData(0, 0, bitmap.width, bitmap.height).data
      ),
      height: bitmap.height,
      width: bitmap.width,
    };
  }, png.toString('base64'));

  return image;
};

const changedPixelCount = (left: PixelImage, right: PixelImage) => {
  expect(left.width).toBe(right.width);
  expect(left.height).toBe(right.height);

  let count = 0;

  for (let index = 0; index < left.data.length; index += 4) {
    const delta = Math.max(
      Math.abs(left.data[index]! - right.data[index]!),
      Math.abs(left.data[index + 1]! - right.data[index + 1]!),
      Math.abs(left.data[index + 2]! - right.data[index + 2]!)
    );

    if (delta > 16) count += 1;
  }

  return count;
};

const hasPaintedShadow = (boxShadow: string) =>
  (boxShadow.match(/-?\d+(?:\.\d+)?px/g) ?? []).some(
    (value) => Number.parseFloat(value) !== 0
  );

const expectSurfacePaint = async (
  page: Page,
  surface: Locator,
  expectedVisible: boolean
) => {
  await surface.evaluate((element) => {
    element.setAttribute('data-shell-pixel-control', 'target');
  });
  await afterPaint(page);

  const actual = await capturePixels(page, surface);
  const style = await page.evaluate(() => {
    const control = document.createElement('style');
    control.id = 'shell-pixel-control';
    document.head.append(control);

    return control.id;
  });

  expect(style).toBeTruthy();

  const setControl = async (state: 'negative' | 'positive') => {
    await page.evaluate((nextState) => {
      const control = document.querySelector<HTMLStyleElement>(
        '#shell-pixel-control'
      );

      if (!control) throw new Error('Missing shell pixel control');

      control.textContent =
        nextState === 'positive'
          ? '[data-shell-pixel-control="target"] { background: rgb(255 0 255) !important; border-color: rgb(0 255 0) !important; box-shadow: inset 0 0 0 4px rgb(0 0 255) !important; transition: none !important; --tw-ring-shadow: 0 0 #0000 !important; } [data-shell-pixel-control="target"]::after { position: absolute; z-index: 2147483647; inset: 0; background: rgb(255 0 255); content: ""; }'
          : '[data-shell-pixel-control="target"] { background: transparent !important; border-color: transparent !important; box-shadow: none !important; outline: 0 !important; transition: none !important; --tw-ring-shadow: 0 0 #0000 !important; } [data-shell-pixel-control="target"]::after { display: none !important; content: none !important; }';
    }, state);
    await afterPaint(page);
    await page.waitForTimeout(150);
  };

  await setControl('negative');
  const negative = await capturePixels(page, surface);
  const negativeRepeat = await capturePixels(page, surface);
  await setControl('positive');
  const positive = await capturePixels(page, surface);

  const threshold = Math.max(
    100,
    Math.floor(actual.width * actual.height * 0.015)
  );
  const actualPaint = changedPixelCount(actual, negative);
  const positiveControl = changedPixelCount(positive, negative);
  const negativeControl = changedPixelCount(negativeRepeat, negative);

  expect(positiveControl).toBeGreaterThan(threshold);
  expect(negativeControl).toBeLessThanOrEqual(8);

  if (expectedVisible) {
    expect(actualPaint).toBeGreaterThan(threshold);
  } else {
    expect(actualPaint).toBeLessThanOrEqual(8);
  }

  await page.evaluate(() => {
    document.querySelector('#shell-pixel-control')?.remove();
    document
      .querySelector('[data-shell-pixel-control="target"]')
      ?.removeAttribute('data-shell-pixel-control');
  });
};

test(LINK_CASE_ID, async ({ page }, testInfo) => {
  expect(testInfo.retry).toBe(0);

  const runtimeErrors = recordPliteBrowserRuntimeErrors(page);

  try {
    await page.goto('/', { waitUntil: 'commit' });

    const editor = page
      .locator('[data-plite-editor="true"][contenteditable="true"]')
      .first();
    const link = editor.locator('a', { hasText: 'slash command' });
    const editLink = page.getByRole('button', { name: 'Edit link' });

    await link.click();
    await expect(editLink).toBeVisible();

    const surface = editLink.locator(
      'xpath=ancestor::div[contains(@class, "cn-popover-content")]'
    );
    const appearance = await surface.evaluate((element) => {
      const style = getComputedStyle(element);

      return {
        backgroundColor: style.backgroundColor,
        borderWidth: style.borderTopWidth,
        boxShadow: style.boxShadow,
      };
    });

    expect(appearance.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(
      appearance.borderWidth !== '0px' || appearance.boxShadow !== 'none'
    ).toBe(true);
    await expectSurfacePaint(page, surface, true);
    await expect(editor).toBeFocused();

    await editLink.click();
    const inputSurface = page.locator('.cn-popover-content:visible');
    const urlInput = inputSurface.getByPlaceholder('Paste link');
    const textInput = inputSurface.getByPlaceholder('Text to display');
    const separator = inputSurface.locator('[data-slot="separator"]');

    await expect(urlInput).toBeFocused();
    await expect(textInput).toBeVisible();
    expect(
      hasPaintedShadow(
        await textInput.evaluate(
          (element) => getComputedStyle(element).boxShadow
        )
      )
    ).toBe(false);
    await expectSurfacePaint(page, urlInput, false);
    await expectSurfacePaint(page, textInput, false);
    await expectSurfacePaint(page, separator, true);

    const surfaceBox = await inputSurface.boundingBox();
    const separatorBox = await separator.boundingBox();

    expect(surfaceBox).not.toBeNull();
    expect(separatorBox).not.toBeNull();
    expect(Math.abs(separatorBox!.x - surfaceBox!.x)).toBeLessThanOrEqual(1);
    expect(
      Math.abs(separatorBox!.width - surfaceBox!.width)
    ).toBeLessThanOrEqual(2);

    await page.keyboard.press('Escape');
    await expect(editLink).toBeVisible();
    await expect(editor).toBeFocused();
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test(TABLE_CASE_ID, async ({ page }, testInfo) => {
  expect(testInfo.retry).toBe(0);

  const runtimeErrors = recordPliteBrowserRuntimeErrors(page);

  try {
    await page.goto('/blocks/table-demo', { waitUntil: 'commit' });

    const editor = page
      .locator('[data-plite-editor="true"][contenteditable="true"]')
      .first();
    const editorHarness = createPliteBrowserEditorHarness(
      page,
      TABLE_CASE_ID,
      editor
    );
    const cells = editor.locator(
      'table td[data-plite-node-key], table th[data-plite-node-key]'
    );
    const cellBorders = page.getByRole('button', { name: 'Cell borders' });

    await editorHarness.ready({ editor: 'visible', text: 'Plugin' });
    await expect(cells).toHaveCount(16);

    const start = await cells.nth(0).boundingBox();
    const end = await cells.nth(4).boundingBox();

    expect(start).not.toBeNull();
    expect(end).not.toBeNull();

    await page.mouse.move(start!.x + 30, start!.y + start!.height / 2);
    await page.mouse.down();

    for (let step = 1; step <= 8; step++) {
      const progress = step / 8;

      await page.mouse.move(
        start!.x + 30 + (end!.x + 30 - (start!.x + 30)) * progress,
        start!.y +
          start!.height / 2 +
          (end!.y + end!.height / 2 - (start!.y + start!.height / 2)) * progress
      );
      await page.waitForTimeout(40);
    }
    await page.waitForTimeout(250);
    await page.mouse.up();
    await editorHarness.focus();

    await expect(cellBorders).toBeVisible();

    const surface = cellBorders.locator(
      'xpath=ancestor::div[contains(@class, "cn-popover-content")]'
    );
    const innerToolbar = cellBorders.locator(
      'xpath=ancestor::div[@role="toolbar"]'
    );
    const appearance = await surface.evaluate((element) => {
      const style = getComputedStyle(element);

      return {
        backgroundColor: style.backgroundColor,
        boxShadow: style.boxShadow,
      };
    });

    await expect(innerToolbar).toBeVisible();
    await expectSurfacePaint(page, surface, false);
    expect(appearance.backgroundColor).toBe('rgba(0, 0, 0, 0)');
    expect(hasPaintedShadow(appearance.boxShadow)).toBe(false);
    await expect(editor).toBeFocused();

    await cellBorders.click();
    await expect(page.getByRole('menu')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(editor).toBeFocused();
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test(AI_CASE_ID, async ({ page }, testInfo) => {
  expect(testInfo.retry).toBe(0);

  const runtimeErrors = recordPliteBrowserRuntimeErrors(page);

  try {
    await page.goto('/', { waitUntil: 'commit' });

    const editor = page
      .locator('[data-plite-editor="true"][contenteditable="true"]')
      .first();
    const paragraph = editor
      .getByText(/Experience a modern rich-text editor/)
      .first();

    await expect(paragraph).toBeVisible();
    await paragraph.dblclick();
    const askAI = page.getByRole('button', { name: 'Ask AI' });
    await expect(askAI).toBeVisible();
    await askAI.click();

    const input = page.getByPlaceholder('Ask AI anything...');
    await expect(input).toBeFocused();

    const surface = input.locator(
      'xpath=ancestor::div[contains(@class, "cn-popover-content")]'
    );
    const appearance = await surface.evaluate((element) => {
      const style = getComputedStyle(element);

      return {
        backgroundColor: style.backgroundColor,
        boxShadow: style.boxShadow,
      };
    });

    await expectSurfacePaint(page, surface, false);
    expect(appearance.backgroundColor).toBe('rgba(0, 0, 0, 0)');
    expect(hasPaintedShadow(appearance.boxShadow)).toBe(false);

    await page.keyboard.press('Escape');
    await expect(editor).toBeFocused();
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});
