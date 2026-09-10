import { createPliteBrowserEditorHarness } from '@platejs/test/playwright';
import { expect, test } from '@playwright/test';

for (const mode of ['native', 'event'] as const) {
  test(`HTML clipboard preserves heading, bold and link via ${mode}`, async ({
    context,
    page,
  }, testInfo) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/blocks/html-demo');
    const root = page.locator('[contenteditable="true"]');
    const editor = createPliteBrowserEditorHarness(
      page,
      'html-clipboard',
      root
    );
    await editor.ready({ editor: 'visible', text: 'HTML' });
    await root.getByRole('heading', { name: 'HTML', exact: true }).click();
    await root.press('ControlOrMeta+A');

    const html =
      '<h2>Clipboard Heading</h2><p><strong>Clipboard bold</strong> and <a href="https://example.com">reference</a></p>';
    const text = 'Clipboard Heading\nClipboard bold and reference';
    const before = await editor.get.modelText();
    await page.evaluate(() => {
      const target = window as Window & { __plateClipboardProof?: unknown };
      document.addEventListener(
        'paste',
        (event) => {
          target.__plateClipboardProof = {
            trusted: event.isTrusted,
            types: [...(event.clipboardData?.types ?? [])],
            html: event.clipboardData?.getData('text/html'),
            text: event.clipboardData?.getData('text/plain'),
          };
        },
        { once: true, capture: true }
      );
    });

    if (mode === 'native') {
      await page.evaluate(
        async ({ html: markup, text: plain }) => {
          await navigator.clipboard.write([
            new ClipboardItem({
              'text/html': new Blob([markup], { type: 'text/html' }),
              'text/plain': new Blob([plain], { type: 'text/plain' }),
            }),
          ]);
        },
        { html, text }
      );
      await root.press('ControlOrMeta+V');
    } else {
      await editor.clipboard.pasteEventPayload({ html, text });
    }

    try {
      await expect(
        root.getByRole('heading', { name: 'Clipboard Heading', exact: true })
      ).toBeVisible();
      await expect(root.locator('strong')).toHaveText('Clipboard bold');
      await expect(
        root.getByRole('link', { name: 'reference', exact: true })
      ).toHaveAttribute('href', 'https://example.com/');
      expect(
        await page.evaluate(
          () =>
            (
              window as Window & {
                __plateClipboardProof?: { trusted: boolean; types: string[] };
              }
            ).__plateClipboardProof
        )
      ).toMatchObject({
        trusted: mode === 'native',
        types: expect.arrayContaining(['text/html', 'text/plain']),
      });
    } finally {
      const event = await page.evaluate(
        () =>
          (window as Window & { __plateClipboardProof?: unknown })
            .__plateClipboardProof
      );
      await testInfo.attach('paste-input.json', {
        body: JSON.stringify(
          {
            mode,
            before,
            event,
            rendered: await root.innerText(),
            model: await editor.get.modelText(),
          },
          null,
          2
        ),
        contentType: 'application/json',
      });
    }
  });
}
