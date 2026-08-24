import { expect, type Locator, type Page, test } from '@playwright/test';

const expectedSelection = 'Experience a modern';
const introText = 'Experience a modern rich-text editor built with';

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

const getFloatingToolbar = (page: Page) =>
  page.getByRole('toolbar').filter({
    has: page.getByRole('button', { exact: true, name: 'Ask AI' }),
  });

const clickCenter = async (page: Page, locator: Locator) => {
  const box = await locator.boundingBox();

  if (!box) throw new Error('Expected a visible control');

  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
};

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

const selectIntroText = async (page: Page) => {
  const editor = getEditor(page);

  await page.goto('/blocks/playground');
  await expect(editor).toHaveCount(1);

  const target = page.getByText(introText, { exact: true });
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

  const floatingToolbar = getFloatingToolbar(page);

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

  return { editor, floatingToolbar };
};

test('floating Bold applies the mark without losing the selection', async ({
  page,
}) => {
  const { floatingToolbar } = await selectIntroText(page);

  const boldButton = floatingToolbar.locator('button').filter({
    has: page.locator('svg.lucide-bold'),
  });

  await expect(boldButton).toHaveCount(1);

  const runtimeErrors = recordRuntimeErrors(page);

  try {
    await clickCenter(page, boldButton);

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

test('floating Comment marks the target and opens the reply editor', async ({
  page,
}) => {
  const { floatingToolbar } = await selectIntroText(page);
  const commentButton = floatingToolbar.locator('button').filter({
    has: page.locator('svg.lucide-message-square-text'),
  });

  await expect(commentButton).toHaveCount(1);

  const runtimeErrors = recordRuntimeErrors(page);

  try {
    await clickCenter(page, commentButton);

    const draftLeaf = page.locator('.plite-comment').filter({
      hasText: expectedSelection,
    });
    const replyPlaceholder = page.locator('[data-plite-placeholder]').filter({
      hasText: 'Reply...',
    });
    const replyEditor = getEditor(page).last();

    await expect(draftLeaf).toHaveCount(1);
    await expect(draftLeaf).toBeVisible();
    await expect(getEditor(page)).toHaveCount(2);
    await expect(replyEditor).toHaveCount(1);
    await expect(replyPlaceholder).toBeVisible();
    await expect
      .poll(() =>
        replyEditor.evaluate((element) =>
          element.contains(document.activeElement)
        )
      )
      .toBe(true);
    await expect
      .poll(() => page.evaluate(() => document.getSelection()?.isCollapsed))
      .toBe(true);

    await replyEditor.pressSequentially('Verified');
    await expect(replyEditor).toContainText('Verified');
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('floating Turn Into opens without losing the selection', async ({
  page,
}) => {
  const { floatingToolbar } = await selectIntroText(page);
  const turnIntoButton = floatingToolbar.getByRole('button', {
    exact: true,
    name: 'Text',
  });

  await expect(turnIntoButton).toHaveCount(1);

  const runtimeErrors = recordRuntimeErrors(page);

  try {
    await clickCenter(page, turnIntoButton);

    const menu = page.getByRole('menu');
    const headingItem = page.getByRole('menuitemradio', {
      exact: true,
      name: 'Heading 1',
    });

    await expect(menu).toBeVisible();
    await expect(headingItem).toBeVisible();
    await expect
      .poll(() => readDOMSelection(page))
      .toMatchObject({
        collapsed: false,
        insideEditor: true,
        text: expectedSelection,
      });
    await expect
      .poll(() => page.evaluate(() => document.activeElement !== document.body))
      .toBe(true);

    await clickCenter(page, headingItem);

    const transformedBlock = page.getByRole('heading', { level: 1 }).filter({
      hasText: introText,
    });

    await expect(transformedBlock).toHaveCount(1);
    await expect
      .poll(() => readDOMSelection(page))
      .toMatchObject({
        activeInEditor: true,
        collapsed: false,
        insideEditor: true,
        text: expectedSelection,
      });
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});
