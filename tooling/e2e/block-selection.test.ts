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

test('drags from the editor gutter to select whole blocks', async ({
  page,
}) => {
  const runtimeErrors = recordRuntimeErrors(page);
  const editor = page.locator(
    '[data-plite-editor="true"][contenteditable="true"]'
  );
  const heading = editor.locator('h1').first();
  const blocks = editor.locator('.plite-selectable[data-plite-node-key]');
  const floatingToolbar = page.getByRole('toolbar').filter({
    has: page.getByRole('button', { exact: true, name: 'Ask AI' }),
  });

  try {
    await page.goto('/');
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
              left: rect.left,
              top: rect.top,
              width: rect.width,
            };
          })
          .filter(
            (rect) =>
              rect.top >= headingY - 2 && rect.bottom < window.innerHeight - 20
          )
          .slice(0, 2),
      headingBox?.y ?? 0
    );

    if (!headingBox || visibleBlockBoxes.length < 2) {
      throw new Error('Expected visible block selection geometry');
    }

    const lastBlockBox = visibleBlockBoxes.at(-1)!;

    const start = {
      x: headingBox.x - 20,
      y: headingBox.y + headingBox.height / 2,
    };
    const end = {
      x: lastBlockBox.left + Math.min(80, lastBlockBox.width / 2),
      y: lastBlockBox.bottom - 2,
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
    await page.mouse.move(end.x, end.y, { steps: 16 });

    await expect(page.locator('.plite-selection-area')).toBeVisible();
    await expect
      .poll(() => page.evaluate(() => window.getSelection()?.toString() ?? ''))
      .toBe('');

    await page.mouse.up();

    await expect
      .poll(() => editor.locator('[data-slot="block-selection"]').count())
      .toBeGreaterThanOrEqual(2);
    await expect
      .poll(() => page.evaluate(() => window.getSelection()?.toString() ?? ''))
      .toBe('');
    await expect(floatingToolbar).toHaveCount(0);
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});
