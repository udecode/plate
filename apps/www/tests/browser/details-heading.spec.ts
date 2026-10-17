import { expect, type Locator, test } from '@playwright/test';

import type { PliteBrowserHandleElement } from '../../../../packages/plitejs/src/react/editable/browser-handle';
import { recordBrowserRuntimeErrors } from '../../../../packages/test/src/playwright/runtime-errors';
import { editorRoot, read } from './details-fixture';

const readDetails = (root: Locator, title: string) =>
  root.evaluate((element: PliteBrowserHandleElement, targetTitle) => {
    const handle = element.__EDITOR_BROWSER_HANDLE__!;
    const find = (
      nodes: ReturnType<typeof handle.getValue>['children']
    ): (typeof nodes)[number] | undefined => {
      for (const node of nodes) {
        const children = 'children' in node ? node.children : undefined;

        if (!children) continue;
        if (
          node.type === 'details' &&
          children[0] &&
          JSON.stringify(children[0]).includes(targetTitle)
        ) {
          return node;
        }

        const found = find(children);

        if (found) return found;
      }

      return undefined;
    };
    return find(handle.getValue().children);
  }, title);

const waitForHandle = (root: Locator) =>
  expect
    .poll(() =>
      root.evaluate((element: PliteBrowserHandleElement) =>
        Boolean(element.__EDITOR_BROWSER_HANDLE__)
      )
    )
    .toBe(true);

for (const route of ['details-demo', 'playground']) {
  test(`${route} formats a nested Details title without replacing its Summary`, async ({
    page,
  }, info) => {
    const errors = recordBrowserRuntimeErrors(page);
    await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
    try {
      await page.goto(`/blocks/${route}`);
      const root = editorRoot(page);
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
      const { model: selectionBefore } = await read(root);
      await page
        .getByRole('button', { name: 'Turn into: Text', exact: true })
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
        .poll(() => read(root).then(({ model }) => model))
        .toEqual(selectionBefore);
      await expect
        .poll(() => read(root).then(({ dom }) => dom))
        .toEqual(selectionBefore);
      const readSummary = async () => {
        const node = await readDetails(root, title);

        return node && 'children' in node ? node.children?.[0] : undefined;
      };
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
        .getByRole('button', { name: 'Turn into: Heading 2', exact: true })
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
        .getByRole('button', { name: 'Turn into: Heading 2', exact: true })
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

test('details-demo centers the toggle chevron on a heading title line', async ({
  page,
}) => {
  const errors = recordBrowserRuntimeErrors(page);
  try {
    await page.goto('/blocks/details-demo');
    const root = editorRoot(page);
    await waitForHandle(root);
    const name = 'Why use semantic Details?';
    const details = root
      .getByText(name, { exact: true })
      .locator(
        'xpath=ancestor::*[contains(concat(" ",normalize-space(@class)," ")," editor-details ")][1]'
      );
    const chevron = details
      .getByRole('button', { name: 'Expand details', exact: true })
      .locator('svg');
    const offset = async (title: Locator) => {
      const line = await title.evaluate((element) => {
        const style = getComputedStyle(element);

        return (
          element.getBoundingClientRect().top +
          Number.parseFloat(style.paddingTop) +
          Number.parseFloat(style.lineHeight) / 2
        );
      });
      const icon = await chevron.evaluate((element) => {
        const box = element.getBoundingClientRect();

        return box.top + box.height / 2;
      });

      return Math.abs(icon - line);
    };

    expect(
      await offset(details.locator('.editor-detailsSummary'))
    ).toBeLessThanOrEqual(1);
    await details.getByText(name, { exact: true }).click();
    await page.keyboard.press('ControlOrMeta+Alt+1');
    const heading = details.getByRole('heading', {
      level: 1,
      name,
      exact: true,
    });
    await expect(heading).toBeVisible();
    await expect.poll(() => offset(heading)).toBeLessThanOrEqual(1);
    errors.assertNone();
  } finally {
    errors.stop();
  }
});

test('playground centers the toggle chevron on a title enlarged by a font size', async ({
  page,
}) => {
  const errors = recordBrowserRuntimeErrors(page);
  try {
    await page.goto('/blocks/playground');
    const root = editorRoot(page);
    await waitForHandle(root);
    const name = 'Expand to explore Details';
    const details = root
      .getByText(name, { exact: true })
      .locator(
        'xpath=ancestor::*[contains(concat(" ",normalize-space(@class)," ")," editor-details ")][1]'
      );
    await details.getByText(name, { exact: true }).click({ clickCount: 3 });
    const font = page.getByRole('textbox', { name: 'Font size', exact: true });
    await font.fill('32');
    await font.press('Enter');
    const title = details.getByText(name, { exact: true });
    await expect(title).toHaveCSS('font-size', '32px');
    const chevron = details
      .getByRole('button', { name: 'Expand details', exact: true })
      .locator('svg');
    const offset = async () => {
      const line = await title.evaluate((element) => {
        const [box] = element.getClientRects();

        return box.top + box.height / 2;
      });
      const icon = await chevron.evaluate((element) => {
        const box = element.getBoundingClientRect();

        return box.top + box.height / 2;
      });

      return Math.abs(icon - line);
    };

    await expect.poll(offset).toBeLessThanOrEqual(1);
    errors.assertNone();
  } finally {
    errors.stop();
  }
});

for (const shortcut of ['ControlOrMeta+Alt+0', 'ControlOrMeta+Shift+0']) {
  test(`details-demo keeps a heading title in its Summary on ${shortcut}`, async ({
    page,
  }) => {
    const errors = recordBrowserRuntimeErrors(page);
    try {
      await page.goto('/blocks/details-demo');
      const root = editorRoot(page);
      const name = 'Why use semantic Details?';
      await waitForHandle(root);
      const key = await root
        .getByText(name, { exact: true })
        .locator(
          'xpath=ancestor::*[contains(concat(" ",normalize-space(@class)," ")," editor-details ")][1]'
        )
        .getAttribute('data-editor-node-key');
      const details = root.locator(
        `.editor-details[data-editor-node-key="${key}"]`
      );
      const before = await readDetails(root, name);
      await details.getByText(name, { exact: true }).click();
      await page.keyboard.press('ControlOrMeta+Alt+1');
      await expect(
        details.getByRole('heading', { level: 1, name, exact: true })
      ).toBeVisible();
      await page.keyboard.press(shortcut);
      await expect(details.getByRole('heading')).toHaveCount(0);
      await expect.poll(() => readDetails(root, name)).toEqual(before);
      errors.assertNone();
    } finally {
      errors.stop();
    }
  });
}
