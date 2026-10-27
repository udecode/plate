import {
  createBrowserEditorHarness,
  expect,
  recordBrowserRuntimeErrors,
  test,
} from '@platejs/test/playwright';

type Block = { children?: Block[]; text?: string; type?: string };

test('paints a date and an inline equation struck while Suggesting like the text around them', async ({
  page,
}) => {
  const errors = recordBrowserRuntimeErrors(page, { strict: true });

  await page.goto('/blocks/playground', { waitUntil: 'commit' });
  const root = page.locator('[data-editor="true"]').first();
  const editor = createBrowserEditorHarness(page, 'suggestion-void', root);

  await editor.ready({ editor: 'visible' });
  await page
    .getByRole('button', { name: 'Editing mode: Editing', exact: true })
    .click();
  await page
    .getByRole('menuitemradio', { name: 'Suggestion', exact: true })
    .click();

  const { children } = (await editor.get.modelValue()) as {
    children: Block[];
  };
  const index = children.findIndex((block) =>
    block.children?.some((child) => child.type === 'date')
  );
  const last = children[index].children!.length - 1;

  expect(index).toBeGreaterThanOrEqual(0);
  await editor.selection.select({
    anchor: { offset: 0, path: [index, 0] },
    focus: {
      offset: children[index].children![last].text!.length,
      path: [index, last],
    },
  });
  await root.press('Backspace');

  const line = root.locator(`[data-editor-path="${index}"]`).first();
  const struck = line
    .locator('[data-editor-node="text"][data-editor-authored-kind~="delete"]')
    .first();
  const date = line.getByRole('button', { name: 'January 15, 2024' });
  const equation = line.getByRole('button', { name: 'Edit equation' });
  const paint = (locator: typeof struck) =>
    locator.evaluate((node) => {
      const style = getComputedStyle(node);

      return {
        background: style.backgroundColor,
        line: style.textDecorationLine,
      };
    });

  await expect(struck).toBeVisible();
  const text = await paint(struck);

  expect(text.line).toBe('line-through');
  expect(await paint(date)).toEqual(text);
  expect(await paint(equation)).toEqual({
    background: text.background,
    line: 'line-through',
  });
  errors.assertNone();
});
