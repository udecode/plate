import { expect, test } from '@playwright/test';

import { recordBrowserRuntimeErrors } from '../../../../packages/test/src/playwright/runtime-errors';

for (const route of ['/blocks/details-demo', '/blocks/playground']) {
  test(`selects only a Details body row on ${route}`, async ({
    page,
  }, testInfo) => {
    const errors = recordBrowserRuntimeErrors(page);
    try {
      await page.goto(route);
      const root = page
        .locator('[data-editor="true"][contenteditable="true"]')
        .first();
      const title = route.endsWith('details-demo')
        ? 'Why use semantic Details?'
        : 'Expand to explore Details';
      const bodyText = route.endsWith('details-demo')
        ? 'The document model matches native HTML and keeps body blocks nested.'
        : 'Keep extra context, notes, or answers in a collapsible block.';
      const innerTitle = route.endsWith('details-demo')
        ? 'Can Details be nested?'
        : 'Details can be nested too';
      const summary = page.getByText(title, { exact: true });
      await expect(summary).toBeVisible();
      const outer = summary.locator(
        'xpath=ancestor::*[contains(@class,"editor-details ")][1]'
      );
      await outer
        .getByRole('button', { name: 'Expand details', exact: true })
        .first()
        .click();
      await outer
        .getByRole('button', { name: 'Expand details', exact: true })
        .first()
        .click();
      await page.getByText(bodyText, { exact: true }).click();
      await page.keyboard.press('End');
      for (const text of ['probe-one', 'probe-two', 'probe-three']) {
        await page.keyboard.press('Enter');
        await page.keyboard.type(text);
      }
      const row = page.getByText('probe-two', { exact: true });
      const paragraph = row.locator(
        'xpath=ancestor::*[@data-editor-node="element"][1]'
      );
      const expectedPath = await paragraph.getAttribute('data-editor-path');
      const highlightedPaths = () =>
        root
          .locator('[data-slot="node-selection-highlight"]')
          .evaluateAll((elements) =>
            elements.map((element) =>
              element.parentElement?.getAttribute('data-editor-path')
            )
          );
      await row.scrollIntoViewIfNeeded();
      const rowBox = await row.boundingBox();
      const outerBox = await outer.boundingBox();
      if (!rowBox || !outerBox) throw new Error('Missing Details geometry');
      await page.mouse.move(outerBox.x - 75, rowBox.y + 2);
      await page.mouse.down();
      await page.mouse.move(rowBox.x + 70, rowBox.y + rowBox.height - 2, {
        steps: 12,
      });
      await expect.poll(highlightedPaths).toEqual([expectedPath]);
      await page.screenshot({ path: testInfo.outputPath('body-selected.png') });
      await page.mouse.up();
      await expect.poll(highlightedPaths).toEqual([expectedPath]);
      await page.keyboard.press('Backspace');
      await expect(row).toHaveCount(0);
      await expect(summary).toBeVisible();
      await expect(page.getByText('probe-one', { exact: true })).toBeVisible();
      await expect(
        page.getByText('probe-three', { exact: true })
      ).toBeVisible();
      await page.keyboard.press('ControlOrMeta+z');
      await expect(row).toBeVisible();
      for (const heading of [
        page.getByText(innerTitle, { exact: true }),
        summary,
        outer
          .getByRole('button', { name: 'Collapse details', exact: true })
          .first(),
      ]) {
        await heading.scrollIntoViewIfNeeded();
        const container = heading.locator(
          'xpath=ancestor::*[contains(@class,"editor-details ")][1]'
        );
        const box = await heading.boundingBox();
        const parentBox = await outer.boundingBox();
        if (!box || !parentBox) {
          throw new Error('Missing Details header geometry');
        }
        const path = await container.getAttribute('data-editor-path');
        await page.mouse.move(parentBox.x - 75, box.y + 2);
        await page.mouse.down();
        await page.mouse.move(
          box.x + Math.min(50, box.width / 2),
          box.y + box.height - 2,
          { steps: 12 }
        );
        await page.mouse.up();
        await expect.poll(highlightedPaths).toEqual([path]);
      }
      errors.assertNone();
    } finally {
      errors.stop();
    }
  });
}
