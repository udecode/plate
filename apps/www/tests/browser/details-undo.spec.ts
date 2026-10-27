import { expect, test } from '@platejs/test/playwright';

import { recordBrowserRuntimeErrors } from '../../../../packages/test/src/playwright/runtime-errors';
import { editorRoot, read, readValue } from './details-fixture';

for (const route of ['details-demo', 'playground']) {
  test(`${route} restores expanded nested Details through unwrap undo and redo`, async ({
    page,
  }, info) => {
    const errors = recordBrowserRuntimeErrors(page);
    await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
    try {
      await page.goto(`/blocks/${route}`);
      const root = editorRoot(page);
      const title =
        route === 'details-demo'
          ? 'Can Details be nested?'
          : 'Details can be nested too';
      await root
        .getByRole('button', { name: 'Expand details', exact: true })
        .first()
        .click();
      const summary = page.getByText(title, { exact: true });
      const path = await summary
        .locator(
          'xpath=ancestor::*[contains(concat(" ",normalize-space(@class)," ")," editor-details ")][1]'
        )
        .getAttribute('data-editor-path');
      const inner = root.locator(`.editor-details[data-editor-path="${path}"]`);
      await inner
        .getByRole('button', { name: 'Expand details', exact: true })
        .first()
        .click();
      await summary.click();
      await page.keyboard.press('Home');
      const value = () => readValue(root);
      const before = await value();
      const { model: beforeSelection } = await read(root);
      const innerKey = await inner.getAttribute('data-editor-node-key');
      await page.keyboard.press('Backspace');
      await expect(inner).toHaveCount(0);
      const unwrapped = await value();
      for (let cycle = 0; cycle < 2; cycle++) {
        await page.keyboard.press('ControlOrMeta+z');
        await expect.poll(value).toEqual(before);
        await expect(
          inner
            .getByRole('button', { name: 'Collapse details', exact: true })
            .first()
        ).toHaveAttribute('aria-expanded', 'true');
        await expect(inner.locator('.editor-paragraph').first()).toBeVisible();
        await expect(inner).toHaveAttribute('data-editor-node-key', innerKey!);
        await expect
          .poll(() => read(root).then(({ model }) => model))
          .toEqual(beforeSelection);
        await expect
          .poll(() => read(root).then(({ dom }) => dom))
          .toEqual(beforeSelection);
        if (cycle === 0) {
          await page.screenshot({
            path: info.outputPath('restored-details.png'),
            caret: 'initial',
          });
        }
        await page.keyboard.press('ControlOrMeta+Shift+z');
        await expect.poll(value).toEqual(unwrapped);
      }
      await page.keyboard.press('ControlOrMeta+z');
      await expect.poll(value).toEqual(before);
      await root.pressSequentially('X');
      await expect(page.getByText(`X${title}`, { exact: true })).toBeVisible();
      errors.assertNone();
    } finally {
      errors.stop();
    }
  });
}
