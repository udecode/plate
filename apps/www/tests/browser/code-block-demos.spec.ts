import {
  createPliteBrowserEditorHarness,
  recordPliteBrowserRuntimeErrors,
} from '@platejs/test/playwright';
import { expect, test } from '@playwright/test';

const EDITOR = '.plite-editor';
const EDITABLE_EDITOR = `${EDITOR}[contenteditable="true"]`;
const HUGE_CODE_BLOCK_INDEX = 2;
const LAST_HUGE_LINE = 'const result10000 = transform(source[9999]);';

test.setTimeout(90_000);

test('code-block docs: native preview stays small while CodeMirror scrolls the full document', async ({
  page,
}, testInfo) => {
  const runtimeErrors = recordPliteBrowserRuntimeErrors(page);
  const cdp = await page.context().newCDPSession(page);

  try {
    await page.setViewportSize({ width: 1422, height: 800 });
    await page.goto('/docs/code-block', { waitUntil: 'commit' });
    const native = page.locator('#code-block-huge-demo .plite-editor');
    const scroller = page.locator('#code-block-codemirror-demo .cm-scroller');

    await expect(native).toContainText(
      'const result01000 = transform(source[999]);'
    );
    await expect(scroller).toBeAttached();
    const nativeText = await native.textContent();
    const nativeCode = await native.locator('pre').textContent();
    expect(nativeCode?.split('\n')).toHaveLength(1000);
    expect(await native.locator('*').count()).toBeLessThan(4000);
    await expect(
      page.getByRole('link', { name: 'Open the 10,000-line stress test' })
    ).toHaveAttribute('href', '/blocks/code-block-huge-demo');
    await scroller.evaluate((element) => {
      const demo = element.closest('#code-block-codemirror-demo')!;
      window.scrollTo(
        0,
        demo.getBoundingClientRect().top + window.scrollY - 200
      );
    });
    const afterPaint = () =>
      page.evaluate(
        () =>
          new Promise<void>((resolve) => {
            requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
          })
      );
    await afterPaint();
    await page.mouse.move(700, 550);
    await page.mouse.wheel(0, 240);
    await afterPaint();
    await scroller.evaluate((element) => {
      element.scrollTop = 0;
    });
    await afterPaint();
    await cdp.send('Performance.enable');
    const before = await cdp.send('Performance.getMetrics');

    for (let step = 0; step < 30; step++) {
      await page.mouse.wheel(0, 240);
      await afterPaint();
    }

    const after = await cdp.send('Performance.getMetrics');
    const durations = Object.fromEntries(
      ['TaskDuration', 'RecalcStyleDuration'].map((name) => [
        name,
        after.metrics.find((metric) => metric.name === name)!.value -
          before.metrics.find((metric) => metric.name === name)!.value,
      ])
    );
    await testInfo.attach('docs-scroll-work', {
      body: JSON.stringify(durations, null, 2),
      contentType: 'application/json',
    });

    expect(
      await scroller.evaluate((element) => element.scrollTop)
    ).toBeGreaterThan(7000);
    expect(await native.textContent()).toBe(nativeText);
    expect(await native.locator('*').count()).toBeLessThan(4000);
    expect(await scroller.locator('.cm-line').count()).toBeLessThan(100);
    expect(durations.RecalcStyleDuration).toBeLessThan(0.5);
    expect(durations.TaskDuration).toBeLessThan(2);
    await page.setViewportSize({ width: 390, height: 844 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      )
    ).toBe(true);
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
    await cdp.detach();
  }
});

test('code-block demos: default keeps the small main-style value', async ({
  page,
}, testInfo) => {
  expect(testInfo.retry).toBe(0);
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  const runtimeErrors = recordPliteBrowserRuntimeErrors(page);

  try {
    await page.goto('/blocks/code-block-demo', { waitUntil: 'commit' });

    const root = page.locator(EDITABLE_EDITOR).first();
    const editor = createPliteBrowserEditorHarness(
      page,
      'code-block:default',
      root
    );

    await editor.ready({ editor: 'visible', text: 'JavaScript example' });
    await expect(page.locator('.plite-codeBlock')).toHaveCount(3);
    await expect(
      page.locator('[data-code-block-codemirror-input]')
    ).toHaveCount(0);
    await expect(page.getByText(LAST_HUGE_LINE, { exact: false })).toHaveCount(
      0
    );
    const firstBlock = page.locator('.plite-codeBlock').first();
    const originalPath = Number(
      await firstBlock.getAttribute('data-plite-path')
    );
    const originalCode = await firstBlock.locator('pre').textContent();

    await editor.selection.collapse({ path: [0, 0], offset: 0 });
    await editor.focus();
    await page.keyboard.press('Enter');
    await expect(firstBlock).toHaveAttribute(
      'data-plite-path',
      String(originalPath + 1)
    );
    await firstBlock.getByRole('button', { name: 'Copy', exact: true }).click();
    await expect
      .poll(() => page.evaluate(() => navigator.clipboard.readText()))
      .toBe(originalCode);
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('code-block demos: native Plate owns and edits the exact 10k-line value', async ({
  page,
}, testInfo) => {
  expect(testInfo.retry).toBe(0);
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  const runtimeErrors = recordPliteBrowserRuntimeErrors(page);

  try {
    await page.goto('/blocks/code-block-huge-demo', { waitUntil: 'commit' });

    const root = page.locator(EDITABLE_EDITOR).first();
    const editor = createPliteBrowserEditorHarness(
      page,
      'code-block:native-huge',
      root
    );

    await editor.ready({ editor: 'visible', text: 'Huge Code Block' });

    const block = page.locator('.plite-codeBlock').first();
    const initialText = await editor.get.modelBlockText(HUGE_CODE_BLOCK_INDEX);

    expect(initialText).not.toBeNull();
    expect(initialText?.split('\n')).toHaveLength(10_000);
    expect(initialText).toContain(LAST_HUGE_LINE);
    await expect(block.locator('[data-code-block-codemirror]')).toHaveCount(0);
    await expect(block.locator('[data-plite-node="text"]')).not.toHaveCount(0);
    await expect(block.locator('[class*="hljs-"]').first()).toBeAttached();

    await block.getByRole('button', { name: 'Copy', exact: true }).click();
    await expect
      .poll(() => page.evaluate(() => navigator.clipboard.readText()))
      .toBe(initialText);

    const caret = await block
      .locator('[class*="hljs-"]')
      .first()
      .evaluate((token) => {
        const range = document.createRange();
        range.setStart(token.firstChild!, 1);
        range.collapse(true);
        const rect = range.getBoundingClientRect();
        return { x: rect.x, y: rect.y + rect.height / 2 };
      });
    await page.mouse.click(caret.x, caret.y);
    for (let index = 0; index < 5; index++) {
      await page.keyboard.press('Shift+ArrowRight');
    }
    await editor.assert.selection({
      anchor: { path: [HUGE_CODE_BLOCK_INDEX, 0], offset: 1 },
      focus: { path: [HUGE_CODE_BLOCK_INDEX, 0], offset: 6 },
    });
    await expect
      .poll(() => page.evaluate(() => window.getSelection()?.toString()))
      .toBe(initialText!.slice(1, 6));
    await page.keyboard.press('ControlOrMeta+c');
    await expect
      .poll(() => page.evaluate(() => navigator.clipboard.readText()))
      .toBe(initialText!.slice(1, 6));
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.type('Z');
    await expect
      .poll(() => editor.get.modelBlockText(HUGE_CODE_BLOCK_INDEX))
      .toBe(`cZ${initialText!.slice(1)}`);
    await page.keyboard.press('ControlOrMeta+z');
    await expect
      .poll(() => editor.get.modelBlockText(HUGE_CODE_BLOCK_INDEX))
      .toBe(initialText);

    for (const index of [1, 3]) {
      const paragraph = root.locator(
        `[data-plite-node="element"][data-plite-path="${index}"]`
      );
      const before = await editor.get.modelBlockText(index);
      await paragraph.scrollIntoViewIfNeeded();
      const rect = await paragraph.boundingBox();
      await page.mouse.click(
        rect!.x + rect!.width - 2,
        rect!.y + rect!.height / 2
      );
      await page.keyboard.type('Z');
      await expect
        .poll(() => editor.get.modelBlockText(index))
        .toBe(`${before}Z`);
      await expect
        .poll(() => editor.get.modelBlockText(HUGE_CODE_BLOCK_INDEX))
        .toBe(initialText);
      await page.keyboard.press('ControlOrMeta+z');
      await expect.poll(() => editor.get.modelBlockText(index)).toBe(before);
    }

    const probe = '\nconst __plateNativeDemo = 1;';
    const expectedAfterType = `${initialText}${probe}`;

    await editor.selection.collapse({
      offset: initialText!.length,
      path: [HUGE_CODE_BLOCK_INDEX, 0],
    });
    await editor.focus();
    await expect(root).toBeFocused();
    await page.keyboard.insertText(probe);
    await expect
      .poll(() => editor.get.modelBlockText(HUGE_CODE_BLOCK_INDEX))
      .toBe(expectedAfterType);

    await page.keyboard.press('ControlOrMeta+z');
    await expect
      .poll(() => editor.get.modelBlockText(HUGE_CODE_BLOCK_INDEX))
      .toBe(initialText);
    await page.keyboard.press('ControlOrMeta+Shift+z');
    await expect
      .poll(() => editor.get.modelBlockText(HUGE_CODE_BLOCK_INDEX))
      .toBe(expectedAfterType);

    await editor.ime.compose({
      committedText: 'すし',
      steps: ['す', 'すし'],
      text: 'すし',
      transport: 'synthetic',
    });
    const expectedAfterIME = `${expectedAfterType}すし`;

    const actualAfterIME = await editor.get.modelBlockText(
      HUGE_CODE_BLOCK_INDEX
    );
    await testInfo.attach('native-code-ime-result', {
      body: JSON.stringify({
        actualLength: actualAfterIME?.length,
        actualTail: actualAfterIME?.slice(-100),
        expectedLength: expectedAfterIME.length,
        expectedTail: expectedAfterIME.slice(-100),
      }),
      contentType: 'application/json',
    });

    await expect
      .poll(() => editor.get.modelBlockText(HUGE_CODE_BLOCK_INDEX))
      .toBe(expectedAfterIME);

    await page.getByText('Editing', { exact: true }).click();
    await page
      .getByRole('menuitemradio', { exact: true, name: 'Viewing' })
      .click();
    await expect(page.locator(EDITOR).first()).toHaveAttribute(
      'data-readonly',
      'true'
    );
    await expect(page.locator(EDITOR).first()).toHaveAttribute(
      'aria-readonly',
      'true'
    );
    await page.locator(EDITOR).first().focus();
    await page.keyboard.insertText('READ_ONLY_MUTATION');
    await expect
      .poll(() => editor.get.modelBlockText(HUGE_CODE_BLOCK_INDEX))
      .toBe(expectedAfterIME);
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});
