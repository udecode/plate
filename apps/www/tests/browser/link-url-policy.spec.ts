import {
  createBrowserEditorHarness,
  expect,
  recordBrowserRuntimeErrors,
  test,
  type BrowserEditorHarness,
} from '@platejs/test/playwright';
import type { Locator, Page, TestInfo } from '@playwright/test';

const EDITOR_ROOT = '[data-editor="true"][contenteditable="true"]';

const openEmptyLinkDemo = async (page: Page, name: string) => {
  await page.goto('/blocks/link-demo', { waitUntil: 'commit' });

  const root = page.locator(EDITOR_ROOT).first();
  const editor = createBrowserEditorHarness(page, name, root);

  await expect(root).toBeVisible();
  await editor.focus();
  await editor.selectAll();
  await editor.press('Backspace');
  await editor.assert.selection({
    anchor: { offset: 0, path: [0, 0] },
    focus: { offset: 0, path: [0, 0] },
  });

  return { editor, root };
};

const linkUrls = async (editor: BrowserEditorHarness) => {
  const urls: unknown[] = [];
  const visit = (node: unknown) => {
    if (!node || typeof node !== 'object') return;
    if ((node as { type?: unknown }).type === 'link') {
      urls.push((node as { url?: unknown }).url);
    }
    for (const value of Object.values(node)) visit(value);
  };

  visit(((await editor.get.modelValue()) as { children: unknown[] }).children);

  return urls;
};

const attachEditor = async (
  testInfo: TestInfo,
  root: Locator,
  name: string
) => {
  await testInfo.attach(name, {
    body: await root.screenshot({ animations: 'disabled', caret: 'initial' }),
    contentType: 'image/png',
  });
};

test.describe('link URL policy', () => {
  test('types the space after a URL the app does not allow', async ({
    page,
  }, testInfo) => {
    expect(testInfo.retry).toBe(0);
    const runtimeErrors = recordBrowserRuntimeErrors(page);

    try {
      const { editor, root } = await openEmptyLinkDemo(page, 'link-space');

      await page.keyboard.type('see ftp://example.com');
      await page.keyboard.press('Space');

      await editor.assert.modelBlockText(0, 'see ftp://example.com ');
      await editor.assert.collapsedModelDOMSelection({
        offset: 22,
        path: [0, 0],
        text: 'see ftp://example.com ',
      });

      await page.keyboard.type('x');

      await editor.assert.modelBlockText(0, 'see ftp://example.com x');
      expect(await linkUrls(editor)).toEqual([]);
      await expect(root.locator('a')).toHaveCount(0);
      await attachEditor(testInfo, root, 'space-after-ftp.png');
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });

  test('splits the block after a URL the app does not allow', async ({
    page,
  }, testInfo) => {
    expect(testInfo.retry).toBe(0);
    const runtimeErrors = recordBrowserRuntimeErrors(page);

    try {
      const { editor, root } = await openEmptyLinkDemo(page, 'link-enter');

      await page.keyboard.type('see ftp://example.com');
      await page.keyboard.press('Enter');

      await editor.assert.modelBlockTexts(['see ftp://example.com', '']);
      await editor.assert.collapsedModelDOMSelection({
        offset: 0,
        path: [1, 0],
        text: '',
      });

      await page.keyboard.type('x');

      await editor.assert.modelBlockTexts(['see ftp://example.com', 'x']);
      expect(await linkUrls(editor)).toEqual([]);
      await expect(root.locator('a')).toHaveCount(0);
      await attachEditor(testInfo, root, 'enter-after-ftp.png');
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });

  test('autolinks a typed tel: number on space', async ({ page }, testInfo) => {
    expect(testInfo.retry).toBe(0);
    const runtimeErrors = recordBrowserRuntimeErrors(page);

    try {
      const { editor, root } = await openEmptyLinkDemo(page, 'link-tel');

      await page.keyboard.type('call tel:+15551234');
      await page.keyboard.press('Space');

      await expect.poll(() => linkUrls(editor)).toEqual(['tel:+15551234']);
      await expect(root.locator('a[href="tel:+15551234"]')).toHaveText(
        'tel:+15551234'
      );
      await editor.assert.modelBlockText(0, 'call tel:+15551234 ');
      await attachEditor(testInfo, root, 'tel-autolink.png');
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });

  test('keeps the link form open on a draft without a scheme', async ({
    page,
  }, testInfo) => {
    expect(testInfo.retry).toBe(0);
    const runtimeErrors = recordBrowserRuntimeErrors(page);

    try {
      const { editor, root } = await openEmptyLinkDemo(page, 'link-toolbar');

      await page.keyboard.type('docs');
      await root.getByText('docs', { exact: true }).dblclick();
      await editor.assert.selection({
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      });
      await page
        .locator('[data-slot="fixed-toolbar"]')
        .getByRole('button', { name: 'Link' })
        .click();

      const input = page.getByPlaceholder('Paste link').last();

      await expect(input).toBeFocused();
      await page.keyboard.type('www.example.com');
      await page.keyboard.press('Enter');

      await expect(input).toBeVisible();
      await expect(input).toHaveValue('www.example.com');
      expect(await linkUrls(editor)).toEqual([]);
      await expect(root.locator('a')).toHaveCount(0);
      await attachEditor(testInfo, root, 'toolbar-refused-draft.png');

      await input.fill('https://www.example.com');
      await page.keyboard.press('Enter');

      await expect(input).toBeHidden();
      await expect(root.getByRole('link', { name: 'docs' })).toHaveAttribute(
        'href',
        'https://www.example.com'
      );
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });

  test('opens the link form with Cmd+K on a selected word', async ({
    page,
  }, testInfo) => {
    expect(testInfo.retry).toBe(0);
    const runtimeErrors = recordBrowserRuntimeErrors(page);

    try {
      const { editor, root } = await openEmptyLinkDemo(page, 'link-shortcut');

      await page.keyboard.type('docs');
      await root.getByText('docs', { exact: true }).dblclick();
      await editor.assert.selection({
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      });
      await page.keyboard.press('ControlOrMeta+k');

      await expect(page.getByPlaceholder('Paste link').last()).toBeFocused();
      await attachEditor(testInfo, root, 'shortcut-link-form.png');
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });

  test('pastes a URL as text after unfinished Markdown link source', async ({
    page,
  }, testInfo) => {
    expect(testInfo.retry).toBe(0);
    const runtimeErrors = recordBrowserRuntimeErrors(page);

    try {
      const { editor, root } = await openEmptyLinkDemo(page, 'link-paste');

      await page.keyboard.type('[Example](');
      await editor.assert.modelBlockText(0, '[Example](');
      await editor.clipboard.pasteHtml(
        '<a href="https://example.com">https://example.com</a>',
        'https://example.com'
      );

      await editor.assert.modelBlockText(0, '[Example](https://example.com');
      expect(await linkUrls(editor)).toEqual([]);

      await page.keyboard.type(')');

      await expect
        .poll(() => linkUrls(editor))
        .toEqual(['https://example.com']);
      await expect(root.getByRole('link', { name: 'Example' })).toHaveAttribute(
        'href',
        'https://example.com'
      );
      await attachEditor(testInfo, root, 'paste-in-link-source.png');
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });
});
