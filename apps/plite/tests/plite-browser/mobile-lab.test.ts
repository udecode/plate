import { recordPliteBrowserRuntimeErrors } from '@platejs/browser/playwright';
import { expect, test } from '@playwright/test';

test.describe('mobile input lab', () => {
  test('exports browser events with model, DOM, selection, and device state', async ({
    page,
  }) => {
    const runtimeErrors = recordPliteBrowserRuntimeErrors(page);

    try {
      await page.goto('/mobile-lab');
      await expect(page.locator('[data-plite-mobile-lab]')).toBeVisible();
      const editor = page.locator('[data-plite-editor="true"]');

      await expect(editor).toBeVisible();
      await editor.click();
      await page.keyboard.press('End');
      await page.keyboard.type(' mobile-lab');
      await expect(page.getByTestId('mobile-lab-counts')).toContainText(
        /[1-9]\d* events/
      );
      await page.getByTestId('mobile-lab-snapshot').click();

      const payload = JSON.parse(
        await page.getByTestId('mobile-lab-replay-json').inputValue()
      ) as {
        device: {
          userAgent: string;
          viewport: { height: number; width: number };
        };
        events: Array<{ family: string }>;
        notice: string;
        replay: Array<{ family: string }>;
        snapshots: Array<{
          dom: { html: string; selection: unknown; text: string };
          model: { selection: unknown; text: string; value: unknown };
        }>;
        version: number;
      };

      expect(payload.version).toBe(1);
      expect(payload.notice).toContain('not a raw-device proof');
      expect(payload.device.userAgent).not.toBe('');
      expect(payload.device.viewport.width).toBeGreaterThan(0);
      expect(payload.device.viewport.height).toBeGreaterThan(0);
      expect(payload.events.some(({ family }) => family === 'keydown')).toBe(
        true
      );
      expect(payload.replay.length).toBe(payload.events.length);
      expect(payload.snapshots.at(-1)?.model.text).toContain('mobile-lab');
      expect(payload.snapshots.at(-1)?.model.value).toBeTruthy();
      expect(payload.snapshots.at(-1)?.dom.html).toContain('mobile-lab');
      expect(payload.snapshots.at(-1)?.dom.selection).toBeDefined();
      expect(payload.snapshots.at(-1)?.model.selection).toBeDefined();

      await page.evaluate(() => {
        const { createObjectURL } = URL;

        URL.createObjectURL = (blob) => {
          void blob.text().then((text) => {
            document.documentElement.dataset.mobileLabDownload = text;
          });

          return createObjectURL(blob);
        };
      });
      await page.getByTestId('mobile-lab-export').click();
      await expect
        .poll(() =>
          page
            .locator('html')
            .getAttribute('data-mobile-lab-download')
            .then((value) =>
              value
                ? (
                    JSON.parse(value) as {
                      snapshots: Array<{ label: string }>;
                    }
                  ).snapshots.at(-1)?.label
                : null
            )
        )
        .toBe('export');

      await page.getByTestId('mobile-lab-clear').click();
      await expect(page.getByTestId('mobile-lab-counts')).toHaveText(
        '0 events · 0 snapshots'
      );
      await page.getByTestId('mobile-lab-snapshot').click();
      expect(
        (
          JSON.parse(
            await page.getByTestId('mobile-lab-replay-json').inputValue()
          ) as { snapshots: Array<{ label: string }> }
        ).snapshots.map(({ label }) => label)
      ).toEqual(['manual']);

      await page.evaluate(() => {
        const innerEditor = document.querySelector<HTMLElement>(
          '[data-plite-editor="true"]'
        );
        const clear = document.querySelector<HTMLButtonElement>(
          '[data-test-id="mobile-lab-clear"]'
        );

        innerEditor?.dispatchEvent(
          new KeyboardEvent('keydown', { bubbles: true, key: 'x' })
        );
        clear?.click();
      });
      await page.evaluate(
        () =>
          new Promise<void>((resolve) => {
            requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
          })
      );
      await expect(page.getByTestId('mobile-lab-counts')).toHaveText(
        '0 events · 0 snapshots'
      );
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });
});
