import {
  createBrowserEditorHarness,
  expect,
  recordBrowserRuntimeErrors,
  test,
} from '@platejs/test/playwright';

test('[plate#5228] Edit link fills Text to display with the link text', async ({
  page,
}) => {
  const runtimeErrors = recordBrowserRuntimeErrors(page);
  try {
    await page.goto('/blocks/playground', { waitUntil: 'commit' });
    const editor = page
      .locator('[data-editor="true"][contenteditable="true"]')
      .first();
    const editLink = page.getByRole('button', { name: 'Edit link' });
    const form = page.locator('.cn-popover-content:visible');
    const urlInput = form.getByPlaceholder('Paste link');
    const textInput = form.getByPlaceholder('Text to display');

    await createBrowserEditorHarness(page, 'plate#5228', editor).ready({
      editor: 'visible',
      text: 'React',
    });
    await editor.getByRole('link', { name: 'React' }).click();
    await editLink.click();
    await expect(urlInput).toHaveValue('https://reactjs.org');
    await expect(textInput).toHaveValue('React');

    await textInput.fill('QA23 Link');
    await textInput.press('Enter');
    await expect(editor.locator('a', { hasText: 'QA23 Link' })).toBeVisible();

    await editor.locator('[data-editor-string]').first().click();
    await editor.locator('a', { hasText: 'QA23 Link' }).click();
    await editLink.click();
    await expect(textInput).toHaveValue('QA23 Link');

    await urlInput.fill('https://react.dev');
    await urlInput.press('Enter');
    await expect(
      editor.locator('a[href="https://react.dev"]', { hasText: 'QA23 Link' })
    ).toBeVisible();
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('Open link follows the caret straight into the next link', async ({
  page,
}) => {
  const runtimeErrors = recordBrowserRuntimeErrors(page);
  try {
    await page.goto('/blocks/playground', { waitUntil: 'commit' });
    const editor = page
      .locator('[data-editor="true"][contenteditable="true"]')
      .first();
    const openLink = page.getByRole('link', { name: 'Open link in a new tab' });

    await createBrowserEditorHarness(page, 'open-link', editor).ready({
      editor: 'visible',
      text: 'Explore the documentation',
    });
    await editor.getByRole('link', { name: 'React' }).click();
    await expect(openLink).toHaveAttribute('href', 'https://reactjs.org');

    await editor
      .getByRole('link', { name: 'Explore the documentation' })
      .click();
    await expect(openLink).toHaveAttribute('href', '/docs');
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('Edit link comes back when a selection inside a link collapses after the link shortcut', async ({
  page,
}) => {
  const runtimeErrors = recordBrowserRuntimeErrors(page);
  try {
    await page.goto('/blocks/playground', { waitUntil: 'commit' });
    const editor = page
      .locator('[data-editor="true"][contenteditable="true"]')
      .first();
    const editLink = page.getByRole('button', { name: 'Edit link' });

    await createBrowserEditorHarness(page, 'link-shortcut', editor).ready({
      editor: 'visible',
      text: 'React',
    });
    await editor.getByRole('link', { name: 'React' }).click();
    await expect(editLink).toBeVisible();
    await page.keyboard.press('Shift+ArrowRight');
    await expect(editLink).toBeHidden();

    await page.keyboard.press('ControlOrMeta+k');
    await page.keyboard.press('ArrowLeft');
    await expect(editLink).toBeVisible();
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('Edit link goes back to the link toolbar when Shift+Tab leaves it', async ({
  browserName,
  page,
}) => {
  test.skip(
    browserName === 'webkit',
    'WebKit tabs from the form into the editor and moves its caret out of the link'
  );
  const runtimeErrors = recordBrowserRuntimeErrors(page);
  try {
    await page.goto('/blocks/playground', { waitUntil: 'commit' });
    const editor = page
      .locator('[data-editor="true"][contenteditable="true"]')
      .first();
    const editLink = page.getByRole('button', { name: 'Edit link' });
    const textInput = page
      .locator('.cn-popover-content:visible')
      .getByPlaceholder('Text to display');

    await createBrowserEditorHarness(page, 'link-tab-out', editor).ready({
      editor: 'visible',
      text: 'React',
    });
    await editor.getByRole('link', { name: 'React' }).click();
    await editLink.click();
    await textInput.fill('Draft');
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Shift+Tab');
    await expect(textInput).toBeHidden();
    await expect(editLink).toBeVisible();

    await editLink.click();
    await expect(textInput).toHaveValue('React');
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('Edit link goes back to the link toolbar when the link is clicked again', async ({
  page,
}) => {
  const runtimeErrors = recordBrowserRuntimeErrors(page);
  try {
    await page.goto('/blocks/playground', { waitUntil: 'commit' });
    const editor = page
      .locator('[data-editor="true"][contenteditable="true"]')
      .first();
    const link = editor.getByRole('link', { name: 'React' });
    const editLink = page.getByRole('button', { name: 'Edit link' });
    const textInput = page
      .locator('.cn-popover-content:visible')
      .getByPlaceholder('Text to display');

    await createBrowserEditorHarness(page, 'link-click-again', editor).ready({
      editor: 'visible',
      text: 'React',
    });
    await link.click();
    await editLink.click();
    await expect(textInput).toBeVisible();
    await link.click();
    await expect(textInput).toBeHidden();
    await expect(editLink).toBeVisible();
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('[plate#5314] Enter in Edit link brings the link toolbar back', async ({
  page,
}) => {
  // The docs route compiles its preview on first request in dev.
  test.slow();
  const runtimeErrors = recordBrowserRuntimeErrors(page);
  try {
    // WebKit logs pro.platejs.org's obsolete allow-from X-Frame-Options as an
    // error when the page's Plus iframe loads.
    await page.route('https://pro.platejs.org/**', (route) =>
      route.fulfill({ body: '', contentType: 'text/html' })
    );
    await page.goto('/docs/link', { waitUntil: 'commit' });
    const editor = page
      .locator('[data-editor="true"][contenteditable="true"]')
      .first();
    const editLink = page.getByRole('button', { name: 'Edit link' });
    const urlInput = page
      .locator('.cn-popover-content:visible')
      .getByPlaceholder('Paste link');

    await createBrowserEditorHarness(page, 'plate#5314', editor).ready({
      editor: 'visible',
      text: 'hyperlinks',
      timeoutMs: 60_000,
    });
    await editor.getByRole('link', { name: 'hyperlinks' }).click();
    await editLink.click();
    await urlInput.fill('https://example.com/qa');
    await urlInput.press('Enter');
    await expect(
      editor.locator('a[href="https://example.com/qa"]', {
        hasText: 'hyperlinks',
      })
    ).toBeVisible();
    await expect(editor).toBeFocused();
    await expect(editLink).toBeVisible();

    await page.keyboard.press('ArrowLeft');
    await expect(editLink).toBeVisible();
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});
