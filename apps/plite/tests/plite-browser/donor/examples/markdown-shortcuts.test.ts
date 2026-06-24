import { expect, test } from '@playwright/test';
import {
  openExample,
  recordPliteBrowserRuntimeErrors,
} from '@platejs/browser/playwright';

test.describe('On markdown-shortcuts example', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/examples/plite/markdown-shortcuts');
    await expect(page.getByRole('textbox')).toBeVisible();
  });

  type MarkdownEditor = Awaited<ReturnType<typeof openExample>>;

  const openMarkdownShortcuts = async (
    page: Parameters<typeof openExample>[0]
  ) => {
    const editor = await openExample(page, 'plite/markdown-shortcuts', {
      ready: {
        editor: 'visible',
        text: /A wise quote\./,
      },
    });

    await expect(editor.root.locator('blockquote')).toContainText(
      'A wise quote.'
    );

    return editor;
  };

  const clearEditor = async (editor: MarkdownEditor) => {
    await editor.selectAll();
    await editor.deleteFragment();
    await editor.focus();
  };

  const getHistoryHotkeys = async (page: Parameters<typeof openExample>[0]) => {
    const isMac = await page.evaluate(() =>
      /Mac OS X/.test(navigator.userAgent)
    );

    return {
      redo: isMac ? 'Meta+Shift+Z' : 'Control+Shift+Z',
      undo: isMac ? 'Meta+Z' : 'Control+Z',
    };
  };

  test('contains quote', async ({ page }) => {
    const editor = await openMarkdownShortcuts(page);

    await expect(editor.root.locator('blockquote')).toContainText(
      'A wise quote.'
    );
  });

  test('keeps pasted text inside an empty markdown quote', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop markdown shortcut keyboard proof'
    );

    const editor = await openMarkdownShortcuts(page);
    const textbox = editor.root;

    await clearEditor(editor);
    await textbox.pressSequentially('> ');
    await expect(textbox.locator('blockquote')).toHaveCount(1);

    await editor.clipboard.pasteText('quoted paste');

    await expect(textbox.locator('blockquote')).toHaveText('quoted paste');
    await editor.assert.blockTexts(['quoted paste']);
  });

  test('keeps a heading when typing an ordered marker at its start', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop markdown shortcut keyboard proof'
    );

    const editor = await openMarkdownShortcuts(page);
    const textbox = editor.root;

    await clearEditor(editor);
    await textbox.pressSequentially('# ');
    await textbox.pressSequentially('Welcome');
    await expect(textbox.locator('h1')).toHaveText('Welcome');

    await editor.selection.collapse({ path: [0, 0], offset: 0 });
    await textbox.pressSequentially('1. ');

    await expect(textbox.locator('h1')).toHaveText('1. Welcome');
    await expect(textbox.locator('ol')).toHaveCount(0);
    await editor.assert.blockTexts(['1. Welcome']);
  });

  test('treats non-breaking space as markdown shortcut whitespace', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop markdown shortcut keyboard proof'
    );

    const editor = await openMarkdownShortcuts(page);
    const textbox = editor.root;

    await clearEditor(editor);
    await editor.insertText('#\u00A0');
    await textbox.pressSequentially('NBSP heading');

    await expect(textbox.locator('h1')).toHaveText('NBSP heading');
    await editor.assert.blockTexts(['NBSP heading']);
  });

  test('turns a non-empty paragraph into a heading from its start', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop markdown shortcut keyboard proof'
    );

    const runtimeErrors = recordPliteBrowserRuntimeErrors(page);

    try {
      const editor = await openMarkdownShortcuts(page);
      const textbox = editor.root;

      await clearEditor(editor);
      await textbox.pressSequentially('Welcome');
      await editor.selection.collapse({ path: [0, 0], offset: 0 });
      await textbox.pressSequentially('# ');

      await expect(textbox.locator('h1')).toHaveText('Welcome');
      await editor.assert.blockTexts(['Welcome']);
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });

  test('can add list items', async ({ page }) => {
    const editor = await openMarkdownShortcuts(page);
    const textbox = editor.root;

    await expect(textbox.locator('ul')).toHaveCount(0);

    await editor.selection.collapse({ path: [0, 0], offset: 0 });
    await editor.insertText('* ');
    await editor.insertText('1st Item');
    await editor.insertBreak();
    await editor.insertText('2nd Item');
    await editor.insertBreak();
    await editor.insertText('3rd Item');
    await editor.insertBreak();
    await editor.deleteBackward();

    await expect(page.locator('ul > li')).toHaveCount(3);

    await expect(page.locator('ul > li').nth(0)).toContainText('1st Item');
    await expect(page.locator('ul > li').nth(1)).toContainText('2nd Item');
    await expect(page.locator('ul > li').nth(2)).toContainText('3rd Item');
  });

  test('types a long markdown bullet followed by a paragraph without runtime errors', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop markdown shortcut keyboard proof'
    );

    const runtimeErrors = recordPliteBrowserRuntimeErrors(page);

    try {
      const editor = await openMarkdownShortcuts(page);
      const textbox = editor.root;
      const listText = new Array(10).fill('asdf').join(' ');
      const paragraphText = new Array(19).fill('asdf').join(' ');

      await clearEditor(editor);
      await textbox.pressSequentially('* ');
      await textbox.pressSequentially(listText);
      await textbox.press('Enter');
      await textbox.press('Backspace');
      await textbox.pressSequentially(paragraphText);

      await expect(textbox.locator('ul > li')).toHaveCount(1);
      await expect(textbox.locator('ul > li')).toContainText(listText);
      await expect(textbox.locator('p').last()).toContainText(paragraphText);
      await expect.poll(() => editor.get.modelText()).toContain(paragraphText);
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });

  test('backspaces an empty markdown-created bullet back to a paragraph', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop markdown shortcut keyboard proof'
    );

    const editor = await openMarkdownShortcuts(page);
    const textbox = editor.root;

    await clearEditor(editor);
    await textbox.pressSequentially('* ');
    await expect(page.locator('ul > li')).toHaveCount(1);

    await textbox.press('Backspace');
    await textbox.press('Backspace');

    await expect(page.locator('ul')).toHaveCount(0);
    await expect.poll(() => editor.get.modelText()).toBe('');
    await editor.assert.selection({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });
  });

  test('merges a markdown-created list before an existing list', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop markdown shortcut keyboard proof'
    );

    const editor = await openMarkdownShortcuts(page);
    const textbox = editor.root;

    await editor.selectAll();
    await editor.deleteFragment();
    await editor.focus();

    await textbox.press('Enter');
    await textbox.pressSequentially('- one');
    await expect(textbox.locator('ul > li')).toHaveCount(1);

    await editor.selection.collapse({ path: [0, 0], offset: 0 });
    await textbox.pressSequentially('- two');

    await expect(textbox.locator('ul')).toHaveCount(1);
    await expect(textbox.locator('ul > li')).toHaveCount(2);
    await expect(textbox.locator('ul > li').nth(0)).toHaveText('two');
    await expect(textbox.locator('ul > li').nth(1)).toHaveText('one');
  });

  test('keeps native desktop list continuation text in each list item', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop markdown shortcut keyboard proof'
    );

    const editor = await openMarkdownShortcuts(page);
    const textbox = editor.root;

    await expect(textbox.locator('ul')).toHaveCount(0);

    await editor.selection.collapse({ path: [0, 0], offset: 0 });
    await editor.focus();
    await textbox.pressSequentially('* ');
    await expect(page.locator('ul > li')).toHaveCount(1);
    await textbox.pressSequentially('1st Item');
    await textbox.press('Enter');
    await expect(page.locator('ul > li')).toHaveCount(2);
    await textbox.pressSequentially('2nd Item');
    await textbox.press('Enter');
    await expect(page.locator('ul > li')).toHaveCount(3);
    await textbox.pressSequentially('3rd Item');

    await expect(page.locator('ul > li').nth(0)).toContainText('1st Item');
    await expect(page.locator('ul > li').nth(1)).toContainText('2nd Item');
    await expect(page.locator('ul > li').nth(2)).toContainText('3rd Item');
  });

  test('creates a blank bullet before the first item when Enter starts a list item', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop markdown shortcut keyboard proof'
    );

    const editor = await openMarkdownShortcuts(page);
    const textbox = editor.root;

    await clearEditor(editor);
    await textbox.pressSequentially('* one');
    await textbox.press('Enter');
    await textbox.pressSequentially('two');
    await editor.selection.collapse({ path: [0, 0, 0], offset: 0 });
    await textbox.press('Enter');

    await expect(page.locator('ul > li')).toHaveCount(3);
    await expect(page.locator('ul > li').nth(0)).toHaveText('');
    await expect(page.locator('ul > li').nth(1)).toContainText('one');
    await expect(page.locator('ul > li').nth(2)).toContainText('two');
  });

  test('can create a numbered list with markdown start number', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop markdown shortcut keyboard proof'
    );

    const editor = await openMarkdownShortcuts(page);
    const textbox = editor.root;

    await expect(textbox.locator('ol')).toHaveCount(0);

    await editor.selection.collapse({ path: [0, 0], offset: 0 });
    await editor.focus();
    await textbox.pressSequentially('25. ');
    await textbox.pressSequentially('Started');

    await expect(textbox.locator('ol')).toHaveAttribute('start', '25');
    await expect(textbox.locator('ol > li')).toHaveCount(1);
    await expect(textbox.locator('ol > li').first()).toContainText('Started');
  });

  test('keeps ordered marker typing in the current list item', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop markdown shortcut keyboard proof'
    );

    const editor = await openMarkdownShortcuts(page);
    const textbox = editor.root;

    await clearEditor(editor);

    await textbox.pressSequentially('1. ');
    await textbox.pressSequentially('one');
    await textbox.press('Enter');
    await textbox.pressSequentially('2. ');
    await textbox.pressSequentially('two');

    await expect(page.locator('ol > li')).toHaveCount(2);
    await expect(page.locator('ol > li').nth(0)).toContainText('one');
    await expect(page.locator('ol > li').nth(1)).toContainText('two');
  });

  test('creates current markdown shortcuts and can undo and redo a heading shortcut', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop markdown shortcut keyboard proof'
    );

    const shortcutCases = [
      { label: 'Heading one', selector: 'h1', shortcut: '# ' },
      { label: 'Heading two', selector: 'h2', shortcut: '## ' },
      { label: 'Heading three', selector: 'h3', shortcut: '### ' },
      { label: 'Heading four', selector: 'h4', shortcut: '#### ' },
      { label: 'Heading five', selector: 'h5', shortcut: '##### ' },
      { label: 'Quoted', selector: 'blockquote', shortcut: '> ' },
      { label: 'Dash item', selector: 'ul > li', shortcut: '- ' },
      { label: 'Star item', selector: 'ul > li', shortcut: '* ' },
      {
        label: 'Started',
        selector: 'ol[start="25"] > li',
        shortcut: '25. ',
      },
    ] as const;

    for (const shortcutCase of shortcutCases) {
      await page.goto('/examples/plite/markdown-shortcuts');
      const editor = await openMarkdownShortcuts(page);
      const textbox = editor.root;

      await clearEditor(editor);
      await textbox.pressSequentially(shortcutCase.shortcut);
      await textbox.pressSequentially(shortcutCase.label);
      await expect(textbox.locator(shortcutCase.selector)).toHaveCount(1);
      await expect(textbox.locator(shortcutCase.selector)).toContainText(
        shortcutCase.label
      );
    }

    await page.goto('/examples/plite/markdown-shortcuts');
    const editor = await openMarkdownShortcuts(page);
    const textbox = editor.root;
    const historyHotkeys = await getHistoryHotkeys(page);

    await clearEditor(editor);
    await textbox.pressSequentially('## ');
    await textbox.pressSequentially('Undoable');
    await expect(textbox.locator('h2')).toHaveText('Undoable');

    await textbox.click();
    await page.keyboard.press(historyHotkeys.undo);
    await page.waitForTimeout(100);
    await page.keyboard.press(historyHotkeys.undo);
    await page.waitForTimeout(100);
    await expect(textbox.locator('h2')).toHaveCount(0);
    await editor.assert.text('##');

    await textbox.click();
    await page.keyboard.press(historyHotkeys.redo);
    await page.waitForTimeout(100);
    await page.keyboard.press(historyHotkeys.redo);
    await page.waitForTimeout(100);
    await expect(textbox.locator('h2')).toHaveText('Undoable');
  });

  test('can add a h1 item', async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop markdown shortcut keyboard proof'
    );

    const editor = await openMarkdownShortcuts(page);
    const textbox = editor.root;

    await expect(textbox.locator('h1')).toHaveCount(0);

    await textbox.press('Enter');
    await textbox.press('ArrowLeft');
    await textbox.pressSequentially('# ');
    await textbox.pressSequentially('Heading');

    await expect(textbox.locator('h1')).toHaveCount(1);

    await expect(textbox.locator('h1')).toContainText('Heading');
  });

  test('keeps the caret in a heading created above another empty line', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop markdown shortcut keyboard proof'
    );

    const runtimeErrors = recordPliteBrowserRuntimeErrors(page);

    try {
      const editor = await openMarkdownShortcuts(page);
      const textbox = editor.root;

      await clearEditor(editor);
      await textbox.press('Enter');
      await editor.assert.blockTexts(['', '']);
      await editor.selection.collapse({ path: [0, 0], offset: 0 });
      await textbox.pressSequentially('# ');
      await textbox.pressSequentially('Heading');

      runtimeErrors.assertNone();
      await expect(textbox.locator('h1')).toHaveText('Heading');
      await editor.assert.blockTexts(['Heading', '']);
      await editor.assert.selection({
        anchor: { path: [0, 0], offset: 'Heading'.length },
        focus: { path: [0, 0], offset: 'Heading'.length },
      });
    } finally {
      runtimeErrors.stop();
    }
  });

  test('inserts a paragraph before a heading from the heading start', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop markdown shortcut keyboard proof'
    );

    const editor = await openMarkdownShortcuts(page);
    const textbox = editor.root;

    await editor.selectAll();
    await editor.deleteFragment();
    await editor.focus();
    await textbox.pressSequentially('# Heading');
    await expect(textbox.locator('h1')).toHaveText('Heading');

    await editor.selection.selectDOM({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });
    await textbox.press('Enter');

    await expect(textbox.locator('p')).toHaveCount(1);
    await expect(textbox.locator('h1')).toHaveText('Heading');
    await editor.assert.blockTexts(['', 'Heading']);
    await editor.assert.selection({
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [1, 0], offset: 0 },
    });
  });
});
