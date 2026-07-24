import { expect, test } from '@playwright/test';
import { recordPliteBrowserRuntimeErrors } from '@platejs/browser/playwright';

const INITIAL_TEXT =
  'Ada and Lin edit independent documents through a local Yjs room.';

test.describe('Plate collaboration registry example', () => {
  test('proves independent peers, cursors, reconnect, history, schema, and teardown', async ({
    page,
  }) => {
    const runtimeErrors = recordPliteBrowserRuntimeErrors(page);
    const adaEditor = page.getByRole('textbox', {
      name: 'Ada collaborative editor',
    });
    const linEditor = page.getByRole('textbox', {
      name: 'Lin collaborative editor',
    });
    const linCard = page.locator('[data-peer="lin"]');
    const readDocuments = () =>
      Promise.all([adaEditor.innerText(), linEditor.innerText()]);

    try {
      await page.goto('/examples/plite/collaboration-demo');

      await expect(page.locator('[data-collaboration-demo]')).toHaveAttribute(
        'data-editor-count',
        '2'
      );
      await expect(page.locator('[data-collaboration-demo]')).toHaveAttribute(
        'data-provider-count',
        '2'
      );
      await expect(page.locator('[data-collaboration-demo]')).toHaveAttribute(
        'data-doc-count',
        '3'
      );
      await expect(page.locator('[contenteditable="true"]')).toHaveCount(2);

      await adaEditor.click();
      await adaEditor.press('End');
      await adaEditor.type('!');

      await expect
        .poll(readDocuments)
        .toEqual([`${INITIAL_TEXT}!`, `${INITIAL_TEXT}!`]);
      await expect(
        page.locator('[data-remote-caret][data-client-id="101"]')
      ).toHaveCount(1);
      await expect(page.locator('[data-remote-caret]')).toHaveCount(1);

      await adaEditor.press('Shift+ArrowLeft');
      const remoteSelection = page.locator(
        '[data-remote-selection][data-client-id="101"]'
      );

      await expect(remoteSelection).toHaveCount(1);
      await expect(remoteSelection).toHaveCSS(
        'background-color',
        'rgb(124, 58, 237)'
      );
      expect((await remoteSelection.boundingBox())?.width).toBeGreaterThan(0);

      await linCard.getByRole('button', { name: 'Disconnect' }).click();
      await expect(linCard.locator('[data-peer-status]')).toHaveAttribute(
        'data-peer-status',
        'disconnected'
      );

      await linEditor.click();
      await linEditor.press('End');
      await linEditor.type('L');
      await adaEditor.click();
      await adaEditor.press('Home');
      await adaEditor.type('A');

      await expect(adaEditor).toHaveText(`A${INITIAL_TEXT}!`);
      await expect(linEditor).toHaveText(`${INITIAL_TEXT}!L`);
      await expect(page.locator('[data-remote-caret]')).toHaveCount(0);

      await linCard.getByRole('button', { name: 'Reconnect' }).click();
      await expect
        .poll(readDocuments)
        .toEqual([`A${INITIAL_TEXT}!L`, `A${INITIAL_TEXT}!L`]);
      await expect(linCard.locator('[data-peer-status]')).toHaveAttribute(
        'data-peer-status',
        'connected'
      );

      await linCard.getByRole('button', { name: 'Undo Lin' }).click();
      await expect
        .poll(readDocuments)
        .toEqual([`A${INITIAL_TEXT}!`, `A${INITIAL_TEXT}!`]);
      await expect(
        linCard.getByRole('button', { name: 'Redo Lin' })
      ).toContainText('Redo 1');

      await page.getByRole('button', { name: 'Reject schema v2' }).click();
      await expect(page.locator('[data-schema-status]')).toHaveAttribute(
        'data-schema-status',
        'rejected'
      );
      await expect(page.locator('[data-schema-status]')).toContainText(
        'local version 2, room version 1'
      );

      await page
        .getByRole('button', { name: 'Recover with schema v1' })
        .click();
      await expect(page.locator('[data-schema-status]')).toHaveAttribute(
        'data-schema-status',
        'recovered'
      );
      await expect(page.locator('[contenteditable="true"]')).toHaveCount(2);

      await adaEditor.click();
      await adaEditor.press('End');
      await page.setViewportSize({ height: 844, width: 390 });

      const cardLocator = page.locator('[data-peer]');

      await expect(cardLocator).toHaveCount(2);

      const cards = await cardLocator.all();
      const [adaCardBox, linCardBox] = await Promise.all(
        cards.map((card) => card.boundingBox())
      );
      const root = page.locator('[data-collaboration-demo]');
      const remoteCaret = page.locator(
        '[data-remote-caret][data-client-id="101"]'
      );
      const linOverlay = linCard.locator('[data-remote-cursor-overlay]');
      const caretBeforeScroll = await remoteCaret.boundingBox();
      const overlayBeforeScroll = await linOverlay.boundingBox();
      const rootSize = await root.evaluate((element) => ({
        clientWidth: element.clientWidth,
        scrollWidth: element.scrollWidth,
      }));

      expect(adaCardBox?.x).toBeGreaterThanOrEqual(0);
      expect(
        (adaCardBox?.x ?? -1) + (adaCardBox?.width ?? 391)
      ).toBeLessThanOrEqual(390);
      expect(
        (linCardBox?.x ?? -1) + (linCardBox?.width ?? 391)
      ).toBeLessThanOrEqual(390);
      expect(linCardBox?.y).toBeGreaterThan(
        adaCardBox?.y ?? Number.POSITIVE_INFINITY
      );
      expect(rootSize.clientWidth).toBeGreaterThan(0);
      expect(rootSize.scrollWidth).toBe(rootSize.clientWidth);
      expect(caretBeforeScroll).not.toBeNull();
      expect(overlayBeforeScroll).not.toBeNull();
      expect(caretBeforeScroll?.x).toBeGreaterThanOrEqual(
        overlayBeforeScroll?.x ?? Number.POSITIVE_INFINITY
      );
      expect(
        (caretBeforeScroll?.x ?? 391) + (caretBeforeScroll?.width ?? 0)
      ).toBeLessThanOrEqual(
        (overlayBeforeScroll?.x ?? -1) + (overlayBeforeScroll?.width ?? 0)
      );

      await page.evaluate(() => window.scrollTo(0, 400));

      const caretAfterScroll = await remoteCaret.boundingBox();
      const overlayAfterScroll = await linOverlay.boundingBox();

      expect(
        (caretAfterScroll?.x ?? 0) - (overlayAfterScroll?.x ?? 0)
      ).toBeCloseTo(
        (caretBeforeScroll?.x ?? 0) - (overlayBeforeScroll?.x ?? 0),
        0
      );
      expect(
        (caretAfterScroll?.y ?? 0) - (overlayAfterScroll?.y ?? 0)
      ).toBeCloseTo(
        (caretBeforeScroll?.y ?? 0) - (overlayBeforeScroll?.y ?? 0),
        0
      );

      await page.goto('/examples/plite/plaintext');
      await expect(
        page.locator('[data-plite-example="plaintext"]')
      ).toBeVisible();

      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });
});
