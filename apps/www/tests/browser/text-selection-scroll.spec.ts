import { expect, test, type Locator, type Page } from '@playwright/test';

import type { PliteBrowserHandleElement } from '../../../../packages/plitejs/src/react/editable/browser-handle';
import type { PliteViewSelection } from '../../../../packages/plitejs/src/react/view-selection';
import { recordBrowserRuntimeErrors } from '../../../../packages/test/src/playwright/runtime-errors';

type SelectionPaintProbe = {
  stopped: boolean;
  missing: number;
  doubled: number;
  frames: number;
};
type ObservedEditor = PliteBrowserHandleElement & {
  selectionPaintProbe?: SelectionPaintProbe;
};

const readSelection = (root: Locator) =>
  root.evaluate((element) => {
    const selection = window.getSelection();
    const scroller = element.closest('.overflow-y-auto');
    if (!scroller) throw new Error('Missing editor scroller');
    const focus = selection?.focusNode ? document.createRange() : null;
    if (focus && selection?.focusNode) {
      focus.setStart(selection.focusNode, selection.focusOffset);
      focus.collapse(true);
    }
    const rect = focus?.getBoundingClientRect();
    const viewport = scroller.getBoundingClientRect();
    return {
      anchor: selection?.anchorNode?.parentElement
        ?.closest('[data-editor-path]')
        ?.getAttribute('data-editor-path'),
      offset: selection?.anchorOffset ?? -1,
      collapsed: selection?.isCollapsed ?? true,
      blocks: element.querySelectorAll('[data-slot="node-selection-highlight"]')
        .length,
      focused: document.activeElement === element,
      scrollTop: scroller.scrollTop,
      visible:
        !!rect &&
        rect.height > 0 &&
        rect.top >= viewport.top - 2 &&
        rect.bottom <= Math.min(viewport.bottom, window.innerHeight) + 2,
    };
  });
const extend = async (
  page: Page,
  root: Locator,
  key: string,
  count: number
) => {
  const initial = await readSelection(root);
  const expected = {
    anchor: initial.anchor,
    offset: initial.offset,
    visible: true,
    blocks: 0,
  };
  await page.keyboard.down('Shift');
  try {
    for (let index = 0; index < count; index++) {
      await page.keyboard.press(key);
      await expect
        .poll(() => readSelection(root), {
          message: `${key} step ${index + 1} keeps the text anchor and visible focus`,
        })
        .toMatchObject(expected);
    }
  } finally {
    await page.keyboard.up('Shift');
  }
  await expect
    .poll(() => readSelection(root))
    .toMatchObject({
      ...expected,
      collapsed: false,
    });
};
test('keeps ordinary text selection scrolling in both directions', async ({
  page,
}) => {
  test.setTimeout(120_000);
  const errors = recordBrowserRuntimeErrors(page);
  try {
    await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
    await page.goto('/blocks/details-demo');
    const root = page
      .locator('[data-editor="true"][contenteditable="true"]')
      .first();
    await root.click();
    await page.keyboard.press('ControlOrMeta+a');
    await page.keyboard.press('Backspace');
    for (let index = 1; index <= 40; index++) {
      await page.keyboard.type(
        `Row ${index} plain text selection scrolling check.`
      );
      if (index < 40) await page.keyboard.press('Enter');
    }
    for (const [index, key] of [
      [2, 'ArrowDown'],
      [38, 'ArrowUp'],
    ] as const) {
      const row = page.getByText(
        `Row ${index} plain text selection scrolling check.`,
        { exact: true }
      );
      await row.evaluate((element) =>
        element.scrollIntoView({ block: 'center', behavior: 'instant' })
      );
      await row.dblclick({ position: { x: 70, y: 10 } });
      const before = await readSelection(root);
      expect(before.collapsed).toBe(false);
      await extend(page, root, key, 25);
      const after = await readSelection(root);
      expect(after.anchor).toBe(before.anchor);
      expect(after.offset).toBe(before.offset);
      if (key === 'ArrowDown') {
        expect(after.scrollTop).toBeGreaterThan(before.scrollTop);
      } else expect(after.scrollTop).toBeLessThan(before.scrollTop);
    }
    errors.assertNone();
  } finally {
    errors.stop();
  }
});

for (const start of [
  'authored text',
  'first column',
  'second column line end',
  'second column line end in a short viewport',
]) {
  test(`keeps repeated text selection moving to both scroll limits from ${start}`, async ({
    page,
  }, info) => {
    test.setTimeout(120_000);
    const errors = recordBrowserRuntimeErrors(page);
    try {
      await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
      await page.setViewportSize({
        width: 1276,
        height: start.includes('short viewport') ? 160 : 820,
      });
      await page.goto('/blocks/playground');
      await page.getByRole('img', { name: /^code drawing$/i }).waitFor();
      await page.evaluate(() => document.fonts.ready);
      const root = page
        .locator('[data-editor="true"][contenteditable="true"]')
        .first();
      await expect
        .poll(
          () =>
            root
              .locator('img')
              .evaluateAll((images: HTMLImageElement[]) =>
                images.every((image) => image.complete)
              ),
          { timeout: 30_000 }
        )
        .toBe(true);
      const paragraph = page
        .getByText(
          start === 'authored text'
            ? 'Experience a modern rich-text editor built with'
            : start === 'first column'
              ? 'First column content. Great for side-by-side comparisons.'
              : 'Second column content. Layout flexibility at its best.',
          { exact: start !== 'authored text' }
        )
        .first();
      await paragraph.scrollIntoViewIfNeeded();
      if (start.startsWith('second column line end')) {
        const box = await paragraph.boundingBox();
        expect(box).not.toBeNull();
        await paragraph.click({ position: { x: box!.width - 8, y: 10 } });
      } else {
        await paragraph.dblclick({ position: { x: 40, y: 10 } });
      }
      const read = () =>
        root.evaluate((element: PliteBrowserHandleElement) => {
          const handle = element.__pliteBrowserHandle!;
          const view = handle.getViewSelection() as PliteViewSelection | null;
          const model = handle.getSelection();
          const scroller = element.closest('.overflow-y-auto')!;
          const native = window.getSelection();
          return {
            anchor: view?.anchor.point ?? model?.anchor,
            focus: view?.focus.point ?? model?.focus,
            dom: handle.getDOMSelection(),
            focused: document.activeElement === element,
            scroll: scroller.scrollTop,
            max: scroller.scrollHeight - scroller.clientHeight,
            native: !!native && !native.isCollapsed,
            projected:
              element.querySelectorAll('[data-editor-view-selection]').length >
              0,
          };
        });
      await expect
        .poll(async () => {
          const selection = await read();
          return (
            selection.focused &&
            JSON.stringify(selection.focus?.path) ===
              JSON.stringify(selection.dom?.focus.path) &&
            selection.focus?.offset === selection.dom?.focus.offset
          );
        })
        .toBe(true);
      const initial = await read();
      await root.evaluate((element: ObservedEditor) => {
        const probe = { stopped: false, missing: 0, doubled: 0, frames: 0 };
        element.selectionPaintProbe = probe;
        const sample = () => {
          if (probe.stopped) return;
          const view =
            element.__pliteBrowserHandle!.getViewSelection() as PliteViewSelection | null;
          const expanded =
            view &&
            (view.anchor.point.offset !== view.focus.point.offset ||
              view.anchor.point.path.join(',') !==
                view.focus.point.path.join(','));
          if (expanded) {
            probe.frames += 1;
            const native = window.getSelection();
            const painted = !!native && !native.isCollapsed;
            const projected = !!element.querySelector(
              '[data-editor-view-selection]'
            );
            if (!painted && !projected) probe.missing += 1;
            if (painted && projected) probe.doubled += 1;
          }
          requestAnimationFrame(sample);
        };
        requestAnimationFrame(sample);
      });
      for (const cadence of [30, 0]) {
        for (const key of ['ArrowDown', 'ArrowUp']) {
          const samples: Array<Awaited<ReturnType<typeof read>>> = [];
          await page.keyboard.down('Shift');
          try {
            for (let index = 0; index < 120; index++) {
              await page.keyboard.down(key);
              if (cadence) await page.waitForTimeout(cadence);
              samples.push(await read());
            }
          } finally {
            await page.keyboard.up(key);
            await page.keyboard.up('Shift');
          }
          await info.attach(`${cadence}-${key}`, {
            body: JSON.stringify(samples),
            contentType: 'application/json',
          });
          const expected = {
            path: [key === 'ArrowDown' ? 34 : 0, 0],
            offset: 0,
          };
          await expect.poll(read).toMatchObject({
            focused: true,
            anchor: initial.anchor,
            focus: expected,
            dom: { focus: expected },
            projected: false,
            native: true,
          });
          if (start.includes('short viewport')) {
            const boundaryGap = () =>
              root.evaluate((element, direction) => {
                const viewport = element
                  .closest('.overflow-y-auto')!
                  .getBoundingClientRect();
                const bounds = element.getBoundingClientRect();
                return direction === 'ArrowDown'
                  ? viewport.bottom - bounds.bottom
                  : bounds.top - viewport.top;
              }, key);
            await expect.poll(boundaryGap).toBeGreaterThanOrEqual(-1);
            await expect.poll(boundaryGap).toBeLessThanOrEqual(8);
          } else {
            await expect
              .poll(
                async () => {
                  const current = await read();
                  return key === 'ArrowDown'
                    ? current.max - current.scroll
                    : current.scroll;
                },
                {
                  message:
                    'Document boundary must reveal the full editor padding like the official Playground',
                }
              )
              .toBeLessThanOrEqual(1);
          }
          expect(
            samples.every((sample) => sample.focused),
            'Repeated arrows must not open an equation editor or lose focus'
          ).toBe(true);
          expect(
            samples.every((sample) => !sample.projected),
            'A text-anchored native range must not switch to projected paint across atoms'
          ).toBe(true);
          const sign = key === 'ArrowDown' ? 1 : -1;
          expect(
            samples
              .slice(1)
              .every(
                (sample, index) =>
                  sign * (sample.scroll - samples[index].scroll) >= -2
              ),
            'Holding one arrow must not scroll in the opposite direction'
          ).toBe(true);
          const terminal = samples.slice(-10);
          expect(
            terminal.every(
              (sample) =>
                JSON.stringify(sample.focus) ===
                  JSON.stringify(terminal[0].focus) &&
                Math.abs(sample.scroll - terminal[0].scroll) <= 2
            ),
            'Repeated input at the document edge must stay stable'
          ).toBe(true);
          await page.screenshot({
            path: info.outputPath(`${cadence}-${key}.png`),
          });
          await expect.poll(read).toMatchObject({
            focused: true,
            focus: expected,
            dom: { focus: expected },
          });
        }
      }
      const paint = await root.evaluate((element: ObservedEditor) => {
        const probe = element.selectionPaintProbe!;
        probe.stopped = true;
        return probe;
      });
      expect(paint.frames).toBeGreaterThan(0);
      expect(
        paint.missing,
        'Expanded text selection must not disappear between inputs'
      ).toBe(0);
      expect(
        paint.doubled,
        'Text selection must not paint twice between inputs'
      ).toBe(0);
      await info.attach('selection-paint-frames', {
        body: JSON.stringify(paint),
        contentType: 'application/json',
      });
      errors.assertNone();
    } finally {
      errors.stop();
    }
  });
}

for (const delivery of ['held arrow', 'individual presses']) {
  test(`keeps every downward text-selection focus visible from middle content with ${delivery}`, async ({
    page,
  }, info) => {
    const errors = recordBrowserRuntimeErrors(page);
    try {
      await page.setViewportSize({ width: 1276, height: 820 });
      await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
      await page.goto('/blocks/playground');
      await page.getByRole('img', { name: /^code drawing$/i }).waitFor();
      const root = page
        .locator('[data-editor="true"][contenteditable="true"]')
        .first();
      await expect
        .poll(
          () =>
            root
              .locator('img')
              .evaluateAll((images: HTMLImageElement[]) =>
                images.every((image) => image.complete)
              ),
          { timeout: 30_000 }
        )
        .toBe(true);
      const paragraph = page
        .getByText('Embed rich media', { exact: false })
        .first();
      await paragraph.scrollIntoViewIfNeeded();
      await paragraph.dblclick({ position: { x: 40, y: 10 } });
      const read = () =>
        root.evaluate((element: PliteBrowserHandleElement) => {
          const handle = element.__pliteBrowserHandle!;
          const native = window.getSelection();
          const view = handle.getViewSelection() as PliteViewSelection | null;
          const model = handle.getModelSelection();
          const scroller = element.closest('.overflow-y-auto')!;
          const viewport = scroller.getBoundingClientRect();
          const range = document.createRange();
          if (native?.focusNode) {
            range.setStart(native.focusNode, native.focusOffset);
            range.collapse(true);
          }
          const affinity =
            view?.focus.affinity ??
            (model.kind === 'text' ? model.affinity : undefined);
          const rects = Array.from(range.getClientRects());
          let rect = affinity === 'forward' ? rects.at(-1) : rects[0];
          if (!rect?.height && native?.focusNode) {
            const host =
              native.focusNode.nodeType === 1
                ? (native.focusNode as HTMLElement)
                : native.focusNode.parentElement;
            rect = host?.getBoundingClientRect();
          }
          return {
            focus: view?.focus.point ?? handle.getSelection()?.focus,
            scroll: scroller.scrollTop,
            max: scroller.scrollHeight - scroller.clientHeight,
            visible:
              !!rect?.height &&
              rect.top >= viewport.top - 1 &&
              rect.bottom <= viewport.bottom + 1,
            bounds: rect && [rect.top, rect.bottom],
            focused: document.activeElement === element,
          };
        });
      const samples: Array<Awaited<ReturnType<typeof read>>> = [];
      await page.keyboard.down('Shift');
      try {
        for (let index = 0; index < 70; index++) {
          if (delivery === 'held arrow') await page.keyboard.down('ArrowDown');
          else await page.keyboard.press('ArrowDown');
          await page.waitForTimeout(20);
          samples.push(await read());
        }
      } finally {
        await page.keyboard.up('ArrowDown');
        await page.keyboard.up('Shift');
      }
      await info.attach('downward-focus-positions', {
        body: JSON.stringify(samples),
        contentType: 'application/json',
      });
      expect(
        samples.filter((sample) => !sample.visible || !sample.focused),
        'Every moving focus must stay visible after crossing closed Details'
      ).toEqual([]);
      await expect
        .poll(read)
        .toMatchObject({ focus: { path: [34, 0], offset: 0 } });
      await expect
        .poll(async () => {
          const current = await read();
          return current.max - current.scroll;
        })
        .toBeLessThanOrEqual(1);
      await page.screenshot({ path: info.outputPath('middle-down.png') });
      await page.keyboard.down('Shift');
      for (let index = 0; index < 100; index++) {
        await page.keyboard.press('ArrowUp');
      }
      await page.keyboard.up('Shift');
      await expect.poll(read).toMatchObject({
        focus: { path: [0, 0], offset: 0 },
        scroll: 0,
        focused: true,
      });
      errors.assertNone();
    } finally {
      errors.stop();
    }
  });
}
