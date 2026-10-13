import { expect, test } from '@playwright/test';

import type { PliteBrowserHandleElement } from '../../../../packages/plitejs/src/react/editable/browser-handle';
import { recordBrowserRuntimeErrors } from '../../../../packages/test/src/playwright/runtime-errors';

for (const route of ['details-demo', 'playground']) {
  test(`${route} formats a nested Details title without replacing its Summary`, async ({
    page,
  }, info) => {
    const errors = recordBrowserRuntimeErrors(page);
    await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
    try {
      await page.goto(`/blocks/${route}`);
      const root = page
        .locator('[data-editor="true"][contenteditable="true"]')
        .first();
      await root
        .getByRole('button', { name: 'Expand details', exact: true })
        .first()
        .click();
      const title =
        route === 'details-demo'
          ? 'Can Details be nested?'
          : 'Details can be nested too';
      const summary = root.getByText(title, { exact: true });
      const container = summary.locator(
        'xpath=ancestor::*[contains(concat(" ",normalize-space(@class)," ")," editor-details ")][1]'
      );
      const key = await container.getAttribute('data-editor-node-key');
      const details = root.locator(
        `.editor-details[data-editor-node-key="${key}"]`
      );
      const before = await details.textContent();
      await summary.click({ clickCount: 3 });
      const selectionBefore = await root.evaluate(
        (element: PliteBrowserHandleElement) =>
          element.__pliteBrowserHandle!.getSelection()
      );
      await page
        .getByRole('button', { name: 'Text', exact: true })
        .last()
        .click();
      await page
        .getByRole('menuitemradio', { name: 'Heading 2', exact: true })
        .click();
      await expect(
        details.getByRole('heading', { level: 2, name: title, exact: true })
      ).toBeVisible();
      await expect(
        details.getByRole('button', { name: 'Expand details', exact: true })
      ).toHaveAttribute('aria-expanded', 'false');
      await expect(
        page.getByRole('textbox', { name: 'Font size', exact: true })
      ).toHaveValue('24');
      await expect(details).toHaveText(before!);
      await expect
        .poll(() =>
          root.evaluate((element: PliteBrowserHandleElement) =>
            element.__pliteBrowserHandle!.getSelection()
          )
        )
        .toEqual(selectionBefore);
      await expect
        .poll(() =>
          root.evaluate((element: PliteBrowserHandleElement) =>
            element.__pliteBrowserHandle!.getDOMSelection()
          )
        )
        .toEqual(selectionBefore);
      const readSummary = () =>
        root.evaluate((element: PliteBrowserHandleElement, targetKey) => {
          const handle = element.__pliteBrowserHandle!;
          const find = (
            nodes: ReturnType<typeof handle.getValue>['children']
          ): unknown => {
            for (const node of nodes) {
              if ('children' in node) {
                if (
                  node.type === 'details' &&
                  node.children[0] &&
                  JSON.stringify(node.children[0]).includes(targetKey)
                ) {
                  return node.children[0];
                }
                const found = find(node.children);
                if (found) return found;
              }
            }
          };
          return find(handle.getValue().children);
        }, title);
      await expect
        .poll(readSummary)
        .toMatchObject({ type: 'summary', level: 2 });
      await page.screenshot({
        path: info.outputPath('heading-title.png'),
        caret: 'initial',
      });
      await page.keyboard.press('ControlOrMeta+z');
      await expect.poll(readSummary).not.toHaveProperty('level');
      await page.keyboard.press('ControlOrMeta+Shift+z');
      await expect
        .poll(readSummary)
        .toMatchObject({ type: 'summary', level: 2 });
      await page.keyboard.press('ArrowRight');
      await root.pressSequentially('X');
      await expect(
        details.getByRole('heading', {
          level: 2,
          name: `${title}X`,
          exact: true,
        })
      ).toBeVisible();
      await page
        .getByRole('button', { name: 'Heading 2', exact: true })
        .first()
        .click();
      await page
        .getByRole('menuitemradio', { name: 'Text', exact: true })
        .click();
      await expect(details.getByRole('heading')).toHaveCount(0);
      await expect(
        details.getByText(`${title}X`, { exact: true })
      ).toBeVisible();
      await details
        .getByText(`${title}X`, { exact: true })
        .click({ clickCount: 3 });
      await page.keyboard.press('Backspace');
      await root.pressSequentially('/h1');
      await page
        .getByRole('option', { name: 'Heading 1', exact: true })
        .click();
      await root.pressSequentially('New title');
      await expect(
        details.getByRole('heading', {
          level: 1,
          name: 'New title',
          exact: true,
        })
      ).toBeVisible();
      await page.keyboard.press('ControlOrMeta+Alt+2');
      await expect(
        details.getByRole('heading', {
          level: 2,
          name: 'New title',
          exact: true,
        })
      ).toBeVisible();
      await details
        .getByRole('button', { name: 'Expand details', exact: true })
        .click();
      const body = details.getByText(
        route === 'details-demo'
          ? 'Yes. Nested Details are ordinary body blocks.'
          : 'Expand each block independently to explore its content.',
        { exact: true }
      );
      await expect(body).toBeVisible();
      await page
        .getByRole('button', { name: 'Heading 2', exact: true })
        .first()
        .click();
      await page
        .getByRole('menuitemradio', { name: 'Heading 3', exact: true })
        .click();
      await expect(
        details.getByRole('heading', {
          level: 3,
          name: 'New title',
          exact: true,
        })
      ).toBeVisible();
      await expect(body).toBeVisible();
      await page.screenshot({
        path: info.outputPath('expanded-heading-title.png'),
        caret: 'initial',
      });
      errors.assertNone();
    } finally {
      errors.stop();
    }
  });
}
