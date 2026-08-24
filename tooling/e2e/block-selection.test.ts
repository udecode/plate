import { expect, type Page, test } from '@playwright/test';

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
    stop: () => {
      page.off('console', onConsole);
      page.off('pageerror', onPageError);
    },
  };
};

const selectedBlockPaths = (page: Page) =>
  page.locator('[data-slot="block-selection"]').evaluateAll((elements) =>
    elements
      .map((element) =>
        element.closest('[data-plite-path]')?.getAttribute('data-plite-path')
      )
      .filter((key): key is string => Boolean(key))
      .sort()
  );

test('drags from the editor gutter to select whole blocks', async ({
  page,
}) => {
  const runtimeErrors = recordRuntimeErrors(page);
  const editor = page.locator(
    '[data-plite-editor="true"][contenteditable="true"]'
  );
  const heading = editor.locator('h1').first();
  const blocks = editor.locator('.plite-selectable[data-plite-node-key]');
  const marquee = page.locator('[data-slot="block-selection-area"]');
  const floatingToolbar = page.getByRole('toolbar').filter({
    has: page.getByRole('button', { exact: true, name: 'Ask AI' }),
  });

  try {
    await page.goto('/blocks/playground');
    await expect(heading).toBeVisible();
    await heading.scrollIntoViewIfNeeded();

    const headingBox = await heading.boundingBox();
    const visibleBlockBoxes = await blocks.evaluateAll(
      (elements, headingY) =>
        elements
          .map((element) => {
            const rect = element.getBoundingClientRect();

            return {
              bottom: rect.bottom,
              path: element.getAttribute('data-plite-path'),
              left: rect.left,
              top: rect.top,
              width: rect.width,
            };
          })
          .filter(
            (rect) =>
              rect.top >= headingY - 2 && rect.bottom < window.innerHeight - 20
          )
          .slice(0, 3),
      headingBox?.y ?? 0
    );

    if (
      !headingBox ||
      visibleBlockBoxes.length < 3 ||
      visibleBlockBoxes.some(({ path }) => !path)
    ) {
      throw new Error('Expected visible block selection geometry');
    }

    const draggedBlockBoxes = visibleBlockBoxes.slice(0, 2);
    const expectedDraggedPaths = draggedBlockBoxes
      .map(({ path }) => path!)
      .sort();
    const followUpPath = visibleBlockBoxes[2].path!;
    const lastBlockBox = draggedBlockBoxes.at(-1)!;

    const start = {
      x: headingBox.x - 20,
      y: headingBox.y + headingBox.height / 2,
    };
    const end = {
      x: lastBlockBox.left + Math.min(80, lastBlockBox.width / 2),
      y: (lastBlockBox.top + lastBlockBox.bottom) / 2,
    };
    const startArea = await page.evaluate(({ x, y }) => {
      const target = document.elementFromPoint(x, y);

      return {
        selectable: target?.getAttribute('data-plate-selectable'),
        target: target?.className,
      };
    }, start);

    expect(startArea.selectable).toBe('true');

    await page.mouse.move(start.x, start.y);
    await page.mouse.down();
    for (let step = 1; step <= 8; step++) {
      const progress = step / 8;

      await page.mouse.move(
        start.x + (end.x - start.x) * progress,
        start.y + (end.y - start.y) * progress
      );
      await page.waitForTimeout(20);
    }

    await expect
      .poll(() => selectedBlockPaths(page))
      .toEqual(expectedDraggedPaths);
    await expect(marquee).toBeVisible();
    const marqueePaint = await marquee.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      const isTransparent = (color: string) =>
        color === 'transparent' || color === 'rgba(0, 0, 0, 0)';

      return {
        borderPainted:
          style.borderStyle !== 'none' &&
          style.borderWidth !== '0px' &&
          !isTransparent(style.borderColor),
        fillPainted: !isTransparent(style.backgroundColor),
        height: rect.height,
        width: rect.width,
      };
    });

    expect(marqueePaint.width).toBeGreaterThan(0);
    expect(marqueePaint.height).toBeGreaterThan(0);
    expect(marqueePaint.fillPainted).toBe(true);
    expect(marqueePaint.borderPainted).toBe(true);
    await expect
      .poll(() =>
        page.evaluate(() =>
          document.activeElement?.classList.contains('plite-shadow-input')
        )
      )
      .toBe(true);
    await expect
      .poll(() => page.evaluate(() => window.getSelection()?.toString() ?? ''))
      .toBe('');
    await expect(floatingToolbar).toHaveCount(0);

    await page.evaluate(({ x, y }) => {
      document.dispatchEvent(
        new MouseEvent('mouseup', {
          bubbles: true,
          cancelable: true,
          clientX: x,
          clientY: y,
        })
      );
    }, end);

    await expect
      .poll(() => selectedBlockPaths(page))
      .toEqual(expectedDraggedPaths);
    await expect(marquee).toBeHidden();
    await expect
      .poll(() => page.evaluate(() => window.getSelection()?.toString() ?? ''))
      .toBe('');
    await expect
      .poll(() =>
        page.evaluate(() =>
          document.activeElement?.classList.contains('plite-shadow-input')
        )
      )
      .toBe(true);
    await expect(floatingToolbar).toHaveCount(0);

    await page.keyboard.press('ArrowDown');
    await expect.poll(() => selectedBlockPaths(page)).toEqual([followUpPath]);
    await expect
      .poll(() => page.evaluate(() => window.getSelection()?.toString() ?? ''))
      .toBe('');
    runtimeErrors.assertNone();
  } finally {
    await page.mouse.up().catch(() => {});
    runtimeErrors.stop();
  }
});
