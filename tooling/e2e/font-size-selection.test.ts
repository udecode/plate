import { createPliteBrowserEditorHarness } from '@platejs/browser/playwright';
import { expect, type Locator, type Page, test } from '@playwright/test';

const recordRuntimeErrors = (page: Page) => {
  const errors: string[] = [];
  const onConsole = (message: { text: () => string; type: () => string }) => {
    if (message.type() === 'error') errors.push(message.text());
  };
  const onPageError = (error: Error) => {
    errors.push(error.stack ?? error.message);
  };

  page.on('console', onConsole);
  page.on('pageerror', onPageError);

  return {
    assertNone: () => expect(errors).toEqual([]),
    reset: () => {
      errors.length = 0;
    },
    stop: () => {
      page.off('console', onConsole);
      page.off('pageerror', onPageError);
    },
  };
};

const readSelectionGeometry = (target: Locator, expectedText: string) =>
  target.evaluate((element, text) => {
    const document = element.ownerDocument;
    const editor = document.querySelector(
      '[data-plite-editor="true"][contenteditable="true"], [data-slate-editor="true"][contenteditable="true"]'
    );
    const selection = document.defaultView?.getSelection();
    const textHost = Array.from(
      document.querySelectorAll<HTMLElement>(
        '[data-plite-node="element"], [data-plite-node="text"], [data-slate-node="element"], [data-slate-node="text"]'
      )
    ).find((innerElement) => innerElement.textContent === text);
    const stringHosts = textHost
      ? Array.from(
          textHost.querySelectorAll<HTMLElement>(
            '[data-plite-string], [data-slate-string]'
          )
        )
      : [];

    if (!selection || selection.rangeCount !== 1 || stringHosts.length === 0) {
      return null;
    }

    const selectionRect = selection.getRangeAt(0).getBoundingClientRect();
    const textRange = document.createRange();
    const firstString = stringHosts[0];
    const lastString = stringHosts.at(-1)!;

    textRange.setStart(firstString, 0);
    textRange.setEnd(lastString, lastString.childNodes.length);

    const textRect = textRange.getBoundingClientRect();

    return {
      activeInEditor: !!editor && editor.contains(document.activeElement),
      fontSizes: Array.from(
        new Set(
          stringHosts.map(
            (innerElement2) => getComputedStyle(innerElement2).fontSize
          )
        )
      ),
      selection: selection.toString(),
      selectionWidth: selectionRect.width,
      textHeight: textRect.height,
      textLeft: textRect.left,
      textTop: textRect.top,
      textWidth: textRect.width,
    };
  }, expectedText);

const readPaintedSelectionWidth = async (
  page: Page,
  selectedBlock: Locator
) => {
  const selectedScreenshot = await selectedBlock.screenshot({
    caret: 'initial',
  });

  return page.evaluate(async (selectedBase64) => {
    const decode = async (base64: string) => {
      const bytes = Uint8Array.from(atob(base64), (character) =>
        character.charCodeAt(0)
      );

      return createImageBitmap(new Blob([bytes]));
    };
    const selectedBitmap = await decode(selectedBase64);

    const canvas = document.createElement('canvas');

    canvas.width = selectedBitmap.width;
    canvas.height = selectedBitmap.height;

    const context = canvas.getContext('2d');

    if (!context) throw new Error('Expected screenshot canvas context');

    context.drawImage(selectedBitmap, 0, 0);
    const selectedPixels = context.getImageData(
      0,
      0,
      selectedBitmap.width,
      canvas.height
    ).data;

    let firstX = Number.POSITIVE_INFINITY;
    let lastX = Number.NEGATIVE_INFINITY;

    for (let y = 0; y < canvas.height; y += 1) {
      for (let x = 0; x < selectedBitmap.width; x += 1) {
        const offset = (y * selectedBitmap.width + x) * 4;
        const red = selectedPixels[offset] ?? 0;
        const green = selectedPixels[offset + 1] ?? 0;
        const blue = selectedPixels[offset + 2] ?? 0;

        if (blue > red + 10 && blue > green + 5) {
          firstX = Math.min(firstX, x);
          lastX = Math.max(lastX, x);
        }
      }
    }

    return Number.isFinite(firstX)
      ? (lastX - firstX + 1) / devicePixelRatio
      : 0;
  }, selectedScreenshot.toString('base64'));
};

test('font-size command refreshes expanded selection paint (#5091)', async ({
  page,
}) => {
  const useHomepage = process.env.PLATE_5091_HOMEPAGE === '1';
  const expectedSelection =
    'Edit existing text (improve, fix grammar, change tone)';

  await page.goto(useHomepage ? '/' : '/blocks/playground');
  const surface = useHomepage
    ? page.frameLocator('iframe[src*="/view/editor-ai"]')
    : page;
  const editor = surface.locator(
    '[data-plite-editor="true"][contenteditable="true"], [data-slate-editor="true"][contenteditable="true"]'
  );
  const target = surface.getByText(expectedSelection, { exact: true });
  const selectedBlock = target.locator(
    'xpath=ancestor::*[@data-plite-node="element" or @data-slate-node="element"][1]'
  );
  const fontSizeInput = surface.locator(
    'input[data-plate-focus="true"][value="16"]'
  );

  await expect(editor).toHaveCount(1);
  await expect(target).toBeVisible();
  await page.waitForLoadState('networkidle');

  const runtimeErrors = recordRuntimeErrors(page);

  try {
    await target.scrollIntoViewIfNeeded();
    expect(await readPaintedSelectionWidth(page, selectedBlock)).toBe(0);
    const browserEditor = createPliteBrowserEditorHarness(
      page,
      'playground',
      editor
    );
    await browserEditor.selection.dragTextRange({
      endAffinity: 'after',
      endOffset: expectedSelection.length,
      settleMs: 25,
      startOffset: 0,
      steps: 24,
      text: expectedSelection,
    });
    await expect(
      editor.locator('[data-plite-view-selection="true"]')
    ).toHaveCount(0);
    await expect
      .poll(() => readSelectionGeometry(target, expectedSelection))
      .toMatchObject({
        activeInEditor: true,
        fontSizes: ['16px'],
        selection: expectedSelection,
      });
    runtimeErrors.reset();

    const before = await readSelectionGeometry(target, expectedSelection);

    if (!before) throw new Error('Expected initial selection geometry');

    await expect
      .poll(
        async () =>
          Math.abs(
            (await readPaintedSelectionWidth(page, selectedBlock)) -
              before.textWidth
          ),
        { timeout: 2000 }
      )
      .toBeLessThan(3);

    await fontSizeInput.click();
    await surface.getByRole('button', { exact: true, name: '10' }).click();

    await expect
      .poll(() => readSelectionGeometry(target, expectedSelection))
      .toMatchObject({
        activeInEditor: true,
        fontSizes: ['10px'],
        selection: expectedSelection,
      });

    const after = await readSelectionGeometry(target, expectedSelection);

    if (!after) throw new Error('Expected resized selection geometry');

    expect(after.textWidth).toBeLessThan(before.textWidth * 0.8);
    expect(Math.abs(after.selectionWidth - after.textWidth)).toBeLessThan(1);
    await expect(
      editor.locator('[data-plite-view-selection="true"]')
    ).toHaveCount(0);
    // The unfixed cursor overlay remains stale beyond this window.
    await page.waitForTimeout(200);

    await expect
      .poll(
        async () =>
          Math.abs(
            (await readPaintedSelectionWidth(page, selectedBlock)) -
              after.textWidth
          ),
        { timeout: 2000 }
      )
      .toBeLessThan(3);
    await expect
      .poll(() => readSelectionGeometry(target, expectedSelection))
      .toMatchObject({
        fontSizes: ['10px'],
        selection: expectedSelection,
      });
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});
