import {
  recordPliteBrowserRuntimeErrors,
} from '@platejs/browser/playwright';
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

  test('moves after target insertion and leaves a third editor isolated', async ({
    page,
  }) => {
    const runtimeErrors = recordPliteBrowserRuntimeErrors(page);

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

      await sourceHandle.dragTo(targetBlock);

      await expect(sourceModel).toHaveText('keep');
      await expect(targetModel).toHaveText('source|target');
      await expect(bystanderModel).toHaveText('bystander');
      await expect(source).not.toContainText('source');
      await expect(source).toContainText('keep');
      await expect(target).toContainText('source');
      await expect(target).toContainText('target');
      await expect(bystander).toContainText('bystander');

      await target.click();
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
    const runtimeErrors = recordPliteBrowserRuntimeErrors(page);

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

        await expect(page.locator('body')).toHaveClass(/\bdragging\b/);
        await expect(
          source.locator('[data-plite-drop-cursor]:visible')
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

  test('copies when the HTML5 backend resolves the modifier intent', async ({
    page,
  }) => {
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

    await page.keyboard.down('Alt');
    try {
      await sourceHandle.dragTo(targetBlock);
    } finally {
      await page.keyboard.up('Alt');
    }

    await expect(sourceModel).toHaveText('source|keep');
    await expect(targetModel).toHaveText('source|target');
    await expect(bystanderModel).toHaveText('bystander');
    await expect(source).toContainText('source');
    await expect(source).toContainText('keep');
    await expect(target).toContainText('source');
    await expect(target).toContainText('target');
    await expect(bystander).toContainText('bystander');
  });
});
