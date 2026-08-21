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
    ).find((element) => element.textContent === text);
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
          stringHosts.map((element) => getComputedStyle(element).fontSize)
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
  const selectedScreenshot = await selectedBlock.screenshot();
  const baselineId = 'plate-5091-selection-baseline';

  await selectedBlock.evaluate((element, id) => {
    const clone = element.cloneNode(true) as HTMLElement;
    const sourceElements = [
      element,
      ...element.querySelectorAll<HTMLElement>('*'),
    ];
    const cloneElements = [clone, ...clone.querySelectorAll<HTMLElement>('*')];

    sourceElements.forEach((source, index) => {
      const target = cloneElements[index];

      if (!target) return;
      const style = getComputedStyle(source);

      for (const property of Array.from(style)) {
        target.style.setProperty(
          property,
          style.getPropertyValue(property),
          style.getPropertyPriority(property)
        );
      }
    });

    const bounds = element.getBoundingClientRect();

    clone.dataset.plate5091Baseline = id;
    clone.style.height = `${bounds.height}px`;
    clone.style.left = '0';
    clone.style.margin = '0';
    clone.style.pointerEvents = 'none';
    clone.style.position = 'absolute';
    clone.style.top = `${document.documentElement.scrollHeight + 100}px`;
    clone.style.width = `${bounds.width}px`;
    document.body.append(clone);
  }, baselineId);

  const baseline = page.locator(`[data-plate5091-baseline="${baselineId}"]`);
  const baselineScreenshot = await baseline.screenshot();

  await baseline.evaluate((element) => element.remove());

  return page.evaluate(
    async ([selectedBase64, baselineBase64]) => {
      const decode = async (base64: string) => {
        const bytes = Uint8Array.from(atob(base64), (character) =>
          character.charCodeAt(0)
        );

        return createImageBitmap(new Blob([bytes]));
      };
      const [selectedBitmap, baselineBitmap] = await Promise.all([
        decode(selectedBase64),
        decode(baselineBase64),
      ]);

      if (selectedBitmap.width !== baselineBitmap.width) {
        throw new Error(
          `Expected matching selected and baseline screenshots: ${selectedBitmap.width}x${selectedBitmap.height} vs ${baselineBitmap.width}x${baselineBitmap.height}`
        );
      }

      const canvas = document.createElement('canvas');

      canvas.width = selectedBitmap.width;
      canvas.height = Math.min(selectedBitmap.height, baselineBitmap.height);

      const context = canvas.getContext('2d');

      if (!context) throw new Error('Expected screenshot canvas context');

      context.drawImage(selectedBitmap, 0, 0);
      const selectedPixels = context.getImageData(
        0,
        0,
        selectedBitmap.width,
        canvas.height
      ).data;

      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(baselineBitmap, 0, 0);
      const baselinePixels = context.getImageData(
        0,
        0,
        baselineBitmap.width,
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
          const difference =
            Math.abs(red - (baselinePixels[offset] ?? 0)) +
            Math.abs(green - (baselinePixels[offset + 1] ?? 0)) +
            Math.abs(blue - (baselinePixels[offset + 2] ?? 0));

          if (difference > 30 && blue > red + 10 && blue > green + 5) {
            firstX = Math.min(firstX, x);
            lastX = Math.max(lastX, x);
          }
        }
      }

      return Number.isFinite(firstX)
        ? (lastX - firstX + 1) / devicePixelRatio
        : 0;
    },
    [
      selectedScreenshot.toString('base64'),
      baselineScreenshot.toString('base64'),
    ] as const
  );
};

test('font-size command refreshes expanded native selection geometry (#5091)', async ({
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
  const floatingToolbar = surface.getByRole('toolbar').filter({
    has: surface.getByRole('button', { exact: true, name: 'Ask AI' }),
  });

  await expect(editor).toHaveCount(1);
  await expect(target).toBeVisible();
  await page.waitForLoadState('networkidle');

  const runtimeErrors = recordRuntimeErrors(page);

  try {
    await target.scrollIntoViewIfNeeded();

    const targetBox = await target.boundingBox();

    if (!targetBox) throw new Error('Expected visible target text geometry');

    const y = targetBox.y + targetBox.height / 2;

    await page.mouse.move(targetBox.x + 1, y);
    await page.mouse.down();
    await page.mouse.move(targetBox.x + targetBox.width - 1, y, { steps: 12 });
    await page.mouse.up();

    await expect(floatingToolbar).toBeVisible();
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

    const beforePaintedSelectionWidth = await readPaintedSelectionWidth(
      page,
      selectedBlock
    );

    expect(
      Math.abs(beforePaintedSelectionWidth - before.textWidth)
    ).toBeLessThan(3);

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
