import { expect, test, type Locator } from '@playwright/test';

import type { PliteBrowserHandleElement } from '../../../../packages/plitejs/src/react/editable/browser-handle';
import {
  startBrowserNativeEventTrace,
  takeBrowserNativeEventTrace,
} from '../../../../packages/test/src/playwright/native-event-trace';
import { recordBrowserRuntimeErrors } from '../../../../packages/test/src/playwright/runtime-errors';

const read = (root: Locator) =>
  root.evaluate((element: PliteBrowserHandleElement) => ({
    model: element.__pliteBrowserHandle?.getSelection(),
    dom: element.__pliteBrowserHandle?.getDOMSelection(),
    value: element.__pliteBrowserHandle?.getValue().children,
    focused: document.activeElement === element,
  }));
const caret = (path: number[], offset: number) => ({
  anchor: { path, offset },
  focus: { path, offset },
});
const textPath = async (element: Locator) =>
  (await element
    .locator('xpath=ancestor::*[@data-editor-node="element"][1]')
    .getAttribute('data-editor-path'))!
    .split(',')
    .map(Number)
    .concat(0);

for (const route of ['details-demo', 'playground']) {
  for (const action of [
    'first collapse',
    'collapse after import',
    'remove empty paragraph',
    'unwrap inner',
    'forward delete',
  ]) {
    test(`${route}: ${action}`, async ({ page }, info) => {
      const errors = recordBrowserRuntimeErrors(page);
      await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
      await page.goto(`/blocks/${route}`);
      const root = page
        .locator('[data-editor="true"][contenteditable="true"]')
        .first();
      const title =
        route === 'details-demo'
          ? 'Why use semantic Details?'
          : 'Expand to explore Details';
      const innerTitle =
        route === 'details-demo'
          ? 'Can Details be nested?'
          : 'Details can be nested too';
      const summary = page.getByText(title, { exact: true });
      await expect(summary).toBeVisible();
      const outerPath = await textPath(summary);
      const outer = root.locator(
        `.editor-details[data-editor-path="${outerPath.slice(0, -2).join(',')}"]`
      );
      await startBrowserNativeEventTrace(root);
      try {
        if (action.includes('collapse')) {
          for (let cycle = 0; cycle < 3; cycle++) {
            await outer
              .getByRole('button', { name: 'Expand details', exact: true })
              .first()
              .click();
            const body = outer.locator('.editor-paragraph').first();
            await body.scrollIntoViewIfNeeded();
            const bodyBox = await body.boundingBox();
            const toggle = outer
              .getByRole('button', { name: 'Collapse details', exact: true })
              .first();
            const toggleBox = await toggle.boundingBox();
            if (!bodyBox || !toggleBox) {
              throw new Error('Missing disclosure geometry');
            }
            await page.mouse.click(bodyBox.x + 60, bodyBox.y + 10);
            if (action === 'collapse after import') {
              await root.evaluate((element: PliteBrowserHandleElement) =>
                element.__pliteBrowserHandle?.importDOMSelection()
              );
            }
            await page.mouse.click(
              toggleBox.x + toggleBox.width / 2,
              toggleBox.y + toggleBox.height / 2
            );
            await expect(
              outer
                .getByRole('button', { name: 'Expand details', exact: true })
                .first()
            ).toHaveAttribute('aria-expanded', 'false');
            expect(await read(root)).toMatchObject({
              model: caret(outerPath, title.length),
              dom: caret(outerPath, title.length),
              focused: true,
            });
            await page.screenshot({
              path: info.outputPath(`collapse-${cycle}.png`),
            });
            await page.keyboard.type('XYZ', { delay: 50 });
            await expect(
              page.getByText(`${title}XYZ`, { exact: true })
            ).toBeVisible();
            await expect
              .poll(() => read(root))
              .toMatchObject({
                model: caret(outerPath, title.length + 3),
                dom: caret(outerPath, title.length + 3),
              });
            await page.keyboard.press('ControlOrMeta+z');
            await expect(summary).toBeVisible();
          }
        } else {
          const nested = action !== 'forward delete';
          if (nested) {
            await outer
              .getByRole('button', { name: 'Expand details', exact: true })
              .first()
              .click();
          }
          const row = nested
            ? page.getByText(innerTitle, { exact: true })
            : summary;
          const path = await textPath(row);
          const label = nested ? innerTitle : title;
          await row.click({ position: { x: 30, y: 10 } });
          await page.keyboard.press(action === 'unwrap inner' ? 'Home' : 'End');
          const offset = action === 'unwrap inner' ? 0 : label.length;
          await expect
            .poll(() => read(root))
            .toMatchObject({
              model: caret(path, offset),
              dom: caret(path, offset),
            });
          const before = await read(root);
          if (action === 'remove empty paragraph') {
            await page.keyboard.press('Enter');
            await expect
              .poll(async () => {
                const current = await read(root);
                return current.model?.focus.path;
              })
              .toEqual([...path.slice(0, -3), path.at(-3)! + 1, 0]);
          }
          await page.keyboard.press(
            action === 'forward delete' ? 'Delete' : 'Backspace'
          );
          const target =
            action === 'unwrap inner'
              ? path.filter((_, index) => index !== path.length - 2)
              : action === 'forward delete'
                ? [outerPath[0] + 1, 0]
                : path;
          const end = action === 'remove empty paragraph' ? label.length : 0;
          await expect
            .poll(() => read(root))
            .toMatchObject({
              model: caret(target, end),
              dom: caret(target, end),
              focused: true,
            });
          const after = await read(root);
          if (action === 'unwrap inner') {
            expect(after.value?.[outerPath[0]]).toMatchObject({
              type: 'details',
              children: [
                { type: 'summary', children: [{ text: title }] },
                { type: 'paragraph' },
                { type: 'paragraph', children: [{ text: innerTitle }] },
                { type: 'paragraph' },
              ],
            });
            await expect(outer.locator('.editor-details')).toHaveCount(0);
          } else {
            expect(after.value).toEqual(before.value);
          }
          await page.screenshot({ path: info.outputPath('after.png') });
          await page.keyboard.type('XYZ', { delay: 50 });
          await expect
            .poll(() => read(root))
            .toMatchObject({
              model: caret(target, end + 3),
              dom: caret(target, end + 3),
            });
          await expect(page.getByText(/XYZ/).first()).toBeVisible();
        }
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
}
