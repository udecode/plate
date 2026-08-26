import { expect, type Page, test } from '@playwright/test';

const recordRuntimeErrors = (page: Page) => {
  const errors: string[] = [];
  const onConsole = (message: { text: () => string; type: () => string }) => {
    if (message.type() === 'error') errors.push(message.text());
  };
  const onPageError = (error: Error) => {
    errors.push(error.stack ?? error.message);
  };

  page.on('console', onConsole);
  page.on('pageerror', onPageError);

  return {
    assertNone: () => expect(errors).toEqual([]),
    stop: () => {
      page.off('console', onConsole);
      page.off('pageerror', onPageError);
    },
  };
};

const selectedNodePaths = (page: Page) =>
  page
    .locator('[data-slot="node-selection-highlight"]')
    .evaluateAll((elements) =>
      elements
        .map((element) =>
          element.closest('[data-plite-path]')?.getAttribute('data-plite-path')
        )
        .filter((path): path is string => Boolean(path))
        .sort()
    );

const modelSelection = (page: Page) =>
  page.locator('[data-plite-editor="true"][contenteditable="true"]').evaluate(
    (element) =>
      (
        element as HTMLElement & {
          __pliteBrowserHandle?: { getModelSelection: () => unknown };
        }
      ).__pliteBrowserHandle?.getModelSelection() ?? null
  );

const copySelectionAndReadFormats = async (page: Page) => {
  await page.evaluate(() => {
    const state = window as typeof window & {
      __nodeSelectionCopy?: Record<string, string> | null;
    };

    state.__nodeSelectionCopy = null;
    document.addEventListener(
      'copy',
      (event) => {
        const values: Record<string, string> = {};

        for (const type of event.clipboardData?.types ?? []) {
          values[type] = event.clipboardData?.getData(type) ?? '';
        }
        state.__nodeSelectionCopy = values;
      },
      { once: true }
    );
  });
  await page.keyboard.press('ControlOrMeta+C');
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (
            window as typeof window & {
              __nodeSelectionCopy?: Record<string, string> | null;
            }
          ).__nodeSelectionCopy
      )
    )
    .not.toBeNull();

  return page.evaluate(
    () =>
      (
        window as typeof window & {
          __nodeSelectionCopy?: Record<string, string> | null;
        }
      ).__nodeSelectionCopy ?? {}
  );
};

test('marquee selection stays editor-owned through focus, clipboard, input, delete, and undo', async ({
  page,
}) => {
  let runtimeErrors: ReturnType<typeof recordRuntimeErrors> | undefined;
  const editor = page.locator(
    '[data-plite-editor="true"][contenteditable="true"]'
  );
  const heading = editor.getByRole('heading', {
    exact: true,
    name: 'Node Selection',
  });
  const blocks = editor.locator(
    '[data-plite-node="element"][data-plite-node-key]'
  );
  const marquee = page.locator('[data-slot="node-selection-drag"]');
  const floatingToolbar = page.getByRole('toolbar').filter({
    has: page.getByRole('button', { exact: true, name: 'Ask AI' }),
  });

  try {
    await page.goto('/blocks/node-selection-demo');
    await expect(heading).toBeVisible();
    // Pointer listeners install in an effect; begin the held-pointer oracle only after effects can run.
    await page.evaluate(
      () =>
        new Promise<void>((resolve) => {
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
        })
    );
    runtimeErrors = recordRuntimeErrors(page);
    await heading.scrollIntoViewIfNeeded();

    const headingBox = await heading.boundingBox();
    const visibleBlockBoxes = await blocks.evaluateAll(
      (elements, headingY) =>
        elements
          .map((element) => {
            const rect = element.getBoundingClientRect();

            return {
              bottom: rect.bottom,
              path: element.getAttribute('data-plite-path'),
              text: element.textContent ?? '',
              left: rect.left,
              top: rect.top,
              width: rect.width,
            };
          })
          .filter(
            (rect) =>
              rect.top >= headingY - 2 && rect.bottom < window.innerHeight - 20
          )
          .slice(0, 3),
      headingBox?.y ?? 0
    );

    if (
      !headingBox ||
      visibleBlockBoxes.length < 3 ||
      visibleBlockBoxes.some(({ path }) => !path)
    ) {
      throw new Error('Expected visible node-selection geometry');
    }

    const draggedBlockBoxes = visibleBlockBoxes.slice(0, 2);
    const expectedDraggedPaths = draggedBlockBoxes
      .map(({ path }) => path!)
      .sort();
    const lastBlockBox = draggedBlockBoxes.at(-1)!;
    const initialBlockCount = await blocks.count();
    const start = {
      x: headingBox.x - 50,
      y: headingBox.y + headingBox.height / 2,
    };
    const end = {
      x: lastBlockBox.left + Math.min(80, lastBlockBox.width / 2),
      y: (lastBlockBox.top + lastBlockBox.bottom) / 2,
    };

    expect(
      await page.evaluate(
        ({ x, y }) =>
          document.elementFromPoint(x, y) ===
          document.querySelector(
            '[data-plite-editor="true"][contenteditable="true"]'
          ),
        start
      )
    ).toBe(true);

    await page.mouse.move(start.x, start.y);
    await page.mouse.down();
    for (let step = 1; step <= 8; step++) {
      const progress = step / 8;

      await page.mouse.move(
        start.x + (end.x - start.x) * progress,
        start.y + (end.y - start.y) * progress
      );
      await page.waitForTimeout(20);
    }

    await expect
      .poll(() => selectedNodePaths(page))
      .toEqual(expectedDraggedPaths);
    await expect(marquee).toBeVisible();
    const marqueePaint = await marquee.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      const isTransparent = (color: string) =>
        color === 'transparent' || color === 'rgba(0, 0, 0, 0)';

      return {
        borderPainted:
          style.borderStyle !== 'none' &&
          style.borderWidth !== '0px' &&
          !isTransparent(style.borderColor),
        fillPainted: !isTransparent(style.backgroundColor),
        height: rect.height,
        width: rect.width,
      };
    });

    expect(marqueePaint.width).toBeGreaterThan(0);
    expect(marqueePaint.height).toBeGreaterThan(0);
    expect(marqueePaint.fillPainted).toBe(true);
    expect(marqueePaint.borderPainted).toBe(true);

    await page.mouse.up();
    await expect(marquee).toBeHidden();
    await expect
      .poll(() => selectedNodePaths(page))
      .toEqual(expectedDraggedPaths);
    await expect
      .poll(() =>
        page.evaluate(() =>
          document.activeElement?.matches(
            '[data-plite-editor="true"][contenteditable="true"]'
          )
        )
      )
      .toBe(true);
    await expect
      .poll(() => page.evaluate(() => window.getSelection()?.rangeCount ?? -1))
      .toBe(0);
    await expect(floatingToolbar).toHaveCount(0);

    const copied = await copySelectionAndReadFormats(page);

    expect(copied['application/x-plite-fragment']).toBeTruthy();
    for (const { text } of draggedBlockBoxes) {
      expect(copied['text/plain']).toContain(text.trim());
    }
    await expect
      .poll(() => selectedNodePaths(page))
      .toEqual(expectedDraggedPaths);
    await expect(floatingToolbar).toHaveCount(0);

    await page.keyboard.press('x');
    await expect.poll(() => selectedNodePaths(page)).toEqual([]);
    await expect(blocks).toHaveCount(initialBlockCount - 1);
    await expect(editor).toContainText('x');

    await page.keyboard.press('ControlOrMeta+Z');
    await expect(blocks).toHaveCount(initialBlockCount);
    await expect
      .poll(() => modelSelection(page))
      .toEqual({
        anchorPath: expectedDraggedPaths[0]!.split(',').map(Number),
        focusPath: expectedDraggedPaths.at(-1)!.split(',').map(Number),
        kind: 'node',
        paths: expectedDraggedPaths.map((path) => path.split(',').map(Number)),
      });
    await expect
      .poll(() => selectedNodePaths(page))
      .toEqual(expectedDraggedPaths);

    await page.keyboard.press('Delete');
    await expect(blocks).toHaveCount(initialBlockCount - 2);
    await page.keyboard.press('ControlOrMeta+Z');
    await expect(blocks).toHaveCount(initialBlockCount);
    await expect
      .poll(() => selectedNodePaths(page))
      .toEqual(expectedDraggedPaths);

    await page.keyboard.press('ArrowDown');
    await expect.poll(() => selectedNodePaths(page)).toEqual([]);
    await expect
      .poll(() =>
        page.evaluate(() =>
          document.activeElement?.matches(
            '[data-plite-editor="true"][contenteditable="true"]'
          )
        )
      )
      .toBe(true);

    await page.evaluate(
      ({ end: touchEnd, start: touchStart }) => {
        const editable = document.querySelector<HTMLElement>(
          '[data-plite-editor="true"][contenteditable="true"]'
        );

        if (!editable) throw new Error('Expected node-selection editor');

        const dispatch = (
          target: EventTarget,
          type: string,
          point: { x: number; y: number }
        ) => {
          target.dispatchEvent(
            new PointerEvent(type, {
              bubbles: true,
              button: 0,
              cancelable: true,
              clientX: point.x,
              clientY: point.y,
              isPrimary: true,
              pointerId: 1,
              pointerType: 'touch',
            })
          );
        };

        dispatch(editable, 'pointerdown', touchStart);
        dispatch(document, 'pointermove', touchEnd);
        dispatch(document, 'pointerup', touchEnd);
      },
      { end, start }
    );
    await expect
      .poll(() => selectedNodePaths(page))
      .toEqual(expectedDraggedPaths);
    runtimeErrors.assertNone();
  } finally {
    await page.mouse.up().catch(() => {});
    runtimeErrors?.stop();
  }
});
