import { expect, test } from '@playwright/test';
import { recordPliteBrowserRuntimeErrors } from '@platejs/test/playwright';

test.describe('yjs hocuspocus example', () => {
  test('keeps distinct app-owned peers sync-gated without a server', async ({
    context,
    page,
  }) => {
    const runtimeErrors = recordPliteBrowserRuntimeErrors(page);
    const peerBPage = await context.newPage();
    const peerBRuntimeErrors = recordPliteBrowserRuntimeErrors(peerBPage);
    const room = 'plite-yjs-hocuspocus-browser-proof';
    const peerUrl = (peerId: 'a' | 'b') =>
      `/examples/plite/yjs-hocuspocus?connection=manual&peer=${peerId}&room=${room}`;
    const editor = (peerPage: typeof page) =>
      peerPage.locator('[contenteditable="true"]');

    try {
      await Promise.all([
        page.goto(peerUrl('a')),
        peerBPage.goto(peerUrl('b')),
      ]);

      await expect(editor(page)).toHaveCount(1);
      await expect(editor(peerBPage)).toHaveCount(1);
      await expect(page.getByRole('heading', { name: 'Peer A' })).toBeVisible();
      await expect(
        peerBPage.getByRole('heading', { name: 'Peer B' })
      ).toBeVisible();
      await expect(
        page.getByText('disconnected', { exact: true })
      ).toBeVisible();
      await expect(
        peerBPage.getByText('disconnected', { exact: true })
      ).toBeVisible();

      await page.getByTestId('yjs-peer-a-append').click();
      await peerBPage.getByTestId('yjs-peer-b-append').click();

      await expect(editor(page)).toHaveText('Hello world!');
      await expect(editor(peerBPage)).toHaveText('Hello world!');

      await page.getByTestId('yjs-peer-a-connect').click();
      await page.getByTestId('yjs-peer-a-disconnect').click();

      await expect(
        page.getByText('disconnected', { exact: true })
      ).toBeVisible();
      await expect(editor(page)).toHaveText('Hello world!');

      await peerBPage.close();
      await page.goto('/examples/plite/plaintext');
      await expect(page.locator('[contenteditable="true"]')).toHaveCount(1);

      runtimeErrors.assertNone();
      peerBRuntimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
      peerBRuntimeErrors.stop();
      await peerBPage.close().catch(() => undefined);
    }
  });
});
