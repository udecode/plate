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
  const editor = getEditor(page);
  const expectedSelection = 'Experience a modern';

  await page.goto('/blocks/playground');
  await expect(editor).toHaveCount(1);

  const target = page.getByText(
    'Experience a modern rich-text editor built with',
    { exact: true }
  );
  const targetRange = await target.evaluate((element, textLength) => {
    const textNode = element.firstChild;

    if (!textNode || textNode.nodeType !== Node.TEXT_NODE) {
      throw new Error('Expected a plain intro text node');
    }

    const range = document.createRange();

    range.setStart(textNode, 0);
    range.setEnd(textNode, textLength);

    const rect = range.getBoundingClientRect();

    return {
      bottom: rect.bottom,
      left: rect.left,
      right: rect.right,
      top: rect.top,
    };
  }, expectedSelection.length);
  const y = (targetRange.top + targetRange.bottom) / 2;

  await page.mouse.move(targetRange.left + 1, y);
  await page.mouse.down();
  await page.mouse.move(targetRange.right - 1, y, { steps: 10 });
  await page.mouse.up();

  const floatingToolbar = page.getByRole('toolbar').filter({
    has: page.getByRole('button', { exact: true, name: 'Ask AI' }),
  });

  await expect(floatingToolbar).toBeVisible();

  await expect
    .poll(() => readDOMSelection(page))
    .toEqual({
      activeInEditor: true,
      bold: false,
      collapsed: false,
      insideEditor: true,
      text: expectedSelection,
    });

  const boldButton = floatingToolbar.locator('button').filter({
    has: page.locator('svg.lucide-bold'),
  });

  await expect(boldButton).toHaveCount(1);

  const boldButtonBox = await boldButton.boundingBox();

  if (!boldButtonBox) throw new Error('Expected visible floating Bold');

  const runtimeErrors = recordRuntimeErrors(page);

  try {
    await page.mouse.click(
      boldButtonBox.x + boldButtonBox.width / 2,
      boldButtonBox.y + boldButtonBox.height / 2
    );

    await expect
      .poll(() => readDOMSelection(page))
      .toEqual({
        activeInEditor: true,
        bold: true,
        collapsed: false,
        insideEditor: true,
        text: expectedSelection,
      });
    await expect(floatingToolbar).toBeVisible();
    await expect(boldButton).toHaveAttribute('aria-pressed', 'true');
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});
