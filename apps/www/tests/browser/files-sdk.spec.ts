import { readFileSync } from 'node:fs';

import { createBrowserEditorHarness } from '@platejs/test/playwright';
import { expect, test } from '@playwright/test';

test('copied picker uploads through the Files SDK XHR path and completes a draft', async ({
  page,
}) => {
  const methods: string[] = [];
  const bytes = Buffer.from('image bytes');

  await page.route('**/api/files?**', async (route) => {
    const request = route.request();
    const method = request.method();
    methods.push(method);
    const url = new URL(request.url());

    if (method === 'PUT') {
      expect(request.postDataBuffer()).toEqual(bytes);
      await route.fulfill({ status: 200, body: '' });
      return;
    }
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        body: bytes,
        contentType: 'image/png',
      });
      return;
    }

    const body = request.postDataJSON();
    if (body.op === 'presign') {
      expect(body.files).toMatchObject([
        { name: 'picker.png', size: bytes.length },
      ]);
      url.searchParams.set('op', 'proxy');
      await route.fulfill({
        status: 200,
        json: {
          uploads: [
            {
              id: 'browser-proof-token',
              key: 'asset.png',
              target: {
                method: 'PUT',
                url: url.href,
                headers: { 'content-type': 'image/png' },
              },
            },
          ],
        },
      });
      return;
    }
    if (body.op === 'complete') {
      await route.fulfill({
        status: 200,
        json: {
          files: [
            {
              key: 'asset.png',
              name: 'picker.png',
              size: bytes.length,
              type: 'image/png',
              etag: 'browser-proof-etag',
              lastModified: 1,
            },
          ],
        },
      });
      return;
    }
    throw new Error(`Unexpected Files SDK operation: ${body.op}`);
  });

  await page.goto('/blocks/files-sdk-proof');
  const root = page.getByRole('textbox', { name: 'Files SDK proof' });
  const editor = createBrowserEditorHarness(page, 'Files SDK proof', root);
  await expect(root).toBeVisible();
  await editor.selection.selectDOM({
    anchor: { path: [0, 0], offset: 6 },
    focus: { path: [0, 0], offset: 6 },
  });

  const chooserPromise = page.waitForEvent('filechooser');
  await page.getByTestId('files-sdk-picker').locator('button').first().click();
  const chooser = await chooserPromise;
  await chooser.setFiles({
    buffer: Buffer.from('image bytes'),
    mimeType: 'image/png',
    name: 'picker.png',
  });

  await expect
    .poll(() => editor.get.modelValue())
    .toMatchObject({
      children: [
        { type: 'paragraph' },
        { type: 'image', url: expect.stringContaining('/api/files?') },
      ],
    });
  expect(methods.filter((method) => method !== 'GET')).toEqual([
    'POST',
    'PUT',
    'POST',
  ]);
});

test('deployed playground completes an upload inside the browser session', async ({
  page,
}) => {
  const gatewayRequests: string[] = [];
  await page.route('**/api/files?**', async (route) => {
    gatewayRequests.push(route.request().method());
    await route.abort();
  });

  await page.goto('/blocks/playground', { waitUntil: 'commit' });
  const root = page.locator('[data-editor="true"]').first();
  const editor = createBrowserEditorHarness(
    page,
    'playground ephemeral upload',
    root
  );
  await editor.ready({
    editor: 'visible',
    text: 'Welcome to the Plate Playground!',
  });
  await editor.selection.collapse({ path: [0, 0], offset: 32 });

  const chooserPromise = page.waitForEvent('filechooser');
  await page.locator('button:has(svg.lucide-image)').first().click();
  const chooser = await chooserPromise;
  await chooser.setFiles({
    buffer: readFileSync('public/favicon-48x48.png'),
    mimeType: 'image/png',
    name: 'ephemeral.png',
  });

  const image = root.locator('img[src^="blob:"]');
  await expect(image).toBeVisible();
  await expect
    .poll(() =>
      image.evaluate((element) => {
        if (!(element instanceof HTMLImageElement)) return 0;

        return element.naturalWidth;
      })
    )
    .toBe(48);
  await expect(root.getByRole('button', { name: 'Cancel upload' })).toHaveCount(
    0
  );
  expect(gatewayRequests).toEqual([]);
});
