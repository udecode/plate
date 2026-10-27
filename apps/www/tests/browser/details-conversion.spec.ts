import { expect, test } from '@platejs/test/playwright';
import type { Locator } from '@playwright/test';

import type { PliteBrowserHandleElement } from '../../../../packages/plitejs/src/react/editable/browser-handle';
import { recordBrowserRuntimeErrors } from '../../../../packages/test/src/playwright/runtime-errors';
import { editorRoot, read } from './details-fixture';

const nodeAt = (root: Locator, path: number[]) =>
  root.evaluate((element: PliteBrowserHandleElement, at) => {
    let { children } = element.__EDITOR_BROWSER_HANDLE__!.getValue();
    for (const index of at.slice(0, -1)) {
      const parent = children[index];
      if (!parent?.children) return null;
      ({ children } = parent);
    }
    return children[at.at(-1)!];
  }, path);

for (const item of [
  {
    route: 'details-demo',
    format: 'list',
    label: 'Bulleted list',
    listType: 'bulleted',
  },
  {
    route: 'details-demo',
    format: 'list',
    label: 'Numbered list',
    listType: 'numbered',
  },
  {
    route: 'playground',
    format: 'list',
    label: 'To-do list',
    listType: 'task',
  },
  { route: 'playground', format: 'code' },
] as const) {
  const { route, format } = item;
  const listType = item.format === 'list' ? item.listType : undefined;
  test(`${route}: convert an inner Details to ${listType ?? format} and preserve its body`, async ({
    page,
  }, info) => {
    const errors = recordBrowserRuntimeErrors(page);
    await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
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
    const body =
      route === 'details-demo'
        ? 'Yes. Nested Details are ordinary body blocks.'
        : 'Expand each block independently to explore its content.';
    const summary = root.getByText(title, { exact: true });
    const container = summary.locator(
      'xpath=ancestor::*[contains(concat(" ",normalize-space(@class)," ")," editor-details ")][1]'
    );
    const innerKey = await container.getAttribute('data-editor-node-key');
    const outer = root.locator('.editor-details').first();
    const outerKey = await outer.getAttribute('data-editor-node-key');
    const path = (await container.getAttribute('data-editor-path'))!
      .split(',')
      .map(Number);
    const before = await read(root);
    await summary.click();
    await page.keyboard.press('Home');
    await page.keyboard.press('Shift+ArrowRight');
    await page.keyboard.press('Shift+ArrowRight');
    const selection = {
      anchor: { path: [...path, 0], offset: 0 },
      focus: { path: [...path, 0], offset: 2 },
    };
    try {
      if (format === 'list') {
        await page
          .getByRole('button', { name: 'Turn into: Text', exact: true })
          .last()
          .click();
        await page
          .getByRole('menuitemradio', { name: item.label, exact: true })
          .click();
      } else {
        await page.keyboard.press('ControlOrMeta+Alt+8');
      }
      await page.screenshot({ path: info.outputPath('converted.png') });
      await expect(
        root.locator(`.editor-details[data-editor-node-key="${innerKey}"]`)
      ).toHaveCount(0);
      await expect(
        root.locator(`.editor-details[data-editor-node-key="${outerKey}"]`)
      ).toBeVisible();
      await expect(root.getByText(body, { exact: true })).toBeVisible();
      await expect
        .poll(() => read(root))
        .toMatchObject({ model: selection, dom: selection, focused: true });
      expect(await nodeAt(root, path)).toMatchObject({
        type: format === 'list' ? 'paragraph' : 'codeBlock',
        children: [{ text: title }],
        ...(format === 'list' ? { listType, indent: 1 } : {}),
      });
      expect(
        await nodeAt(root, [...path.slice(0, -1), path.at(-1)! + 1])
      ).toMatchObject({
        type: 'paragraph',
        children: [{ text: body }],
        ...(format === 'list' ? { indent: 2 } : {}),
      });
      await page.keyboard.press('ControlOrMeta+z');
      await expect
        .poll(async () => {
          const state = await read(root);
          return state.value;
        })
        .toEqual(before.value);
      await expect(
        root
          .locator(`.editor-details[data-editor-node-key="${innerKey}"]`)
          .getByRole('button')
          .first()
      ).toHaveAttribute('aria-expanded', 'false');
      await page.keyboard.press('ControlOrMeta+Shift+z');
      await expect
        .poll(() => read(root))
        .toMatchObject({ model: selection, dom: selection });
      await page.keyboard.type('Z');
      await expect(
        root.getByText(`Z${title.slice(2)}`, { exact: true })
      ).toBeVisible();
      await expect(root.getByText(body, { exact: true })).toBeVisible();
      await page.screenshot({ path: info.outputPath('typed.png') });
      if (listType === 'bulleted') {
        await page.keyboard.press('Tab');
        await expect
          .poll(() => nodeAt(root, path))
          .toMatchObject({ indent: 2 });
        await expect
          .poll(() => nodeAt(root, [...path.slice(0, -1), path.at(-1)! + 1]))
          .toMatchObject({ indent: 3 });
        await page.keyboard.press('Shift+Tab');
        await expect
          .poll(() => nodeAt(root, path))
          .toMatchObject({ indent: 1 });
        await expect
          .poll(() => nodeAt(root, [...path.slice(0, -1), path.at(-1)! + 1]))
          .toMatchObject({ indent: 2 });
        const convertedState = await read(root);
        const source = root
          .locator('.editor-blockWrapper')
          .filter({ hasText: `Z${title.slice(2)}` })
          .last();
        const target = root.getByText(
          'Content after Details remains an ordinary sibling block.',
          { exact: true }
        );
        await source.hover();
        const handle = source
          .locator('xpath=..')
          .getByRole('button', { name: 'Drag block', exact: true })
          .first();
        await handle.hover();
        const from = await handle.boundingBox();
        const to = await target.boundingBox();
        expect(from).not.toBeNull();
        expect(to).not.toBeNull();
        await page.mouse.move(
          from!.x + from!.width / 2,
          from!.y + from!.height / 2
        );
        await page.mouse.down();
        await page.mouse.move(to!.x + 80, to!.y + to!.height - 2, {
          steps: 15,
        });
        await expect(page.locator('[data-drop-indicator]')).toBeVisible();
        await page.mouse.up();
        await expect
          .poll(async () => {
            const state = await read(root);
            return state.value?.slice(-2);
          })
          .toMatchObject([
            {
              type: 'paragraph',
              listType: 'bulleted',
              indent: 1,
              children: [{ text: `Z${title.slice(2)}` }],
            },
            { type: 'paragraph', indent: 2, children: [{ text: body }] },
          ]);
        await page.screenshot({ path: info.outputPath('moved.png') });
        await page.keyboard.press('ControlOrMeta+z');
        await expect
          .poll(async () => {
            const state = await read(root);
            return state.value;
          })
          .toEqual(convertedState.value);
      }
      errors.assertNone();
    } finally {
      errors.stop();
    }
  });
}

test('playground: show the Structure group in the Turn into menu', async ({
  page,
}) => {
  await page.goto('/blocks/playground');
  await editorRoot(page)
    .locator('[data-editor-string]', { hasText: 'Rich Content Editing' })
    .click();
  await page
    .getByRole('button', { name: /^Turn into:/ })
    .first()
    .click();
  await expect(
    page.getByRole('menuitemcheckbox', { name: 'Code', exact: true })
  ).toBeVisible();
});
