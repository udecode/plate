import {
  createPliteBrowserEditorHarness,
  recordPliteBrowserRuntimeErrors,
} from '@platejs/test/playwright';
import { expect, test } from '@playwright/test';
import type { Value } from 'platejs';

type BrowserHandleElement = HTMLElement & {
  __pliteBrowserHandle: {
    applyValueChange: (
      value: { children: Value },
      policy?: { tags: string[] }
    ) => void;
    insertTextAt: (
      text: string,
      point: { path: number[]; offset: number },
      policy?: { tags: string[] }
    ) => void;
  };
};

test('code-block: native and CodeMirror views share edits, neutral paint and language changes', async ({
  page,
}, info) => {
  expect(info.retry).toBe(0);
  const errors = recordPliteBrowserRuntimeErrors(page);
  try {
    await page.goto('/blocks/code-block-views-demo', { waitUntil: 'commit' });
    const external = page.getByRole('region', { name: 'CodeMirror view' });
    const native = page.getByRole('region', { name: 'Native view' });
    const root = external.locator('.plite-editor');
    const editor = createPliteBrowserEditorHarness(
      page,
      'code-block:mixed-views',
      root
    );
    await editor.ready({ editor: 'visible', text: 'const shared' });
    const host = external.locator('[data-code-block-codemirror]');
    const input = host.locator('[data-code-block-codemirror-input]');
    const nativeText = native.locator('pre code');
    const original = await editor.get.modelBlockText(0);
    await expect(nativeText).toHaveText(original!);
    await expect
      .poll(() => native.locator('[data-code-block-syntax]').count())
      .toBeGreaterThan(0);
    await expect(host.locator('[data-code-block-syntax]')).toHaveCount(0);
    await expect
      .poll(() => host.locator('.hljs-keyword').count())
      .toBeGreaterThan(0);
    for (const view of [host, native]) {
      await expect
        .poll(() => view.locator('[data-code-note]').count())
        .toBeGreaterThan(0);
      await expect
        .poll(() => view.locator('[data-code-search]').count())
        .toBeGreaterThan(0);
      await expect
        .poll(() =>
          view
            .locator(
              '[data-code-note] [data-code-search], [data-code-search] [data-code-note], [data-code-note][data-code-search]'
            )
            .count()
        )
        .toBeGreaterThan(0);
    }
    await info.attach('mixed-views-desktop', {
      body: await page.screenshot(),
      contentType: 'image/png',
    });
    await editor.selection.collapse({ path: [0, 0], offset: original!.length });
    await editor.focus();
    await page.keyboard.type(' // shared edit');
    await expect(nativeText).toHaveText(`${original} // shared edit`);
    await page.keyboard.press('ControlOrMeta+z');
    await expect.poll(() => editor.get.modelBlockText(0)).toBe(original);
    await expect(nativeText).toHaveText(original!);
    await input.dispatchEvent('compositionstart', { data: '' });
    await root.evaluate((element) => {
      (element as BrowserHandleElement).__pliteBrowserHandle.insertTextAt(
        'REMOTE:',
        { path: [0, 0], offset: 0 },
        { tags: ['remote'] }
      );
    });
    await input.dispatchEvent('compositionend', { data: '' });
    await expect(input).toContainText('REMOTE:');
    await expect(nativeText).toHaveText(`REMOTE:${original}`);
    await editor.selection.collapse({
      path: [0, 0],
      offset: 7 + original!.length,
    });
    await editor.focus();
    await page.keyboard.type('!');
    await expect
      .poll(() => editor.get.modelBlockText(0))
      .toBe(`REMOTE:${original}!`);

    await input.dispatchEvent('compositionstart', { data: '' });
    await root.evaluate((element) => {
      (element as BrowserHandleElement).__pliteBrowserHandle.applyValueChange(
        {
          children: [
            {
              type: 'codeBlock',
              language: 'python',
              children: [{ text: 'def shared():\n    return 2' }],
            },
          ],
        },
        { tags: ['remote'] }
      );
    });
    await input.dispatchEvent('compositionend', { data: '' });
    await expect(nativeText).toHaveText('def shared():\n    return 2');
    await expect(input).toContainText('def shared():');
    await expect(
      host.locator('.cm-line').first().locator('.hljs-keyword')
    ).toHaveText('def');
    await expect(host).toHaveAttribute('data-language', 'python');
    await external.getByRole('combobox').click();
    await expect(
      page.getByRole('option', { name: 'Auto', exact: true })
    ).toHaveCount(0);
    await page.getByRole('option', { name: 'Plain Text', exact: true }).click();
    await expect.poll(() => host.locator('[class*="hljs-"]').count()).toBe(0);
    await expect
      .poll(() => native.locator('[data-code-block-syntax]').count())
      .toBe(0);
    await expect
      .poll(() => host.locator('[data-code-note]').count())
      .toBeGreaterThan(0);
    await expect
      .poll(() => host.locator('[data-code-search]').count())
      .toBeGreaterThan(0);
    await page.setViewportSize({ width: 390, height: 844 });
    const externalBox = await external.boundingBox();
    const nativeBox = await native.boundingBox();
    expect(nativeBox!.y).toBeGreaterThanOrEqual(
      externalBox!.y + externalBox!.height
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      )
    ).toBe(true);
    await info.attach('mixed-views-mobile', {
      body: await page.screenshot(),
      contentType: 'image/png',
    });
    errors.assertNone();
  } finally {
    errors.stop();
  }
});
