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

const getEditor = (page: Page) =>
  page.locator('[data-plite-editor="true"][contenteditable="true"]');

const readDOMSelection = (page: Page) =>
  page.evaluate(() => {
    const selection = document.getSelection();
    const anchorNode = selection?.anchorNode;
    const anchorElement =
      anchorNode instanceof Element ? anchorNode : anchorNode?.parentElement;
    const editor = document.querySelector(
      '[data-plite-editor="true"][contenteditable="true"]'
    );

    return {
      activeInEditor: !!editor && editor.contains(document.activeElement),
      bold: !!anchorElement?.closest('strong'),
      collapsed: selection?.isCollapsed ?? true,
      insideEditor: !!anchorNode && !!editor?.contains(anchorNode),
      text: selection?.toString() ?? '',
    };
  });

test('floating Bold applies the mark without losing the selection', async ({
  page,
}) => {
  const runtimeErrors = recordRuntimeErrors(page);
  const editor = getEditor(page);

  try {
    await page.goto('/blocks/playground');
    await expect(editor).toHaveCount(1);

    const target = page.getByText(
      'Experience a modern rich-text editor built with',
      { exact: true }
    );
    const targetBox = await target.boundingBox();

    if (!targetBox) throw new Error('Expected visible playground intro text');

    const y = targetBox.y + targetBox.height / 2;

    await page.mouse.move(targetBox.x + 2, y);
    await page.mouse.down();
    await page.mouse.move(targetBox.x + Math.min(targetBox.width - 2, 180), y, {
      steps: 10,
    });
    await page.mouse.up();

    const floatingToolbar = page.getByRole('toolbar').filter({
      has: page.getByRole('button', { exact: true, name: 'Ask AI' }),
    });

    await expect(floatingToolbar).toBeVisible();

    const selectedText = (await readDOMSelection(page)).text;

    expect(selectedText).not.toBe('');

    const boldButton = floatingToolbar.locator('button').filter({
      has: page.locator('svg.lucide-bold'),
    });

    await expect(boldButton).toHaveCount(1);
    await boldButton.click();

    await expect
      .poll(() => readDOMSelection(page))
      .toEqual({
        activeInEditor: true,
        bold: true,
        collapsed: false,
        insideEditor: true,
        text: selectedText,
      });
    await expect(boldButton).toHaveAttribute('aria-checked', 'true');
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});
