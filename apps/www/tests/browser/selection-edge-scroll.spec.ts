import { expect, test, type Locator } from '@playwright/test';

import type { PliteBrowserHandleElement } from '../../../../packages/plitejs/src/react/editable/browser-handle';
import { recordBrowserRuntimeErrors } from '../../../../packages/test/src/playwright/runtime-errors';

const readSelection = (root: Locator) =>
  root.evaluate((el: PliteBrowserHandleElement) => ({
    scrollTop: el.closest('.overflow-y-auto')!.scrollTop,
    maxScrollTop:
      el.closest('.overflow-y-auto')!.scrollHeight -
      el.closest('.overflow-y-auto')!.clientHeight,
    selection: el.__pliteBrowserHandle?.getModelSelection(),
    native: window.getSelection()?.toString(),
  }));

test('uses the upstream distance-based block selection scroll speed', async ({
  page,
}) => {
  const errors = recordBrowserRuntimeErrors(page);
  try {
    await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
    await page.goto('/blocks/playground');
    const heading = page.getByRole('heading', {
      name: 'AI-Powered Editing',
      exact: true,
    });
    await expect(heading).toBeVisible();
    const root = page
      .locator('[data-editor="true"][contenteditable="true"]')
      .first();
    const scroller = root.locator(
      'xpath=ancestor::*[contains(@class,"overflow-y-auto")][1]'
    );
    const speeds = [];
    for (const distance of [45, 20, 2]) {
      await scroller.evaluate((el) => {
        el.scrollTop = 0;
      });
      const headingBox = await heading.boundingBox();
      const bounds = await scroller.boundingBox();
      if (!headingBox || !bounds) throw new Error('Missing drag geometry');
      await page.mouse.move(headingBox.x - 75, headingBox.y + 2);
      await page.mouse.down();
      await page.mouse.move(
        headingBox.x + 120,
        Math.min(720, bounds.y + bounds.height) - distance,
        { steps: 12 }
      );
      const start = await scroller.evaluate((el) => ({
        time: performance.now(),
        top: el.scrollTop,
      }));
      await page.waitForTimeout(250);
      const end = await scroller.evaluate((el) => ({
        time: performance.now(),
        top: el.scrollTop,
      }));
      speeds.push((end.top - start.top) / (end.time - start.time));
      await page.mouse.up();
      await page.keyboard.press('Escape');
    }
    expect(speeds[0], 'Outside the 40px edge zone does not scroll').toBe(0);
    expect(
      speeds[1],
      'Mid-edge scrolling matches the upstream speed'
    ).toBeGreaterThan(1.3);
    expect(speeds[1]).toBeLessThan(2.1);
    expect(
      speeds[2],
      'Moving nearer the edge accelerates block selection'
    ).toBeGreaterThan(speeds[1] * 1.5);
    expect(speeds[2]).toBeLessThan(4.1);
    errors.assertNone();
  } finally {
    await page.mouse.up();
    errors.stop();
  }
});

for (const kind of ['text', 'blocks'] as const) {
  for (const direction of ['down', 'up'] as const) {
    test(`${kind} selection keeps scrolling with a stationary pointer ${direction}`, async ({
      page,
    }, testInfo) => {
      const errors = recordBrowserRuntimeErrors(page);
      await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
      await page.goto('/blocks/playground');
      const root = page
        .locator('[data-editor="true"][contenteditable="true"]')
        .first();
      const heading = page.getByRole('heading', {
        name: direction === 'up' ? 'Dates and Equations' : 'AI-Powered Editing',
        exact: true,
      });
      await expect(heading).toBeVisible();
      const scroller = root.locator(
        'xpath=ancestor::*[contains(@class,"overflow-y-auto")][1]'
      );
      if (direction === 'up') {
        await heading.evaluate((el) => el.scrollIntoView({ block: 'center' }));
      }
      const box = await heading.boundingBox();
      const bounds = await scroller.boundingBox();
      if (!box || !bounds) throw new Error('Missing drag geometry');
      const start = {
        x: box.x + (kind === 'blocks' ? -75 : 60),
        y: box.y + box.height / 2,
      };
      const end = {
        x: box.x + 120,
        y:
          direction === 'down'
            ? Math.min(718, bounds.y + bounds.height - 2)
            : bounds.y + 2,
      };
      try {
        await page.mouse.move(start.x, start.y);
        await page.mouse.down();
        await page.mouse.move(end.x, end.y, { steps: 16 });
        const initial = await readSelection(root);
        const samples = [];
        for (let i = 0; i < 5; i++) {
          await page.waitForTimeout(200);
          samples.push(await readSelection(root));
        }
        await page.screenshot({ path: testInfo.outputPath('held-edge.png') });
        await testInfo.attach('samples', {
          body: JSON.stringify(samples, null, 2),
          contentType: 'application/json',
        });
        console.info(
          kind,
          direction,
          JSON.stringify(samples.map((sample) => sample.scrollTop))
        );
        if (direction === 'down') {
          expect(samples.at(-1)!.scrollTop).toBeGreaterThan(
            samples[0].scrollTop + 50
          );
        } else {
          expect(samples.at(-1)!.scrollTop).toBeLessThan(
            samples[0].scrollTop - 20
          );
        }
        for (let i = 1; i < samples.length; i++) {
          const previous = samples[i - 1];
          const sample = samples[i];
          const movement =
            direction === 'down'
              ? sample.scrollTop - previous.scrollTop
              : previous.scrollTop - sample.scrollTop;
          if (
            sample.scrollTop ===
            (direction === 'down' ? sample.maxScrollTop : 0)
          ) {
            expect(movement).toBeGreaterThanOrEqual(0);
          } else {
            expect(movement).toBeGreaterThan(0);
          }
          if (kind === 'blocks') {
            expect(sample.selection?.kind).toBe('node');
            if (
              sample.selection?.kind !== 'node' ||
              initial.selection?.kind !== 'node'
            ) {
              throw new Error('Expected block selection');
            }
            expect(sample.selection.anchorPath).toEqual(
              initial.selection.anchorPath
            );
            for (const path of initial.selection.paths) {
              expect(sample.selection.paths).toContainEqual(path);
            }
            expect(sample.native).toBe('');
          } else {
            expect(sample.selection?.kind).toBe('text');
            if (
              sample.selection?.kind !== 'text' ||
              initial.selection?.kind !== 'text'
            ) {
              throw new Error('Expected text selection');
            }
            expect(sample.selection.anchor).toEqual(initial.selection.anchor);
            expect(sample.native!.length).toBeGreaterThan(0);
          }
        }
        const atEdge = samples.at(-1)!;
        if (
          atEdge.selection?.kind === 'node' &&
          initial.selection?.kind === 'node'
        ) {
          expect(atEdge.selection.focusPath).not.toEqual(
            initial.selection.focusPath
          );
          expect(atEdge.selection.paths.length).toBeGreaterThan(
            initial.selection.paths.length
          );
        } else if (
          atEdge.selection?.kind === 'text' &&
          initial.selection?.kind === 'text'
        ) {
          expect(atEdge.selection.focus).not.toEqual(initial.selection.focus);
          expect(atEdge.native!.length).toBeGreaterThan(initial.native!.length);
        } else {
          throw new Error('Selection kind changed during edge scrolling');
        }
        await page.mouse.move(
          end.x,
          direction === 'down'
            ? bounds.y + 2
            : Math.min(718, bounds.y + bounds.height - 2),
          { steps: 8 }
        );
        await expect
          .poll(async () => {
            const snapshot = await readSelection(root);
            const current = snapshot.scrollTop;
            return direction === 'down'
              ? atEdge.scrollTop - current
              : current - atEdge.scrollTop;
          })
          .toBeGreaterThan(50);
        await page.mouse.up();
        await page.waitForTimeout(100);
        const released = await readSelection(root);
        await page.waitForTimeout(250);
        expect(await readSelection(root)).toEqual(released);
        if (kind === 'blocks') {
          await expect(
            page.locator('[data-slot="node-selection-drag"]')
          ).toHaveCount(0);
        }
        errors.assertNone();
      } finally {
        await page.mouse.up();
        errors.stop();
      }
    });
  }
}

test('block marquee stays inside the editor viewport', async ({
  page,
}, testInfo) => {
  await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
  await page.goto('/blocks/playground');
  const heading = page.getByRole('heading', {
    name: 'AI-Powered Editing',
    exact: true,
  });
  await expect(heading).toBeVisible();
  const box = await heading.boundingBox();
  if (!box) throw new Error('Missing heading');
  await page.mouse.move(box.x - 75, box.y + box.height / 2);
  await page.mouse.down();
  try {
    await page.mouse.move(box.x + 180, 4, { steps: 15 });
    await page.waitForTimeout(100);
    await page.screenshot({ path: testInfo.outputPath('marquee-top.png') });
    const rect = await page
      .locator('[data-slot="node-selection-drag"]')
      .boundingBox();
    const scroller = await page
      .locator('[data-editor="true"][contenteditable="true"]')
      .first()
      .evaluate(
        (el) => el.closest('.overflow-y-auto')!.getBoundingClientRect().top
      );
    expect(rect!.y).toBeGreaterThanOrEqual(scroller);
    await page.mouse.move(1, 718, { steps: 12 });
    await expect
      .poll(async () => {
        const marquee = await page
          .locator('[data-slot="node-selection-drag"]')
          .boundingBox();
        return marquee && marquee.x >= 0 && marquee.y + marquee.height <= 720;
      })
      .toBe(true);
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-slot="node-selection-drag"]')).toHaveCount(
      0
    );
    const root = page
      .locator('[data-editor="true"][contenteditable="true"]')
      .first();
    const stopped = await readSelection(root);
    await page.waitForTimeout(200);
    expect(await readSelection(root)).toEqual(stopped);
  } finally {
    await page.mouse.up();
  }
});
