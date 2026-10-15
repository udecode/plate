import { expect, test, type Locator, type Page } from '@playwright/test';

import type { PliteBrowserHandleElement } from '../../../../packages/plitejs/src/react/editable/browser-handle';
import { createBrowserEditorHarness } from '../../../../packages/test/src/playwright';
import { recordBrowserRuntimeErrors } from '../../../../packages/test/src/playwright/runtime-errors';

const editorRoot = (page: Page) =>
  page.locator('[data-editor="true"][contenteditable="true"]').first();

const scrollerOf = (root: Locator) =>
  root.locator('xpath=ancestor::*[contains(@class,"overflow-y-auto")][1]');

const readSelection = (root: Locator) =>
  root.evaluate((el: PliteBrowserHandleElement) => ({
    scrollTop: el.closest('.overflow-y-auto')!.scrollTop,
    maxScrollTop:
      el.closest('.overflow-y-auto')!.scrollHeight -
      el.closest('.overflow-y-auto')!.clientHeight,
    selection: el.__EDITOR_BROWSER_HANDLE__?.getModelSelection(),
    native: window.getSelection()?.toString(),
  }));

const readScroll = (scroller: Locator) =>
  scroller.evaluate((el) => ({
    outer: el.parentElement!.scrollTop,
    scroller: el.scrollTop,
    window: window.scrollY,
  }));

const readScrollerTop = async (scroller: Locator) => {
  const { scroller: top } = await readScroll(scroller);

  return top;
};

const visibleBounds = async (page: Page, scroller: Locator) => {
  const box = await scroller.boundingBox();

  if (!box) throw new Error('Missing scroller');

  return {
    bottom: Math.min(box.y + box.height, page.viewportSize()!.height),
    top: Math.max(box.y, 0),
  };
};

const recordSteps = async (scroller: Locator) => {
  await scroller.evaluate((el: HTMLElement & { stopSteps?: () => number }) => {
    const steps = [0];
    let previous = el.scrollTop;
    let frame = 0;
    const tick = () => {
      steps.push(el.scrollTop - previous);
      previous = el.scrollTop;
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    el.stopSteps = () => {
      cancelAnimationFrame(frame);

      return Math.max(...steps);
    };
  });

  return () =>
    scroller.evaluate((el: HTMLElement & { stopSteps?: () => number }) =>
      el.stopSteps!()
    );
};

test('block selection scrolls by the text drag step, larger nearer the edge', async ({
  page,
}) => {
  const errors = recordBrowserRuntimeErrors(page);
  try {
    await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
    await page.goto('/blocks/playground', { waitUntil: 'domcontentloaded' });
    await createBrowserEditorHarness(
      page,
      'selection-scroll-speed',
      editorRoot(page)
    ).ready({ editor: 'visible', text: 'AI-Powered Editing' });
    const heading = page.getByRole('heading', {
      name: 'AI-Powered Editing',
      exact: true,
    });
    await expect(heading).toBeVisible();
    const scroller = scrollerOf(editorRoot(page));
    const { bottom } = await visibleBounds(page, scroller);
    const steps = { blocks: [] as number[], text: [] as number[] };
    for (const kind of ['text', 'blocks'] as const) {
      for (const distance of [60, 30, 4, -100]) {
        await scroller.evaluate((el) => {
          el.scrollTop = 0;
        });
        const box = await heading.boundingBox();
        if (!box) throw new Error('Missing drag geometry');
        await heading.click();
        await expect
          .poll(() => page.evaluate(() => window.getSelection()?.isCollapsed))
          .toBe(true);
        const stop = await recordSteps(scroller);
        await page.mouse.move(
          kind === 'blocks' ? box.x - 75 : box.x + 60,
          box.y + box.height / 2
        );
        await page.mouse.down();
        await page.mouse.move(box.x + 120, bottom - distance, { steps: 12 });
        await page.waitForTimeout(300);
        steps[kind].push(await stop());
        await page.mouse.up();
        await page.keyboard.press('Escape');
      }
    }
    console.info(JSON.stringify(steps));
    const [outside, middle, near, beyond] = steps.blocks;
    expect(outside, 'outside the edge zone').toBe(0);
    expect(middle, 'block drag mid-zone').toBeGreaterThan(0);
    expect(steps.text[1], 'text drag mid-zone').toBeGreaterThan(0);
    expect(near, 'nearer the edge').toBeGreaterThan(middle * 1.5);
    expect(near, 'step per frame').toBeLessThanOrEqual(28);
    expect(steps.text[0], 'text drag outside the edge zone').toBe(0);
    expect(
      Math.abs(middle - steps.text[1]),
      'text and block drags step alike mid-zone'
    ).toBeLessThanOrEqual(1);
    expect(steps.text[2], 'text and block drags step alike near the edge').toBe(
      near
    );
    expect(steps.text[3], 'text and block drags step alike outside').toBe(
      beyond
    );
    errors.assertNone();
  } finally {
    await page.mouse.up();
    errors.stop();
  }
});

for (const kind of ['text', 'blocks'] as const) {
  for (const direction of ['down', 'up'] as const) {
    test(`${kind} selection keeps scrolling with a stationary pointer ${direction} outside the viewport`, async ({
      page,
    }, testInfo) => {
      const errors = recordBrowserRuntimeErrors(page);
      await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
      await page.goto('/blocks/playground', { waitUntil: 'domcontentloaded' });
      const root = editorRoot(page);
      await createBrowserEditorHarness(page, testInfo.testId, root).ready({
        editor: 'visible',
        text: 'AI-Powered Editing',
      });
      const heading = page.getByRole('heading', {
        name: direction === 'up' ? 'Dates and Equations' : 'AI-Powered Editing',
        exact: true,
      });
      await expect(heading).toBeVisible();
      const scroller = scrollerOf(root);
      if (direction === 'up') {
        await heading.evaluate((el) => el.scrollIntoView({ block: 'center' }));
      }
      const box = await heading.boundingBox();
      if (!box) throw new Error('Missing drag geometry');
      const bounds = await visibleBounds(page, scroller);
      const start = {
        x: box.x + (kind === 'blocks' ? -75 : 60),
        y: box.y + box.height / 2,
      };
      const end = {
        x: box.x + 120,
        y: direction === 'down' ? page.viewportSize()!.height + 100 : -100,
      };
      try {
        await page.mouse.move(start.x, start.y);
        await page.mouse.down();
        if (kind === 'text') {
          await page.mouse.move(start.x + 1, start.y);
        }
        await page.mouse.move(end.x, end.y, {
          steps: kind === 'text' ? 1 : 16,
        });
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
          direction === 'down' ? -100 : page.viewportSize()!.height + 100
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
        await page.mouse.move(end.x, (bounds.top + bounds.bottom) / 2);
        await page.waitForTimeout(100);
        const centered = await readSelection(root);
        await page.waitForTimeout(200);
        expect(await readSelection(root)).toMatchObject({
          scrollTop: centered.scrollTop,
          selection: centered.selection,
          native: centered.native,
        });
        await page.mouse.move(end.x, end.y);
        await page.mouse.up();
        await page.waitForTimeout(100);
        const released = await readSelection(root);
        await page.waitForTimeout(250);
        expect(await readSelection(root)).toMatchObject({
          scrollTop: released.scrollTop,
          selection: released.selection,
          native: released.native,
        });
        if (kind === 'blocks') {
          await expect(
            page.locator('[data-slot="node-selection-drag"]')
          ).toHaveCount(0);
        }
        await heading.scrollIntoViewIfNeeded();
        const headingKey = await heading.getAttribute('data-editor-node-key');
        await heading.click();
        await page.keyboard.press('End');
        await page.keyboard.type('!');
        await expect(
          root.locator(`[data-editor-node-key="${headingKey}"]`)
        ).toContainText('!');
        errors.assertNone();
      } finally {
        await page.mouse.up();
        errors.stop();
      }
    });
  }
}

test('text drag scrolling never restores an older scroll position', async ({
  page,
}) => {
  const errors = recordBrowserRuntimeErrors(page);
  try {
    await page.goto('/blocks/playground', { waitUntil: 'domcontentloaded' });
    const root = editorRoot(page);
    await createBrowserEditorHarness(page, 'text-scroll-order', root).ready({
      editor: 'visible',
      text: 'AI-Powered Editing',
    });
    const heading = page.getByRole('heading', {
      name: 'AI-Powered Editing',
      exact: true,
    });
    const box = await heading.boundingBox();
    if (!box) throw new Error('Missing text geometry');
    const scroller = scrollerOf(root);
    await scroller.evaluate((element: HTMLElement & { rewinds?: number }) => {
      const descriptor = Object.getOwnPropertyDescriptor(
        Element.prototype,
        'scrollTop'
      )!;
      element.rewinds = 0;
      Object.defineProperty(element, 'scrollTop', {
        configurable: true,
        get: () => descriptor.get!.call(element),
        set: (value: number) => {
          if (value < descriptor.get!.call(element)) {
            element.rewinds! += 1;
          }
          descriptor.set!.call(element, value);
        },
      });
    });
    await page.mouse.move(box.x + 60, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + 120, page.viewportSize()!.height + 100);
    await expect.poll(() => readScrollerTop(scroller)).toBeGreaterThan(1200);
    expect(
      await scroller.evaluate(
        (element: HTMLElement & { rewinds?: number }) => element.rewinds
      ),
      'selection restoration must not undo a newer drag scroll'
    ).toBe(0);
    const selected = await readSelection(root);
    expect(selected.selection?.kind).toBe('text');
    expect(selected.native!.length).toBeGreaterThan(0);
    errors.assertNone();
  } finally {
    await page.mouse.up();
    errors.stop();
  }
});

test('text drag ownership preserves native word and modified selection', async ({
  page,
}) => {
  const errors = recordBrowserRuntimeErrors(page);
  try {
    await page.goto('/blocks/playground', { waitUntil: 'domcontentloaded' });
    await createBrowserEditorHarness(
      page,
      'native-text-clicks',
      editorRoot(page)
    ).ready({ editor: 'visible', text: 'Collaborative Editing' });
    const heading = page.getByRole('heading', {
      name: 'Collaborative Editing',
      exact: true,
    });
    const text = heading.locator('[data-editor-string]');
    await expect(text).toBeVisible();
    const box = await text.boundingBox();
    if (!box) throw new Error('Missing text geometry');
    const y = box.y + box.height / 2;
    await page.mouse.dblclick(box.x + 20, y);
    await expect
      .poll(() => page.evaluate(() => window.getSelection()?.toString().trim()))
      .toBe('Collaborative');
    await page.keyboard.down('Shift');
    await page.mouse.click(box.x + box.width - 2, y);
    await page.keyboard.up('Shift');
    await expect
      .poll(() => page.evaluate(() => window.getSelection()?.toString().trim()))
      .toBe('Collaborative Editing');
    await page.mouse.click(box.x + 20, y);
    await expect
      .poll(() => page.evaluate(() => window.getSelection()?.isCollapsed))
      .toBe(true);
    const headingKey = await heading.getAttribute('data-editor-node-key');
    await page.keyboard.type('x');
    await expect(
      page.locator(`[data-editor-node-key="${headingKey}"]`)
    ).toContainText('x');
    errors.assertNone();
  } finally {
    await page.keyboard.up('Shift');
    errors.stop();
  }
});

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
  const root = editorRoot(page);
  const bounds = await visibleBounds(page, scrollerOf(root));
  await page.mouse.move(box.x - 75, box.y + box.height / 2);
  await page.mouse.down();
  try {
    await page.mouse.move(box.x + 180, 4, { steps: 15 });
    await page.waitForTimeout(100);
    await page.screenshot({ path: testInfo.outputPath('marquee-top.png') });
    const rect = await page
      .locator('[data-slot="node-selection-drag"]')
      .boundingBox();
    expect(rect!.y).toBeGreaterThanOrEqual(bounds.top);
    await page.mouse.move(1, bounds.bottom - 2, { steps: 12 });
    await expect
      .poll(async () => {
        const marquee = await page
          .locator('[data-slot="node-selection-drag"]')
          .boundingBox();
        return (
          marquee &&
          marquee.x >= 0 &&
          marquee.y + marquee.height <= bounds.bottom
        );
      })
      .toBe(true);
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-slot="node-selection-drag"]')).toHaveCount(
      0
    );
    const stopped = await readSelection(root);
    await page.waitForTimeout(200);
    expect(await readSelection(root)).toEqual(stopped);
  } finally {
    await page.mouse.up();
  }
});

const SHAPES = {
  'a scroller taller than the window': 'tall',
  'a scroller cut off by an outer box': 'cut',
} as const;

test('block marquee ends when released over native audio controls', async ({
  page,
}, testInfo) => {
  const errors = recordBrowserRuntimeErrors(page);
  try {
    await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
    await page.goto('/blocks/playground');
    const root = editorRoot(page);
    const audio = root.locator('audio').first();
    await expect(audio).toBeVisible();
    await audio.scrollIntoViewIfNeeded();
    const box = await audio.boundingBox();
    if (!box) throw new Error('Missing audio geometry');
    const origin = { x: box.x - 70, y: box.y + box.height / 2 };
    expect(
      await page.evaluate(
        (point) =>
          document.elementFromPoint(point.x, point.y) ===
          document.querySelector('[data-editor="true"]'),
        origin
      )
    ).toBe(true);
    await page.mouse.move(origin.x, origin.y);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2, origin.y, { steps: 12 });
    const marquee = page.locator('[data-slot="node-selection-drag"]');
    await expect(marquee).toBeVisible();
    const held = await readSelection(root);
    expect(held.selection?.kind).toBe('node');
    await page.mouse.up();
    await expect(marquee).toHaveCount(0);
    await page.mouse.move(origin.x, box.y + box.height + 100, { steps: 10 });
    await expect
      .poll(async () => {
        const { selection } = await readSelection(root);
        return selection;
      })
      .toEqual(held.selection);
    const { native } = await readSelection(root);
    expect(native).toBe('');
    await page.screenshot({
      path: testInfo.outputPath('audio-after-release.png'),
    });
    errors.assertNone();
  } finally {
    await page.mouse.up();
    errors.stop();
  }
});

for (const scale of [1, 0.75]) {
  test(`block marquee updates a growing target at scale ${scale}`, async ({
    page,
  }, testInfo) => {
    const errors = recordBrowserRuntimeErrors(page);
    try {
      await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
      await page.goto('/blocks/media-demo');
      const root = editorRoot(page);
      await expect(page.getByText('sample.pdf', { exact: true })).toBeVisible();
      await root.evaluate((el: PliteBrowserHandleElement, zoom) => {
        const handle = el.__EDITOR_BROWSER_HANDLE__!;
        const file = handle
          .getValue()
          .children.find((node) => 'type' in node && node.type === 'file');
        if (!file) throw new Error('Missing file fixture');
        handle.applyValueChange({
          children: [
            { type: 'paragraph', children: [{ text: 'Start' }] },
            file,
            { type: 'paragraph', children: [{ text: 'Outside the marquee' }] },
          ],
        });
        el.style.height = '650px';
        el.style.overflowY = 'scroll';
        el.style.transform = `scale(${zoom})`;
        el.style.transformOrigin = 'top left';
      }, scale);
      const start = page.getByText('Start', { exact: true });
      const next = page.getByText('Outside the marquee', { exact: true });
      await start.click();
      const startBox = await start.boundingBox();
      const nextBox = await next.boundingBox();
      const editableBox = await root.boundingBox();
      const file = root.locator('[data-editor-path="1"]');
      const fileBox = await file.boundingBox();
      if (!startBox || !nextBox || !editableBox || !fileBox) {
        throw new Error('Missing media geometry');
      }
      const initialScroll = await readScroll(scrollerOf(root));
      const origin = { x: startBox.x - 70 * scale, y: startBox.y + 2 };
      expect(
        await page.evaluate(
          (point) =>
            document
              .elementFromPoint(point.x, point.y)
              ?.getAttribute('contenteditable'),
          origin
        )
      ).toBe('true');
      await page.mouse.move(origin.x, origin.y);
      await page.mouse.down();
      await page.evaluate(
        () =>
          new Promise<void>((resolve) => {
            requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
          })
      );
      await page.mouse.move(fileBox.x + 60, fileBox.y + 8, { steps: 8 });
      await growLikeLoadingMedia(file);
      await expect
        .poll(async () => {
          const box = await next.boundingBox();
          return box?.y;
        })
        .toBeGreaterThan(nextBox.y + 10);
      await page.mouse.move(fileBox.x + 60, nextBox.y + 2, { steps: 8 });
      await expect
        .poll(async () => {
          const { selection } = await readSelection(root);
          return selection;
        })
        .toMatchObject({
          kind: 'node',
          paths: [[0], [1]],
        });
      const currentBox = await root.boundingBox();
      expect(currentBox?.height).toBe(editableBox.height);
      expect(currentBox?.width).toBe(editableBox.width);
      expect(await readScroll(scrollerOf(root))).toEqual(initialScroll);
      await page.screenshot({
        path: testInfo.outputPath('resized-target.png'),
      });
      await page.mouse.up();
      await expect
        .poll(async () => {
          const { selection } = await readSelection(root);
          return selection;
        })
        .toMatchObject({
          kind: 'node',
          paths: [[0], [1]],
        });
      errors.assertNone();
    } finally {
      await page.mouse.up();
      errors.stop();
    }
  });
}

const growLikeLoadingMedia = (block: Locator) =>
  block.evaluate((element: HTMLElement) => {
    element.style.paddingBottom = '48px';
  });

const reshape = (scroller: Locator, shape: 'cut' | 'tall') =>
  scroller.evaluate((el: HTMLElement, kind) => {
    const frame = el.parentElement!;

    el.style.flex = 'none';
    if (kind === 'tall') {
      frame.style.height = 'auto';
      el.style.height = `${window.innerHeight * 2}px`;

      return window.innerHeight;
    }
    frame.style.height = '400px';
    frame.style.overflow = 'hidden';
    el.style.height = '800px';

    return frame.getBoundingClientRect().bottom;
  }, shape);

const topLevelBlocks = (root: Locator) =>
  root.evaluate((el) =>
    [...el.querySelectorAll('[data-editor-path]')]
      .filter((block) =>
        /^\d+$/.test(block.getAttribute('data-editor-path') ?? '')
      )
      .map((block) => {
        const rect = block.getBoundingClientRect();

        return {
          bottom: rect.bottom,
          index: Number(block.getAttribute('data-editor-path')),
          text: (block.textContent ?? '').slice(0, 40),
          top: rect.top,
        };
      })
  );

// Playwright's emulated native drag stops delivering dragover partway through
// a long scroll, so these drags send their own.
const sendDrag = (
  handle: Locator,
  type: 'dragover' | 'dragstart' | 'drop' | 'dragend',
  x: number,
  y: number
) =>
  handle.evaluate(
    (element, [kind, clientX, clientY]) => {
      const holder = window as { dragTransfer?: DataTransfer };
      holder.dragTransfer ??= new DataTransfer();
      const transfer = holder.dragTransfer;
      const target =
        kind === 'dragstart' || kind === 'dragend'
          ? element
          : document.elementFromPoint(clientX, clientY);

      target!.dispatchEvent(
        new DragEvent(kind, {
          bubbles: true,
          cancelable: true,
          clientX,
          clientY,
          dataTransfer: transfer,
        })
      );
    },
    [type, x, y] as const
  );

const dragged = 'Collaborative Editing';

const openReshaped = async (page: Page, shape: 'cut' | 'tall') => {
  await page.goto('/blocks/playground');
  const root = editorRoot(page);
  await createBrowserEditorHarness(
    page,
    `selection-edge-scroll:${shape}`,
    root
  ).ready({ editor: 'visible', text: dragged });
  const scroller = scrollerOf(root);

  return {
    bottom: await reshape(scroller, shape),
    heading: page.getByRole('heading', { name: dragged, exact: true }),
    root,
    scroller,
  };
};

for (const [name, shape] of Object.entries(SHAPES)) {
  test(`block selection scrolls ${name} before anything around it`, async ({
    page,
  }) => {
    const errors = recordBrowserRuntimeErrors(page);
    try {
      const { bottom, heading, root, scroller } = await openReshaped(
        page,
        shape
      );
      const box = await heading.boundingBox();
      if (!box) throw new Error('Missing drag geometry');
      const { top } = await visibleBounds(page, scroller);
      const blocks = await topLevelBlocks(root);
      const hidden = blocks.find((block) => block.top > bottom)?.index;
      if (hidden === undefined) {
        throw new Error('Missing a block below the strip');
      }
      const lastSelected = async () => {
        const { selection } = await readSelection(root);

        return selection?.kind === 'node'
          ? Math.max(...selection.paths.map(([index]) => index))
          : -1;
      };
      await page.mouse.move(box.x - 75, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + 120, (top + bottom) / 2, { steps: 8 });
      await expect.poll(lastSelected).toBeGreaterThanOrEqual(0);
      expect(await lastSelected()).toBeLessThan(hidden);
      expect(await readScrollerTop(scroller)).toBe(0);
      await page.mouse.move(box.x + 120, bottom - 4, { steps: 4 });
      await expect.poll(() => readScrollerTop(scroller)).toBeGreaterThan(300);
      expect(await readScroll(scroller)).toMatchObject({ outer: 0, window: 0 });
      await expect.poll(lastSelected).toBeGreaterThanOrEqual(hidden);
      errors.assertNone();
    } finally {
      await page.mouse.up();
      errors.stop();
    }
  });

  test(`block drag by the handle scrolls ${name} and drops beside the block under the pointer`, async ({
    page,
  }) => {
    const errors = recordBrowserRuntimeErrors(page);
    try {
      const { bottom, heading, root, scroller } = await openReshaped(
        page,
        shape
      );
      const startBlocks = await topLevelBlocks(root);
      const startTops = new Map(
        startBlocks.map((block) => [block.text, block.top])
      );
      await heading.hover();
      const handle = page
        .locator('.editor-editor > div')
        .filter({ has: heading })
        .getByRole('button', { name: 'Drag block' });
      const handleBox = await handle.boundingBox();
      const box = await heading.boundingBox();
      if (!handleBox || !box) throw new Error('Missing drag geometry');
      const x = box.x + 120;
      await sendDrag(handle, 'dragstart', handleBox.x + 4, handleBox.y + 4);
      for (let i = 0; i < 40 && (await readScrollerTop(scroller)) < 300; i++) {
        await sendDrag(handle, 'dragover', x, bottom - 4);
        await page.waitForTimeout(30);
      }
      expect(await readScroll(scroller)).toMatchObject({ outer: 0, window: 0 });
      expect(await readScrollerTop(scroller)).toBeGreaterThanOrEqual(300);

      const { top } = await visibleBounds(page, scroller);
      const blocks = await topLevelBlocks(root);
      const index = blocks.findIndex(
        (block) =>
          startTops.get(block.text)! > bottom + 50 &&
          block.top > top + 20 &&
          (block.top + block.bottom) / 2 < bottom - 60
      );
      const target = blocks[index];
      if (!target) throw new Error('Missing drop target');
      const y = (target.top + target.bottom) / 2;
      await sendDrag(handle, 'dragover', x, y);
      const line = await page
        .locator('[data-drop-indicator="y"]')
        .boundingBox();
      expect(line).not.toBeNull();
      const lineY = line!.y + line!.height / 2;
      const side =
        lineY >= blocks[index - 1].bottom - 2 && lineY <= target.top + 2
          ? 'above'
          : lineY >= target.bottom - 2 && lineY <= blocks[index + 1].top + 2
            ? 'below'
            : null;
      expect(side, 'drop line in a gap beside the target').not.toBeNull();
      await sendDrag(handle, 'drop', x, y);
      await sendDrag(handle, 'dragend', x, y);

      await expect
        .poll(async () => {
          const ordered = await topLevelBlocks(root);
          const texts = ordered.map((block) => block.text);
          const moved = texts.findIndex((text) => text.startsWith(dragged));

          return {
            copies: texts.filter((text) => text.startsWith(dragged)).length,
            neighbor: texts[side === 'above' ? moved + 1 : moved - 1],
          };
        })
        .toEqual({ copies: 1, neighbor: target.text });
      errors.assertNone();
    } finally {
      errors.stop();
    }
  });
}
