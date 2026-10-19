import {
  openExample,
  recordBrowserRuntimeErrors,
} from '@platejs/test/playwright';
import { expect, type Page, test } from '@playwright/test';

const open = async (page: Page) => {
  await openExample(page, 'plite/render-contract', {
    ready: { editor: 'visible', text: 'Intro' },
  });

  const root = page.getByRole('textbox', { name: 'Render contract editor' });

  await root.getByText('Intro').click();
  await expect(root).toBeFocused();

  return root;
};

const MONITOR_LOOK_CYCLES = 2;
const SLACK_CYCLES = 3;

const waitPastSecondLook = (page: Page) =>
  page.evaluate(async (cycles) => {
    for (let cycle = 0; cycle < cycles; cycle++) {
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          setTimeout(resolve, 0);
        });
      });
    }
  }, MONITOR_LOOK_CYCLES + SLACK_CYCLES);

test('a newly inserted child portaled one macrotask late reports nothing', async ({
  page,
}) => {
  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    const root = await open(page);

    await page.getByRole('button', { name: 'Insert late portal' }).click();
    await expect(root.getByText('Portaled child')).toBeVisible();
    await expect(root).toBeFocused();
    await waitPastSecondLook(page);

    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('a newly inserted child the renderer omits reports one page error', async ({
  page,
}) => {
  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    const root = await open(page);

    await page.getByRole('button', { name: 'Insert omitted child' }).click();
    await expect(root.getByText('Shell without its children')).toBeVisible();
    await expect(root).toBeFocused();
    await waitPastSecondLook(page);

    expect(runtimeErrors.errors).toEqual([
      expect.stringContaining(
        'Editor render-element selection-export check failed: renderElement for "shell" at 1 omitted editable child 1.0'
      ),
    ]);
  } finally {
    runtimeErrors.stop();
  }
});
