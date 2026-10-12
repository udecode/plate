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

  return { chip: (label: string) => root.locator(`[data-chip="${label}"]`), chips, root };
};

// A stepped native drag; Playwright's `dragTo` never starts an inline void drag.
const drag = async (
  page: Page,
  source: Locator,
  target: Locator,
  edge: 'left' | 'right'
) => {
  const from = await source.boundingBox();
  const to = await target.boundingBox();

  if (!from || !to) throw new Error('Missing chip boxes for the drag');

  const y = from.y + from.height / 2;

  await page.mouse.move(from.x + from.width / 2, y);
  await page.mouse.down();
  await page.mouse.move(from.x + from.width / 2 + 5, y, { steps: 3 });
  await page.mouse.move(
    edge === 'left' ? to.x + 2 : to.x + to.width - 2,
    to.y + to.height / 2,
    { steps: 15 }
  );
  await page.mouse.up();
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

    await drag(page, chip('Alpha'), chip('Beta'), 'right');

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

    await drag(page, chip('Gamma'), chip('Alpha'), 'left');

    await expect.poll(chips).toEqual(['Gamma', 'Alpha', 'Beta']);
    await undo(page);
    await expect.poll(chips).toEqual(['Alpha', 'Beta', 'Gamma']);
    errors.assertNone();
  });
});
