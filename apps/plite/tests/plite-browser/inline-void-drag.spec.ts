import {
  createBrowserEditorHarness,
  openExample,
  recordBrowserRuntimeErrors,
} from '@platejs/test/playwright';
import { expect, type Locator, type Page, test } from '@playwright/test';

type Json = { readonly [key: string]: unknown; readonly children?: Json[] };

const open = async (page: Page) => {
  await openExample(page, 'plite/inline-void-drag', {
    ready: { editor: 'visible', text: 'One' },
  });

  const root = page.getByRole('textbox', { name: 'Inline void drag editor' });
  const harness = createBrowserEditorHarness(page, 'inline-void-drag', root);
  const chips = async () => {
    const value = (await harness.get.modelValue()) as { children: Json[] };

    return (value.children[0].children ?? []).flatMap((node) =>
      node.type === 'chip' ? [node.label] : []
    );
  };

  return {
    chip: (label: string) => root.locator(`[data-chip="${label}"]`),
    chips,
  };
};

const drag = async (
  source: Locator,
  target: Locator,
  edge: 'left' | 'right'
) => {
  const box = await target.boundingBox();

  if (!box) throw new Error('Missing the target chip box for the drag');

  await source.dragTo(target, {
    targetPosition: {
      x: edge === 'left' ? 2 : box.width - 2,
      y: box.height / 2,
    },
  });
};

const undo = async (page: Page) =>
  page.keyboard.press(
    await page.evaluate(() =>
      /Mac|iPad|iPhone|iPod/.test(navigator.platform) ? 'Meta+Z' : 'Control+Z'
    )
  );

test.describe('inline void drag', () => {
  test('moves a chip forward between two chips, and undo puts it back', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop native drag proof');

    const errors = recordBrowserRuntimeErrors(page, { strict: true });
    const { chip, chips } = await open(page);

    await drag(chip('Alpha'), chip('Beta'), 'right');

    await expect.poll(chips).toEqual(['Beta', 'Alpha', 'Gamma']);
    await undo(page);
    await expect.poll(chips).toEqual(['Alpha', 'Beta', 'Gamma']);
    errors.assertNone();
  });

  test('moves a chip backward before a chip, and undo puts it back', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop native drag proof');

    const errors = recordBrowserRuntimeErrors(page, { strict: true });
    const { chip, chips } = await open(page);

    await drag(chip('Gamma'), chip('Alpha'), 'left');

    await expect.poll(chips).toEqual(['Gamma', 'Alpha', 'Beta']);
    await undo(page);
    await expect.poll(chips).toEqual(['Alpha', 'Beta', 'Gamma']);
    errors.assertNone();
  });
});
