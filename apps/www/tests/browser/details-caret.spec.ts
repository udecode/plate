import { expect, test } from '@playwright/test';

import {
  startBrowserNativeEventTrace,
  takeBrowserNativeEventTrace,
} from '../../../../packages/test/src/playwright/native-event-trace';
import { recordBrowserRuntimeErrors } from '../../../../packages/test/src/playwright/runtime-errors';
import {
  caret,
  editorRoot,
  read,
  readValue,
  textPath,
} from './details-fixture';

for (const route of ['details-demo', 'playground']) {
  for (const action of [
    'Backspace',
    'NestedBackspace',
    'DeleteParagraph',
    'ArrowRight',
    'ArrowLeft',
    'Shift+ArrowRight',
    'Shift+ArrowLeft',
  ]) {
    test(`${route} keeps ${action} outside a collapsed Details body`, async ({
      page,
    }, info) => {
      const errors = recordBrowserRuntimeErrors(page);
      await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
      await page.goto(`/blocks/${route}`);
      const root = editorRoot(page);
      if (action === 'NestedBackspace') {
        await root
          .getByRole('button', { name: 'Expand details', exact: true })
          .first()
          .click();
      }
      const title =
        action === 'NestedBackspace'
          ? route === 'details-demo'
            ? 'Can Details be nested?'
            : 'Details can be nested too'
          : route === 'details-demo'
            ? 'Why use semantic Details?'
            : 'Expand to explore Details';
      const summary = page.getByText(title, { exact: true });
      await expect(summary).toBeVisible();
      const path = await textPath(summary);
      const detailsPath = path.slice(0, -2);
      const following = [
        ...detailsPath.slice(0, -1),
        detailsPath.at(-1)! + 1,
        0,
      ];
      await summary.click({ position: { x: 30, y: 10 } });
      await page.keyboard.press('End');
      await expect
        .poll(() => read(root))
        .toMatchObject({
          model: caret(path, title.length),
          dom: caret(path, title.length),
        });
      let before = await readValue(root);
      await startBrowserNativeEventTrace(root);
      try {
        if (
          action.endsWith('Backspace') ||
          action.endsWith('ArrowLeft') ||
          action === 'DeleteParagraph'
        ) {
          await page.keyboard.press('Enter');
          await expect
            .poll(() => read(root))
            .toMatchObject({
              model: caret(following, 0),
              dom: caret(following, 0),
            });
          if (action === 'Backspace' && route === 'playground') {
            await page.keyboard.press('Backspace');
            await expect
              .poll(() => read(root))
              .toMatchObject({
                model: caret(following, 0),
                dom: caret(following, 0),
              });
          }
          if (action !== 'NestedBackspace') before = await readValue(root);
        }
        if (action === 'DeleteParagraph') {
          const followingText =
            route === 'details-demo'
              ? 'Content after Details remains an ordinary sibling block.'
              : 'Multi-column Layout';
          for (const _ of followingText) {
            await page.keyboard.press('Shift+ArrowRight');
          }
          await expect
            .poll(() => read(root))
            .toMatchObject({
              model: { anchor: { path: following, offset: 0 } },
              dom: { focus: { path: following } },
              text: followingText,
            });
        }
        await page.keyboard.press(
          action === 'NestedBackspace' || action === 'DeleteParagraph'
            ? 'Backspace'
            : action
        );
        const expected =
          action.endsWith('Backspace') ||
          action === 'ArrowLeft' ||
          action === 'DeleteParagraph'
            ? caret(path, title.length)
            : action === 'ArrowRight'
              ? caret(following, 0)
              : action === 'Shift+ArrowRight'
                ? {
                    anchor: { path, offset: title.length },
                    focus: { path: following, offset: 1 },
                  }
                : {
                    anchor: { path: following, offset: 0 },
                    focus: { path, offset: title.length - 1 },
                  };
        await expect
          .poll(() => read(root))
          .toMatchObject({
            model: expected,
            dom: action.startsWith('Shift')
              ? { focus: expected.focus }
              : expected,
            focused: true,
            ...(action.startsWith('Shift')
              ? {
                  text: action.endsWith('ArrowRight')
                    ? route === 'details-demo'
                      ? 'C'
                      : 'M'
                    : title.slice(-1),
                }
              : {}),
          });
        if (action === 'DeleteParagraph') {
          const after = await readValue(root);
          expect(after?.[path[0]]).toEqual(before?.[path[0]]);
          before = after;
        } else {
          expect(await readValue(root)).toEqual(before);
        }
        await page.screenshot({ path: info.outputPath('caret.png') });
        if (action.endsWith('Backspace') || action === 'DeleteParagraph') {
          await page.keyboard.type('XYZ', { delay: 60 });
          await expect
            .poll(() => read(root))
            .toMatchObject({
              model: caret(path, title.length + 3),
              dom: caret(path, title.length + 3),
            });
          await expect(
            page.getByText(`${title}XYZ`, { exact: true })
          ).toBeVisible();
          await page.screenshot({ path: info.outputPath('typed.png') });
          await page.keyboard.press('ControlOrMeta+z');
          await expect.poll(() => readValue(root)).toEqual(before);
        } else if (action.startsWith('Shift')) {
          await page.keyboard.type('XYZ', { delay: 60 });
          const typed = await read(root);
          expect(typed.model).not.toBeNull();
          await expect
            .poll(() => read(root))
            .toMatchObject({
              model: typed.model,
              dom: typed.model,
              focused: true,
            });
          await expect(page.getByText(/XYZ/).first()).toBeVisible();
          await page.keyboard.press('ControlOrMeta+z');
          await expect.poll(() => readValue(root)).toEqual(before);
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
