import {
  recordBrowserRuntimeErrors,
} from '@platejs/test/playwright';
import { expect, test, type Page } from '@playwright/test';

const openPlateDndEditors = async (page: Page) => {
  await page.goto('/examples/plite/plate-dnd-cross-editor');

  const source = page.getByRole('textbox', {
    name: 'Plate DnD source editor',
  });
  const target = page.getByRole('textbox', {
    name: 'Plate DnD target editor',
  });
  const bystander = page.getByRole('textbox', {
    name: 'Plate DnD bystander editor',
  });

  await expect(source).toBeVisible();
  await expect(target).toBeVisible();
  await expect(bystander).toBeVisible();

  return {
    bystander,
    bystanderModel: page.getByTestId('plate-dnd-bystander-model'),
    source,
    sourceHandle: page.getByRole('button', {
      name: 'Drag plate-dnd-source block 0',
    }),
    sourceModel: page.getByTestId('plate-dnd-source-model'),
    target,
    targetBlock: page.locator(
      '[data-dnd-editor="plate-dnd-target"][data-dnd-path="0"]'
    ),
    targetModel: page.getByTestId('plate-dnd-target-model'),
  };
};

test.describe('Plate cross-editor block drag', () => {
  test.beforeEach(async ({}, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop drag/drop proof');
  });

  test('copies into another editor and leaves a third editor isolated', async ({
    page,
  }) => {
    const runtimeErrors = recordBrowserRuntimeErrors(page);

    try {
      const {
        bystander,
        bystanderModel,
        source,
        sourceHandle,
        sourceModel,
        target,
        targetBlock,
        targetModel,
      } = await openPlateDndEditors(page);
      const targetBox = await targetBlock.boundingBox();

      if (!targetBox) throw new Error('Expected a visible target block');

      await sourceHandle.dragTo(targetBlock, {
        targetPosition: { x: targetBox.width / 2, y: targetBox.height / 4 },
      });

      await expect(sourceModel).toHaveText('source|keep');
      await expect(targetModel).toHaveText('source|target');
      await expect(bystanderModel).toHaveText('bystander');
      await expect(source).toContainText('source');
      await expect(source).toContainText('keep');
      await expect(target).toContainText('source');
      await expect(target).toContainText('target');
      await expect(bystander).toContainText('bystander');

      // The drop node-selects the landed block; a caret placed in it types.
      await target.getByText('source').click();
      await page.keyboard.press('End');
      await page.keyboard.type('!');
      await expect.poll(() => targetModel.textContent()).toContain('!');
      const editedTarget = await targetModel.textContent();

      expect(editedTarget?.replace('!', '')).toBe('source|target');
      expect(editedTarget?.match(/!/g)).toHaveLength(1);
      await expect(target).toContainText('!');
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });

  test('does not paint a text cursor while a same-editor block drag is held', async ({
    page,
  }) => {
    const runtimeErrors = recordBrowserRuntimeErrors(page);

    try {
      const { source, sourceHandle } = await openPlateDndEditors(page);
      const keepBlock = page.locator(
        '[data-dnd-editor="plate-dnd-source"][data-dnd-path="1"]'
      );

      const sourceHandleBox = await sourceHandle.boundingBox();
      const keepBlockBox = await keepBlock.boundingBox();

      if (!sourceHandleBox) throw new Error('Expected a visible drag handle');
      if (!keepBlockBox) throw new Error('Expected a visible target block');

      await page.mouse.move(
        sourceHandleBox.x + sourceHandleBox.width / 2,
        sourceHandleBox.y + sourceHandleBox.height / 2
      );
      await page.mouse.down();
      try {
        await page.mouse.move(
          keepBlockBox.x + keepBlockBox.width / 2,
          keepBlockBox.y + keepBlockBox.height * 0.84,
          { steps: 12 }
        );

        await expect(source.locator('[data-editor-dragging]')).toHaveCount(1);
        await expect(
          source.locator('[data-editor-drop-cursor]:visible')
        ).toHaveCount(0);
        await expect
          .poll(() =>
            source.evaluate((element) => {
              const selection = document.getSelection();

              return (
                !!selection?.isCollapsed &&
                !!selection.anchorNode &&
                element.contains(selection.anchorNode)
              );
            })
          )
          .toBe(false);
        await expect(source).not.toBeFocused();
        runtimeErrors.assertNone();
      } finally {
        await page.mouse.up();
      }
    } finally {
      runtimeErrors.stop();
    }
  });
});

const boxOf = async (locator: import('@playwright/test').Locator) => {
  const box = await locator.boundingBox();

  if (!box) throw new Error('Expected a visible element');

  return box;
};

const pressHandle = async (
  page: Page,
  handle: import('@playwright/test').Locator
) => {
  const box = await boxOf(handle);

  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
};

const moveOver = async (
  page: Page,
  block: import('@playwright/test').Locator,
  fraction: number
) => {
  const box = await boxOf(block);
  const x = box.x + box.width / 2;
  const y = box.y + box.height * fraction;

  await page.mouse.move(x, y, { steps: 12 });
  // Browsers repeat dragover under a still pointer; emulated drags drop
  // back-to-back dragovers, so settle with paced moves.
  for (const offset of [1, 0, 1]) {
    await page.waitForTimeout(50);
    await page.mouse.move(x, y + offset);
  }
};

test.describe('Plate native block drag', () => {
  test.beforeEach(async ({}, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop drag/drop proof');
  });

  test('cancels a held drag with Escape', async ({ page }) => {
    const runtimeErrors = recordBrowserRuntimeErrors(page);

    try {
      const { sourceHandle, sourceModel, targetBlock, targetModel } =
        await openPlateDndEditors(page);

      await pressHandle(page, sourceHandle);
      await moveOver(page, targetBlock, 0.25);
      await expect(page.locator('[data-dnd-indicator]')).toHaveCount(1);
      await page.keyboard.press('Escape');
      await page.mouse.up();

      await expect(page.locator('[data-dnd-indicator]')).toHaveCount(0);
      await expect(page.locator('[data-editor-dragging]')).toHaveCount(0);
      await expect(sourceModel).toHaveText('source|keep');
      await expect(targetModel).toHaveText('target');
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });

  test('paints the indicator only in the view under the pointer', async ({
    page,
  }) => {
    const runtimeErrors = recordBrowserRuntimeErrors(page);

    try {
      // Keep the target clear of the edge band where the drag autoscrolls.
      await page.setViewportSize({ height: 1200, width: 1280 });
      const { sourceHandle } = await openPlateDndEditors(page);
      const first = page.getByTestId('plate-dnd-split-view-0');
      const second = page.getByTestId('plate-dnd-split-view-1');

      await pressHandle(page, sourceHandle);
      await moveOver(page, second.locator('[data-dnd-path="1"]'), 0.25);
      await expect(second.locator('[data-dnd-indicator]')).toHaveCount(1);
      await expect(first.locator('[data-dnd-indicator]')).toHaveCount(0);
      await page.mouse.up();

      await expect(page.getByTestId('plate-dnd-split-model')).toHaveText(
        'split|source|tail'
      );
      await expect(first).toContainText('source');
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });

  test('moves a block between two views of one document', async ({ page }) => {
    const runtimeErrors = recordBrowserRuntimeErrors(page);

    try {
      // Keep the target clear of the edge band where the drag autoscrolls.
      await page.setViewportSize({ height: 1200, width: 1280 });
      await openPlateDndEditors(page);
      const first = page.getByTestId('plate-dnd-split-view-0');
      const second = page.getByTestId('plate-dnd-split-view-1');

      await pressHandle(
        page,
        first.getByRole('button', { name: 'Drag plate-dnd-split block 0' })
      );
      await moveOver(page, second.locator('[data-dnd-path="1"]'), 0.75);
      await page.mouse.up();

      await expect(page.getByTestId('plate-dnd-split-model')).toHaveText(
        'tail|split'
      );
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });

  test('refuses a drop after the dragged block is removed', async ({
    page,
  }) => {
    const runtimeErrors = recordBrowserRuntimeErrors(page);

    try {
      const { source, sourceHandle, sourceModel, targetBlock, targetModel } =
        await openPlateDndEditors(page);

      await pressHandle(page, sourceHandle);
      await moveOver(page, targetBlock, 0.25);
      // The drag selected the block; deleting the selection unmounts its handle.
      await source.evaluate((element) =>
        Reflect.get(element, '__pliteBrowserHandle').deleteFragment()
      );
      await expect(sourceModel).toHaveText('keep');
      await moveOver(page, targetBlock, 0.3);
      await page.mouse.up();

      await expect(targetModel).toHaveText('target');
      await expect(page.locator('[data-dnd-indicator]')).toHaveCount(0);

      await pressHandle(page, sourceHandle);
      await moveOver(page, targetBlock, 0.25);
      await page.mouse.up();
      await expect(targetModel).toHaveText('keep|target');
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });

  test('admits a no-op edge once the copy modifier is held', async ({
    page,
  }) => {
    const runtimeErrors = recordBrowserRuntimeErrors(page);

    try {
      const { sourceHandle, sourceModel } = await openPlateDndEditors(page);
      const keep = page.locator(
        '[data-dnd-editor="plate-dnd-source"][data-dnd-path="1"]'
      );
      const modifier = await page.evaluate(() =>
        /Mac|iPad|iPhone|iPod/.test(navigator.platform) ? 'Alt' : 'Control'
      );

      await pressHandle(page, sourceHandle);
      await moveOver(page, keep, 0.2);
      await expect(page.locator('[data-dnd-indicator]')).toHaveCount(0);
      await page.keyboard.down(modifier);
      try {
        await moveOver(page, keep, 0.25);
        await expect(page.locator('[data-dnd-indicator]')).toHaveCount(1);
        await page.mouse.up();
      } finally {
        await page.keyboard.up(modifier);
      }

      await expect(sourceModel).toHaveText('source|source|keep');
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });

  test('autoscrolls the page while a drag is held near its edge', async ({
    page,
  }) => {
    const runtimeErrors = recordBrowserRuntimeErrors(page);

    try {
      await page.setViewportSize({ height: 400, width: 1280 });
      const { sourceHandle } = await openPlateDndEditors(page);
      const viewport = page.viewportSize()!;

      await pressHandle(page, sourceHandle);
      await page.mouse.move(viewport.width / 2, viewport.height - 8, {
        steps: 12,
      });
      for (const offset of [1, 0, 1, 0, 1]) {
        await page.waitForTimeout(50);
        await page.mouse.move(viewport.width / 2, viewport.height - 8 + offset);
      }
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
      await page.mouse.up();
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });

  test('undoes a block move in one step', async ({ page }) => {
    const runtimeErrors = recordBrowserRuntimeErrors(page);

    try {
      const { source, sourceHandle, sourceModel } =
        await openPlateDndEditors(page);
      const keep = page.locator(
        '[data-dnd-editor="plate-dnd-source"][data-dnd-path="1"]'
      );

      await pressHandle(page, sourceHandle);
      await moveOver(page, keep, 0.75);
      await page.mouse.up();
      await expect(sourceModel).toHaveText('keep|source');

      await source.getByText('keep').click();
      await page.keyboard.press('ControlOrMeta+z');
      await expect(sourceModel).toHaveText('source|keep');
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });
});
