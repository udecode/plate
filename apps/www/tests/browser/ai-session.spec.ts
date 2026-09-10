import {
  createPliteBrowserEditorHarness,
  recordPliteBrowserRuntimeErrors,
} from '@platejs/test/playwright';
import { expect, test } from '@playwright/test';

test('Copilot accepts formatted text before list indentation and supports dismissal', async ({
  page,
}) => {
  const errors = recordPliteBrowserRuntimeErrors(page);
  try {
    await page.route('**/api/ai/copilot', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ text: ' **completion**' }),
      })
    );
    await page.goto('/blocks/copilot-demo', { waitUntil: 'commit' });
    const root = page.locator('.plite-editor[contenteditable="true"]').first();
    const editor = createPliteBrowserEditorHarness(
      page,
      'copilot:session',
      root
    );
    await editor.ready({
      editor: 'visible',
      text: 'Choose from the suggested completions:',
    });
    const before = await editor.get.modelValue();
    await page.getByText('Copilot will', { exact: false }).click();
    await root.press('End');
    await root.press('Control+Space');
    await expect(root.getByText('completion', { exact: true })).toBeVisible();
    expect(await editor.get.modelValue()).toEqual(before);
    await root.press('Tab');
    await expect(
      root.locator('strong').filter({ hasText: 'completion' })
    ).toBeVisible();
    await root.press('ControlOrMeta+z');
    await expect.poll(() => editor.get.modelValue()).toEqual(before);
    await root.press('Control+Space');
    await expect(root.getByText('completion', { exact: true })).toBeVisible();
    await root.press('Escape');
    await expect(root.getByText('completion', { exact: true })).toHaveCount(0);
    await root.press('!');
    await expect(root).toContainText('type.!');
    errors.assertNone();
  } finally {
    errors.stop();
  }
});

test('AI preview renders generated text, accepts it, and preserves undo on a narrow view', async ({
  page,
}, info) => {
  const errors = recordPliteBrowserRuntimeErrors(page);
  const response = `${[
    { type: 'start', messageId: 'preview' },
    { type: 'data-toolName', data: 'generate' },
    { type: 'text-start', id: 't' },
    { type: 'text-delta', id: 't', delta: 'Generated ' },
    { type: 'text-end', id: 't' },
    { type: 'text-start', id: 'second' },
    { type: 'text-delta', id: 'second', delta: 'preview text.' },
    { type: 'text-end', id: 'second' },
    { type: 'finish' },
  ]
    .map((part) => `data: ${JSON.stringify(part)}\n\n`)
    .join('')}data: [DONE]\n\n`;
  try {
    await page.route('**/api/ai/command', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'text/event-stream',
        headers: { 'x-vercel-ai-ui-message-stream': 'v1' },
        body: response,
      })
    );
    await page.goto('/blocks/ai-demo', { waitUntil: 'commit' });
    const root = page.locator('.plite-editor[contenteditable="true"]').first();
    const editor = createPliteBrowserEditorHarness(page, 'ai:session', root);
    await editor.ready({
      editor: 'visible',
      text: 'Generate and refine content with AI.',
    });
    const before = await editor.get.modelValue();
    await page
      .getByText('Generate and refine content with AI.', { exact: true })
      .click();
    await root.press('Home');
    await root.press('Shift+End');
    await root.press('ControlOrMeta+j');
    const prompt = page.getByRole('dialog').getByRole('combobox');
    await prompt.fill('Write a summary');
    await prompt.press('Enter');
    const preview = page.getByRole('dialog').locator('.plite-editor');
    await expect(preview).toContainText('Generated preview text.');
    expect(await editor.get.modelValue()).toEqual(before);
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(preview).toBeVisible();
    await expect
      .poll(() =>
        page.getByRole('dialog').evaluate((dialog) => {
          const bounds = dialog.getBoundingClientRect();
          return bounds.left >= 0 && bounds.right <= window.innerWidth;
        })
      )
      .toBe(true);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      )
    ).toBe(true);
    await info.attach('ai-preview-mobile', {
      body: await page.screenshot(),
      contentType: 'image/png',
    });
    await page.getByRole('option', { name: 'Accept', exact: true }).click();
    await expect(root).toContainText('Generated preview text.');
    await expect(root).toBeFocused();
    await page.keyboard.press('ControlOrMeta+z');
    await expect.poll(() => editor.get.modelValue()).toEqual(before);
    await page.keyboard.insertText('!');
    await expect(root).toContainText('!');
    await page.keyboard.press('ControlOrMeta+z');
    await expect.poll(() => editor.get.modelValue()).toEqual(before);
    await expect(root).toBeFocused();
    errors.assertNone();
  } finally {
    errors.stop();
  }
});
