import { expect, test } from '@platejs/test/playwright';

import {
  startBrowserNativeEventTrace,
  takeBrowserNativeEventTrace,
} from '../../../../packages/test/src/playwright/native-event-trace';
import { recordBrowserRuntimeErrors } from '../../../../packages/test/src/playwright/runtime-errors';
import { caret, editorRoot, read } from './details-fixture';

for (const [route, option, query, type] of [
  ['details-demo', 'Blockquote', 'quote', 'blockquote'],
  ['playground', 'Code Block', 'code', 'codeBlock'],
]) {
  test(`${route}: slash ${option} leaves a closed Details for visible typing`, async ({
    page,
  }, info) => {
    const errors = recordBrowserRuntimeErrors(page);
    await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
    await page.goto(`/blocks/${route}`);
    const root = editorRoot(page);
    const title =
      route === 'details-demo'
        ? 'Why use semantic Details?'
        : 'Expand to explore Details';
    const summary = root.getByText(title, { exact: true });
    await expect(summary).toBeVisible();
    await summary.scrollIntoViewIfNeeded();
    const path = (await summary
      .locator('xpath=ancestor::*[@data-editor-node="element"][1]')
      .getAttribute('data-editor-path'))!
      .split(',')
      .map(Number)
      .concat(0);
    const disclosure = root
      .locator(
        `.editor-details[data-editor-path="${path.slice(0, -2).join(',')}"]`
      )
      .getByRole('button')
      .first();
    await expect(disclosure).toHaveAttribute('aria-expanded', 'false');
    const point = await summary.evaluate((element) => {
      const text = element.firstChild!;
      const range = document.createRange();
      range.setStart(text, text.textContent!.length - 1);
      range.setEnd(text, text.textContent!.length);
      const rect = range.getBoundingClientRect();
      return { x: rect.right - 1, y: rect.top + rect.height / 2 };
    });
    await page.mouse.click(point.x, point.y);
    await expect
      .poll(() => read(root))
      .toMatchObject({
        model: caret(path, title.length),
        dom: caret(path, title.length),
      });
    await page.keyboard.type(' ');
    const before = await read(root);
    const following =
      type === 'blockquote' ? [path[0] + 1, 0, 0] : [path[0] + 1, 0];
    await startBrowserNativeEventTrace(root);
    try {
      await page.keyboard.type(`/${query}`, { delay: 90 });
      await expect(
        page.getByRole('option', { name: option, exact: true })
      ).toBeVisible();
      await page.keyboard.press('Enter');
      await expect(
        page.getByRole('option', { name: option, exact: true })
      ).toBeHidden();
      await expect
        .configure({ soft: true })
        .poll(() => read(root))
        .toMatchObject({
          model: caret(following, 0),
          dom: caret(following, 0),
          focused: true,
        });
      await page.screenshot({ path: info.outputPath('inserted.png') });
      await page.keyboard.type('Z', { delay: 100 });
      await page.screenshot({ path: info.outputPath('typed.png') });
      await expect
        .poll(() => read(root))
        .toMatchObject({
          model: caret(following, 1),
          dom: caret(following, 1),
          focused: true,
        });
      const after = await read(root);
      expect(after.value[path[0]]).toEqual(before.value[path[0]]);
      expect(after.value[path[0] + 1]).toMatchObject({ type });
      await expect(root.getByText('Z', { exact: true })).toBeVisible();
      await expect(disclosure).toHaveAttribute('aria-expanded', 'false');
      errors.assertNone();
    } finally {
      await info.attach('native-events', {
        body: JSON.stringify(await takeBrowserNativeEventTrace(root)),
        contentType: 'application/json',
      });
      errors.stop();
    }
  });
}
