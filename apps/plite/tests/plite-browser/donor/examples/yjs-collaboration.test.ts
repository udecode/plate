import { expect, test } from '@playwright/test';
import { recordPliteBrowserRuntimeErrors } from '@platejs/browser/playwright';

test.describe('yjs collaboration example', () => {
  test('maps Plite history across offline and remote edits', async ({
    page,
  }) => {
    const runtimeErrors = recordPliteBrowserRuntimeErrors(page);
    const peerIds = ['a', 'b', 'c', 'd'] as const;
    const editor = (peerId: (typeof peerIds)[number]) =>
      page.locator(
        `#yjs-peer-${peerId}-editor-surface [contenteditable="true"]`
      );
    const readDocuments = () =>
      Promise.all(peerIds.map((peerId) => editor(peerId).innerText()));

    try {
      await page.goto('/examples/plite/yjs-collaboration');

      await expect(page.locator('[contenteditable="true"]')).toHaveCount(4);
      await page.getByTestId('yjs-peer-b-disconnect').click();
      await page.getByTestId('yjs-peer-b-insert-text').click();

      await expect(editor('b')).toHaveText('Hello world!!');
      await expect(page.getByTestId('yjs-peer-b-history')).toHaveText(
        'undo:1;redo:0'
      );

      await page.getByTestId('yjs-peer-a-append').click();

      await expect(editor('a')).toHaveText('Hello world! Ada');
      await expect(editor('b')).toHaveText('Hello world!!');

      await page.getByTestId('yjs-peer-b-connect').click();

      await expect
        .poll(readDocuments)
        .toEqual([
          'Hello world! Ada!',
          'Hello world! Ada!',
          'Hello world! Ada!',
          'Hello world! Ada!',
        ]);

      await page.getByTestId('yjs-peer-b-undo').click();

      await expect
        .poll(readDocuments)
        .toEqual([
          'Hello world! Ada',
          'Hello world! Ada',
          'Hello world! Ada',
          'Hello world! Ada',
        ]);
      await expect(page.getByTestId('yjs-peer-b-history')).toHaveText(
        'undo:0;redo:1'
      );

      await page.getByTestId('yjs-peer-b-redo').click();

      await expect
        .poll(readDocuments)
        .toEqual([
          'Hello world! Ada!',
          'Hello world! Ada!',
          'Hello world! Ada!',
          'Hello world! Ada!',
        ]);
      await expect(page.getByTestId('yjs-peer-b-history')).toHaveText(
        'undo:1;redo:0'
      );

      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });

  test('keeps a claimed schema room atomic across rejected peers and reconfiguration', async ({
    page,
  }) => {
    const runtimeErrors = recordPliteBrowserRuntimeErrors(page);
    const peerIds = ['a', 'b', 'c', 'd'] as const;
    const readDocuments = () =>
      Promise.all(
        peerIds.map((peerId) =>
          page
            .locator(
              `#yjs-peer-${peerId}-editor-surface [contenteditable="true"]`
            )
            .innerText()
        )
      );
    const readHistory = () =>
      Promise.all(
        peerIds.map((peerId) =>
          page.getByTestId(`yjs-peer-${peerId}-history`).innerText()
        )
      );

    try {
      await page.goto('/examples/plite/yjs-collaboration');

      await expect(page.locator('[contenteditable="true"]')).toHaveCount(4);
      const roomClaim = page.getByTestId('yjs-schema-room-claim');

      await expect(roomClaim).toHaveText('yjs-collaboration-example@1');
      expect(
        await roomClaim.getAttribute('data-schema-fingerprint')
      ).toBeTruthy();
      await expect(page.getByTestId('yjs-peer-a-append')).toBeVisible();
      await expect(page.getByTestId('yjs-peer-a-insert-text')).toBeVisible();
      await page.getByTestId('yjs-peer-a-insert-text').click();

      for (const peerId of peerIds) {
        await expect(
          page.locator(
            `#yjs-peer-${peerId}-editor-surface [contenteditable="true"]`
          )
        ).toContainText('Hello world!!');
      }
      await expect(page.getByTestId('yjs-peer-a-history')).toHaveText(
        'undo:1;redo:0'
      );

      const documentsBeforeRejections = await readDocuments();
      const historyBeforeRejections = await readHistory();

      await page.getByTestId('yjs-schema-incompatible-join').click();
      await expect(
        page.getByTestId('yjs-schema-incompatible-join-status')
      ).toContainText('local version 2, room version 1');
      await expect(
        page.getByTestId('yjs-schema-incompatible-join-status')
      ).toContainText('local:Candidate local');
      expect(await readDocuments()).toEqual(documentsBeforeRejections);
      expect(await readHistory()).toEqual(historyBeforeRejections);

      await page.getByTestId('yjs-schema-incompatible-reconfigure').click();
      await expect(
        page.getByTestId('yjs-schema-incompatible-reconfigure-status')
      ).toContainText('local version 2, room version 1');
      await expect(roomClaim).toHaveText('yjs-collaboration-example@1');
      expect(await readDocuments()).toEqual(documentsBeforeRejections);
      expect(await readHistory()).toEqual(historyBeforeRejections);

      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });
});
