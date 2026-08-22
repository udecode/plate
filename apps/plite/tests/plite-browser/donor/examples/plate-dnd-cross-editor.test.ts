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
