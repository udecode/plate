import { writeFileSync } from 'node:fs';

import {
  createPliteBrowserEditorHarness,
  recordPliteBrowserRuntimeErrors,
} from '@platejs/test/playwright';
import { expect, test } from '@playwright/test';
import type { Value } from 'platejs';

for (const [lines, width] of [
  [1000, 1280],
  [10_000, 390],
]) {
  test(`native code keeps continuous input, replacement history and caret geometry at ${lines} lines`, async ({
    page,
  }, info) => {
    test.setTimeout(120_000);
    const errors = recordPliteBrowserRuntimeErrors(page);
    try {
      await page.setViewportSize({ width, height: 844 });
      await page.goto('/blocks/code-block-huge-demo', { waitUntil: 'commit' });
      const root = page.locator('.plite-editor');
      const editor = createPliteBrowserEditorHarness(
        page,
        'code-block:native-continuous',
        root
      );
      await editor.ready({ editor: 'visible', text: 'Huge Code Block' });
      const initial = (await editor.get.modelBlockText(2))!
        .split('\n')
        .slice(0, lines)
        .join('\n');
      const prefix = `${initial}\nconst __continuous = `;
      await root.evaluate((element, text) => {
        const handle = (
          element as HTMLElement & {
            __pliteBrowserHandle: {
              getValue: () => { children: Value };
              applyValueChange: (value: { children: Value }) => void;
            };
          }
        ).__pliteBrowserHandle;
        const value = handle.getValue();
        handle.applyValueChange({
          ...value,
          children: value.children.map((block, index) =>
            index === 2 ? { ...block, children: [{ text }] } : block
          ),
        });
      }, prefix);
      const code = root.locator('pre code');
      await expect(code).toHaveText(prefix);
      await editor.selection.collapse({ path: [2, 0], offset: prefix.length });
      await editor.focus();
      await root.evaluate((element) => {
        const events: Array<{
          time: number;
          trusted: boolean;
          data: string | null;
        }> = [];
        const capture = (event: Event) => {
          const input = event as InputEvent;
          events.push({
            time: performance.now(),
            trusted: input.isTrusted,
            data: input.data,
          });
        };
        Object.assign(element, { __continuousProof: { events, capture } });
        element.addEventListener('beforeinput', capture, true);
      });
      const digits = '1234567890123456789012345678901234567890';
      await page.keyboard.type(digits, { delay: 12 });
      const expected = prefix + digits;
      await expect.poll(() => editor.get.modelBlockText(2)).toBe(expected);
      await expect(code).toHaveText(expected);
      await expect(code.locator('.hljs-number').last()).toHaveText(digits);
      const events = await root.evaluate((element) => {
        const proof = (
          element as HTMLElement & {
            __continuousProof: {
              events: Array<{
                time: number;
                trusted: boolean;
                data: string | null;
              }>;
              capture: EventListener;
            };
          }
        ).__continuousProof;
        element.removeEventListener('beforeinput', proof.capture, true);
        return proof.events;
      });
      expect(events).toHaveLength(digits.length);
      expect(events.every((event) => event.trusted)).toBe(true);
      expect(events.map((event) => event.data).join('')).toBe(digits);
      await info.attach('continuous-input-events', {
        body: JSON.stringify({
          lines,
          width,
          events,
          deliveredIntervalsMs: events
            .slice(1)
            .map((event, index) => event.time - events[index].time),
        }),
        contentType: 'application/json',
      });
      await editor.selection.select({
        anchor: { path: [2, 0], offset: prefix.length },
        focus: { path: [2, 0], offset: expected.length },
      });
      await expect
        .poll(() => page.evaluate(() => window.getSelection()?.toString()))
        .toBe(digits);
      await page.keyboard.insertText('7');
      await expect(code).toHaveText(`${prefix}7`);
      await expect(code.locator('.hljs-number').last()).toHaveText('7');
      await page.keyboard.press('ControlOrMeta+z');
      await expect.poll(() => editor.get.modelBlockText(2)).toBe(expected);
      await expect(code.locator('.hljs-number').last()).toHaveText(digits);
      await editor.assert.selection({
        anchor: { path: [2, 0], offset: prefix.length },
        focus: { path: [2, 0], offset: expected.length },
      });
      await expect
        .poll(() => page.evaluate(() => window.getSelection()?.toString()))
        .toBe(digits);
      await page.keyboard.press('ControlOrMeta+Shift+z');
      await expect.poll(() => editor.get.modelBlockText(2)).toBe(`${prefix}7`);
      await expect(code.locator('.hljs-number').last()).toHaveText('7');
      await editor.assert.selection({
        anchor: { path: [2, 0], offset: prefix.length + 1 },
        focus: { path: [2, 0], offset: prefix.length + 1 },
      });
      await page.keyboard.type('8');
      await expect(code.locator('.hljs-number').last()).toHaveText('78');
      await expect.poll(() => editor.get.modelBlockText(2)).toBe(`${prefix}78`);
      const geometry = await code.evaluate((element) => {
        const selection = window.getSelection();
        if (
          !selection?.isCollapsed ||
          !selection.anchorNode ||
          !element.contains(selection.anchorNode)
        ) {
          return null;
        }
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const offset = document.createRange();
        offset.selectNodeContents(element);
        offset.setEnd(selection.anchorNode, selection.anchorOffset);
        return {
          offset: offset.toString().length,
          x: rect.x,
          y: rect.y,
          height: rect.height,
          viewportHeight: innerHeight,
          viewportWidth: innerWidth,
        };
      });
      expect(geometry?.offset).toBe(prefix.length + 2);
      expect(geometry!.height).toBeGreaterThan(0);
      expect(geometry!.x).toBeGreaterThanOrEqual(0);
      expect(geometry!.x).toBeLessThan(geometry!.viewportWidth);
      expect(geometry!.y).toBeGreaterThanOrEqual(0);
      expect(geometry!.y).toBeLessThan(geometry!.viewportHeight);
      await info.attach('native-caret-geometry', {
        body: JSON.stringify(geometry),
        contentType: 'application/json',
      });
      await info.attach('native-continuous-final', {
        body: await page.screenshot(),
        contentType: 'image/png',
      });
      errors.assertNone();
    } finally {
      errors.stop();
    }
  });
}

for (const width of [1280, 390]) {
  test(`native syntax follows its block after insertion at width ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/blocks/code-block-demo', { waitUntil: 'commit' });
    const root = page.locator('.plite-editor');
    const editor = createPliteBrowserEditorHarness(
      page,
      'code-block:syntax-move',
      root
    );
    await editor.ready({ editor: 'visible', text: 'Code Blocks' });
    const code = root.locator('pre').first();
    await expect(code.locator('.hljs-keyword').first()).toBeVisible();
    const codeText = await code.textContent();
    await editor.selection.collapse({ path: [0, 0], offset: 0 });
    await editor.focus();
    await page.keyboard.press('Enter');
    const paragraph = root.locator(
      '[data-plite-node="element"][data-plite-path="2"]'
    );
    await expect(paragraph).toContainText('Showcase your code');
    await expect(paragraph.locator('[data-code-block-syntax]')).toHaveCount(0);
    await expect(code).toHaveText(codeText!);
    await expect(code.locator('.hljs-keyword').first()).toHaveText('async');
    await expect(
      code.locator('xpath=ancestor::*[@data-plite-path][1]')
    ).toHaveAttribute('data-plite-path', '3');
  });
}

test('native huge code keeps hover and adjacent typing bounded', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 2005, height: 1169 });
  await page.goto('/blocks/code-block-huge-demo', { waitUntil: 'commit' });
  const editor = page.locator('.plite-editor');
  const harness = createPliteBrowserEditorHarness(
    page,
    'code-block:native-interactions',
    editor
  );
  await harness.ready({ editor: 'visible', text: 'Huge Code Block' });
  await expect(editor).toContainText(
    'const result10000 = transform(source[9999]);'
  );
  const code = editor.locator('pre');
  await expect.poll(() => code.locator('*').count()).toBeGreaterThan(30_000);
  const beforeText = await code.textContent();
  const beforeNodes = await code.locator('*').count();
  expect(beforeNodes).toBeGreaterThan(30_000);
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Performance.enable');
  const afterPaint = () =>
    page.evaluate(
      () =>
        new Promise<void>((resolve) => {
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
        })
    );
  const packets = [];
  for (const x of [1500, 1000, 1500, 1000]) {
    const before = await cdp.send('Performance.getMetrics');
    await page.mouse.move(x, 400);
    await afterPaint();
    const after = await cdp.send('Performance.getMetrics');
    packets.push(
      Object.fromEntries(
        ['TaskDuration', 'RecalcStyleDuration'].map((name) => [
          name,
          after.metrics.find((m) => m.name === name)!.value -
            before.metrics.find((m) => m.name === name)!.value,
        ])
      )
    );
  }
  writeFileSync(
    testInfo.outputPath('native-interactions.json'),
    JSON.stringify(packets, null, 2)
  );
  await testInfo.attach('native-interactions', {
    path: testInfo.outputPath('native-interactions.json'),
    contentType: 'application/json',
  });
  expect(Math.max(...packets.map((p) => p.RecalcStyleDuration))).toBeLessThan(
    0.1
  );

  for (const path of ['1', '3']) {
    const paragraph = editor.locator(
      `[data-plite-node="element"][data-plite-path="${path}"]`
    );
    const before = await paragraph.textContent();
    await paragraph.scrollIntoViewIfNeeded();
    const rect = await paragraph.boundingBox();
    await page.mouse.click(
      rect!.x + rect!.width - 2,
      rect!.y + rect!.height / 2
    );
    await page.keyboard.type('Z');
    await expect(paragraph).toHaveText(`${before}Z`);
    await page.keyboard.press('ControlOrMeta+z');
    await expect(paragraph).toHaveText(before!);
  }
  expect(await code.textContent()).toBe(beforeText);
  expect(await code.locator('*').count()).toBe(beforeNodes);
  await cdp.detach();
});
