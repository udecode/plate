import { expect, test } from '@playwright/test';

import type { PliteBrowserHandleElement } from '../../../../packages/plitejs/src/react/editable/browser-handle';
import { recordBrowserRuntimeErrors } from '../../../../packages/test/src/playwright/runtime-errors';
import { editorRoot } from './details-fixture';

test('a TOC entry inside collapsed Details opens it and scrolls to the title [EDIT-TOC-NAV-001]', async ({
  page,
}) => {
  const errors = recordBrowserRuntimeErrors(page);
  try {
    await page.goto('/blocks/playground');
    const root = editorRoot(page);
    await expect
      .poll(() =>
        root.evaluate((element: PliteBrowserHandleElement) =>
          Boolean(element.__EDITOR_BROWSER_HANDLE__)
        )
      )
      .toBe(true);
    const outerToggle = root
      .locator('.editor-details')
      .filter({ hasText: 'Expand to explore Details' })
      .first()
      .locator('button[aria-controls]')
      .first();
    await outerToggle.click();
    await expect(outerToggle).toHaveAttribute('aria-expanded', 'true');
    const title = 'Details can be nested too';
    await root.getByText(title, { exact: true }).click();
    await page.keyboard.press('Home');
    await root.pressSequentially('### ');
    const heading = root.getByRole('heading', {
      level: 3,
      name: title,
      exact: true,
    });
    await expect(heading).toBeVisible();
    await outerToggle.click();
    await expect(heading).toHaveCount(0);

    await page.getByRole('button', { name: title, exact: true }).click();

    await expect(heading).toBeInViewport();
    await expect
      .poll(() =>
        heading.evaluate((element) => element.getBoundingClientRect().top)
      )
      .toBeLessThan(200);
    await expect(root.getByText('Expand each block independently')).toHaveCount(
      0
    );
    errors.assertNone();
  } finally {
    errors.stop();
  }
});
