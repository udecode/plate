import {
  type BrowserEditorHarness,
  createBrowserEditorHarness,
  recordBrowserRuntimeErrors,
} from '@platejs/test/playwright';
import { expect, type Page, test } from '@playwright/test';

const EDITOR_ROOT = '[data-editor="true"][contenteditable="true"]';
const FIRST =
  'This editor really checks each paragraph while you type. Filler words get a wavy underline , and so does a space before a comma.';
const SERVER =
  'Check with server adds a slower rule that flags e-mail and web site, and its answer arrives after a short delay.';

const open = async (page: Page) => {
  await page.goto('/blocks/lint-demo', { waitUntil: 'commit' });
  const root = page.locator(EDITOR_ROOT).first();
  const editor = createBrowserEditorHarness(page, 'lint', root);

  await editor.ready({ editor: 'visible', text: 'Linting' });
  await editor.assert.modelBlockText(1, FIRST);
  await editor.assert.modelBlockText(3, SERVER);

  const panel = page.getByRole('complementary', { name: 'Lint findings' });
  const status = panel.getByRole('status');

  await expect(status).toHaveText('5 issues');

  return {
    editor,
    painted: root.locator('[data-lint-id]'),
    panel,
    popover: page.locator('[data-slot="lint-popover"]'),
    root,
    status,
  };
};

const caretIn = async (
  editor: BrowserEditorHarness,
  block: number,
  word: string,
  within: number
) => {
  const text = await editor.get.modelBlockText(block);
  const offset = (text ?? '').indexOf(word) + within;

  await editor.selection.collapse({ offset, path: [block, 0] });
  await editor.focus();
};

const afterPaint = (page: Page) =>
  page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      })
  );

test('lint:paints findings by severity and skips the code block', async ({
  page,
}) => {
  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    const { painted, root } = await open(page);

    await expect(painted).toHaveText([
      ' really',
      ' , ',
      ' basically',
      ' really',
      ' , ',
    ]);
    await expect(root.locator('[data-lint-severity="error"]')).toHaveCount(2);
    await expect(root.locator('[data-lint-severity="warning"]')).toHaveCount(3);

    const paint = await painted.evaluateAll((spans) =>
      spans.map((span) => {
        const style = getComputedStyle(span);

        return {
          color: style.textDecorationColor,
          severity: span.dataset.lintSeverity,
          style: style.textDecorationStyle,
        };
      })
    );
    const colorOf = (severity: string) =>
      new Set(
        paint
          .filter((span) => span.severity === severity)
          .map((span) => span.color)
      );

    expect(new Set(paint.map((span) => span.style))).toEqual(new Set(['wavy']));
    expect(colorOf('error').size).toBe(1);
    expect(colorOf('warning').size).toBe(1);
    expect([...colorOf('error')]).not.toEqual([...colorOf('warning')]);

    // Each block renders inside its own wrapper under the root.
    const code = root.locator(':scope > *').nth(6);

    await expect(code).toContainText('really = true , very');
    await expect(code.locator('[data-lint-id]')).toHaveCount(0);
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('lint:fits the demo to a phone screen without scrolling sideways', async ({
  page,
}) => {
  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    await page.setViewportSize({ height: 812, width: 375 });
    await open(page);

    const widths = await page.evaluate(() => ({
      page: document.documentElement.scrollWidth,
      viewport: window.innerWidth,
    }));

    expect(widths.page).toBeLessThanOrEqual(widths.viewport);
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('lint:shows the Chinese demo text on the Chinese docs page', async ({
  page,
}) => {
  await page.goto('/cn/docs/lint', { waitUntil: 'commit' });
  const editor = createBrowserEditorHarness(
    page,
    'lint',
    page.locator(EDITOR_ROOT).first()
  );

  await editor.ready({ editor: 'visible' });
  await editor.assert.modelBlockText(0, '检查');
});

test('lint:lists findings in order, clears them and runs again', async ({
  page,
}) => {
  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    const { painted, panel, status } = await open(page);
    const rows = panel.getByRole('listitem');

    await expect(rows).toHaveText([
      'really Cut the filler word "really".',
      ', Remove the space before commas.',
      'basically Cut the filler word "basically".',
      'really Cut the filler word "really".',
      ', Remove the space before commas.',
    ]);
    await panel.getByRole('button', { name: 'Clear' }).click();
    await expect(status).toHaveText('0 issues');
    await expect(rows).toHaveCount(0);
    await expect(painted).toHaveCount(0);
    await panel.getByRole('button', { name: 'Run linter' }).click();
    await expect(status).toHaveText('5 issues');
    await expect(painted).toHaveCount(5);
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('lint:applies the first fix as one undo step after earlier typing', async ({
  page,
}) => {
  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    const { editor, panel, status } = await open(page);

    await editor.selection.collapse({ offset: FIRST.length, path: [1, 0] });
    await editor.focus();
    await page.keyboard.type('Z');
    await editor.assert.modelBlockText(1, `${FIRST}Z`);
    await panel.getByRole('button', { name: 'Apply first fix' }).click();
    await editor.assert.modelBlockText(1, `${FIRST.replace('really ', '')}Z`);
    await expect(status).toHaveText('4 issues');
    await editor.assert.focusOwner('editor');
    await page.keyboard.press('ControlOrMeta+z');
    await editor.assert.modelBlockText(1, `${FIRST}Z`);
    await expect(status).toHaveText('5 issues');
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('lint:fixes from the caret popover, moves to the next finding and keeps typing', async ({
  page,
}) => {
  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    const { editor, popover } = await open(page);

    await caretIn(editor, 1, 'really', 2);
    await expect(popover).toContainText('Cut the filler word "really".');
    await popover.getByRole('button', { name: 'Fix and next' }).click();

    const withoutFiller = FIRST.replace('really ', '');

    await editor.assert.modelBlockText(1, withoutFiller);
    expect(await editor.get.selectedText()).toBe(' , ');
    await expect(popover).toContainText('Remove the space before commas.');
    await popover.getByRole('button', { exact: true, name: ',' }).click();

    const fixed = withoutFiller.replace(' , ', ', ');

    await editor.assert.modelBlockText(1, fixed);
    await expect(popover).toHaveCount(0);
    await editor.assert.focusOwner('editor');
    await page.keyboard.type('Q');
    await editor.assert.modelBlockText(
      1,
      fixed.replace('underline, ', 'underline, Q')
    );
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('lint:selects the next and previous finding with F8 and Shift+F8, wrapping', async ({
  page,
}) => {
  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    const { editor } = await open(page);
    const start = FIRST.indexOf(' really');
    const comma = FIRST.indexOf(' , ');

    await editor.selection.collapse({ offset: 0, path: [0, 0] });
    await editor.focus();
    await page.keyboard.press('F8');
    await editor.assert.selection({
      anchor: { offset: start, path: [1, 0] },
      focus: { offset: start + ' really'.length, path: [1, 0] },
    });
    expect(await editor.get.selectedText()).toBe(' really');
    await page.keyboard.press('F8');
    await editor.assert.selection({
      anchor: { offset: comma, path: [1, 0] },
      focus: { offset: comma + 3, path: [1, 0] },
    });
    await page.keyboard.press('Shift+F8');
    expect(await editor.get.selectedText()).toBe(' really');
    await page.keyboard.press('Shift+F8');

    const quote = (await editor.get.modelBlockText(4)) ?? '';
    const lastComma = quote.indexOf(' , ');

    await editor.assert.selection({
      anchor: { offset: lastComma, path: [4, 0, 0] },
      focus: { offset: lastComma + 3, path: [4, 0, 0] },
    });
    expect(await editor.get.selectedText()).toBe(' , ');
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('lint:opens the popover when a server reply lands under a still caret, and Clear closes it', async ({
  page,
}) => {
  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    const { editor, panel, popover, status } = await open(page);

    await caretIn(editor, 3, 'e-mail', 2);

    const caret = await editor.get.selection();

    await expect(popover).toHaveCount(0);
    await panel.getByRole('button', { name: 'Check with server' }).click();
    await expect(status).toHaveText('7 issues');
    await expect(popover).toContainText('Write "email".');
    expect(await editor.get.selection()).toEqual(caret);
    await editor.assert.focusOwner('editor');
    await panel.getByRole('button', { name: 'Clear' }).click();
    await expect(popover).toHaveCount(0);
    await expect(status).toHaveText('0 issues');
    await panel.getByRole('button', { name: 'Run linter' }).click();
    await expect(status).toHaveText('5 issues');
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('lint:repaints a flagged word typed into key by key', async ({ page }) => {
  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    const { editor, root } = await open(page);
    const fillers = root.locator('[data-lint-rule="style/filler-words"]');

    await expect(fillers).toHaveCount(3);
    await caretIn(editor, 1, 'really', 3);
    await page.keyboard.type('X');
    await editor.assert.modelBlockText(1, FIRST.replace('really', 'reaXlly'));
    await expect(fillers).toHaveText([' basically', ' really']);
    await page.keyboard.press('Backspace');
    await editor.assert.modelBlockText(1, FIRST);
    await expect(fillers).toHaveText([' really', ' basically', ' really']);
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('lint:drops server underlines in a block at once when typing inside one, until the next reply', async ({
  page,
}) => {
  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    const { editor, panel, root, status } = await open(page);
    const server = root.locator('[data-lint-rule="server/terminology"]');
    const serverTexts = () =>
      server.evaluateAll((spans) => spans.map((span) => span.textContent));

    await panel.getByRole('button', { name: 'Check with server' }).click();
    await expect(status).toHaveText('7 issues');
    await expect(server).toHaveText(['e-mail', 'web site']);
    await caretIn(editor, 3, 'e-mail', 2);

    for (const key of ['x', 'y']) {
      await page.keyboard.press(key);
      await afterPaint(page);
      expect(await serverTexts()).toEqual([]);
    }

    await editor.assert.modelBlockText(3, SERVER.replace('e-mail', 'e-xymail'));
    await expect(server).toHaveText(['web site']);
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});
