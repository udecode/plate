import { expect, test } from '@platejs/test/playwright';

import type { PliteBrowserHandleElement } from '../../../../packages/plitejs/src/react/editable/browser-handle';
import {
  startBrowserNativeEventTrace,
  takeBrowserNativeEventTrace,
} from '../../../../packages/test/src/playwright/native-event-trace';
import { recordBrowserRuntimeErrors } from '../../../../packages/test/src/playwright/runtime-errors';
import { caret, editorRoot, read, textPath } from './details-fixture';

for (const route of ['details-demo', 'playground']) {
  for (const target of ['title range', 'body block']) {
    test(`${route}: unwrap inner Details selected by ${target}`, async ({
      page,
    }, info) => {
      const errors = recordBrowserRuntimeErrors(page);
      await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
      await page.goto(`/blocks/${route}`);
      const root = editorRoot(page);
      const title =
        route === 'details-demo'
          ? 'Can Details be nested?'
          : 'Details can be nested too';
      try {
        await root
          .getByRole('button', { name: 'Expand details', exact: true })
          .first()
          .click();
        const outerKey = await root
          .locator('.editor-details')
          .first()
          .getAttribute('data-editor-node-key');
        const summary = root.getByText(title, { exact: true });
        const path = await textPath(summary);
        const body = root.getByText(
          route === 'details-demo'
            ? 'Yes. Nested Details are ordinary body blocks.'
            : 'Expand each block independently to explore its content.',
          { exact: true }
        );
        if (target === 'body block') {
          await root
            .getByRole('button', { name: 'Expand details', exact: true })
            .first()
            .click();
          await body.evaluate((element) =>
            element.scrollIntoView({ block: 'center' })
          );
          const box = await body.boundingBox();
          const outerBox = await root
            .locator('.editor-details')
            .first()
            .boundingBox();
          if (!box || !outerBox) {
            throw new Error('Missing body selection geometry');
          }
          const bodyTextPath = await textPath(body);
          const bodyPath = bodyTextPath.slice(0, -1);
          await page.mouse.move(outerBox.x - 75, box.y + 2);
          await page.mouse.down();
          await page.mouse.move(box.x + 70, box.y + box.height - 2, {
            steps: 12,
          });
          await page.mouse.up();
          await expect
            .poll(() =>
              root.evaluate((element: PliteBrowserHandleElement) =>
                element.__EDITOR_BROWSER_HANDLE__!.getModelSelection()
              )
            )
            .toMatchObject({ kind: 'node', paths: [bodyPath] });
        } else {
          await summary.click();
          await page.keyboard.press('Home');
          await page.keyboard.press('Shift+ArrowRight');
          await page.keyboard.press('Shift+ArrowRight');
          await expect
            .poll(() => read(root))
            .toMatchObject({
              model: {
                anchor: { path, offset: 0 },
                focus: { path, offset: 2 },
              },
              dom: { anchor: { path, offset: 0 }, focus: { path, offset: 2 } },
            });
        }
        await page
          .locator('button')
          .filter({ has: page.locator('svg.lucide-list-collapse') })
          .first()
          .click();
        await expect(root.locator('.editor-details')).toHaveCount(1);
        await expect(
          root.locator(`.editor-details[data-editor-node-key="${outerKey}"]`)
        ).toBeVisible();
        await expect(body).toBeVisible();
        const unwrappedPath = path.filter(
          (_, index) => index !== path.length - 2
        );
        if (target === 'body block') {
          await summary.click();
          await page.keyboard.press('Home');
        }
        const selection = {
          anchor: { path: unwrappedPath, offset: 0 },
          focus: {
            path: unwrappedPath,
            offset: target === 'title range' ? 2 : 0,
          },
        };
        await expect
          .configure({ soft: true })
          .poll(() => read(root))
          .toMatchObject({
            model: selection,
            dom: selection,
            focused: true,
          });
        await page.screenshot({
          path: info.outputPath('unwrapped-selection.png'),
          caret: 'initial',
        });
        await page.keyboard.type('Z');
        await page.screenshot({
          path: info.outputPath('unwrapped-input.png'),
          caret: 'initial',
        });
        await expect(
          root.getByText(
            `Z${target === 'title range' ? title.slice(2) : title}`,
            { exact: true }
          )
        ).toBeVisible();
        await expect(body).toBeVisible();
        await page.screenshot({
          path: info.outputPath('unwrapped-title.png'),
          caret: 'initial',
        });
        errors.assertNone();
      } finally {
        errors.stop();
      }
    });
  }

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
      const root = editorRoot(page);
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
                element.__EDITOR_BROWSER_HANDLE__?.importDOMSelection()
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
