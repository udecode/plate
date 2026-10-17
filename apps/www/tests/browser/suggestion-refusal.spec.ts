import {
  createBrowserEditorHarness,
  recordBrowserRuntimeErrors,
} from '@platejs/test/playwright';
import { expect, type Page, test } from '@playwright/test';

const ROUTE = '/blocks/playground';

type Block = {
  children?: Block[];
  listType?: string;
  text?: string;
  type?: string;
};

const open = async (page: Page) => {
  await page.goto(ROUTE, { waitUntil: 'commit' });
  const root = page.locator('[data-editor="true"]').first();
  const editor = createBrowserEditorHarness(page, 'suggestion-refusal', root);

  await editor.ready({ editor: 'visible' });
  await page
    .getByRole('button', { name: 'Editing mode: Editing', exact: true })
    .click();
  await page
    .getByRole('menuitemradio', { name: 'Suggestion', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: 'Editing mode: Suggestion', exact: true })
  ).toBeVisible();

  const blocks = async () =>
    ((await editor.get.modelValue()) as { children: Block[] }).children;

  return { blocks, editor, root };
};

/** The path of the first text leaf inside `block`. */
const firstLeaf = (block: Block, path: number[]): number[] =>
  block.children ? firstLeaf(block.children[0], [...path, 0]) : path;

const caret = (path: number[], offset = 0) => ({
  anchor: { offset, path },
  focus: { offset, path },
});

const blockText = (page: Page, index: number) =>
  page
    .locator('[data-editor="true"]')
    .first()
    .locator(`[data-editor-path="${index}"]`)
    .first()
    .textContent();

for (const [place, match, words] of [
  ['a table cell', (block: Block) => block.type === 'table', 'tables'],
  ['a code block', (block: Block) => block.type === 'codeBlock', 'code blocks'],
  ['a list item', (block: Block) => Boolean(block.listType), 'lists'],
] as const) {
  test(`refuses typing in ${place} while Suggesting and says why`, async ({
    page,
  }) => {
    const errors = recordBrowserRuntimeErrors(page, { strict: true });
    const { blocks, editor } = await open(page);
    const before = await blocks();
    const index = before.findIndex(match);

    expect(index).toBeGreaterThanOrEqual(0);
    const text = await blockText(page, index);
    const leaf = firstLeaf(before[index], [index]);

    await editor.selection.select(caret(leaf));
    await page.keyboard.type('X');

    await expect(
      page.getByText(`Suggesting is off in ${words} for now.`, {
        exact: false,
      })
    ).toBeVisible();
    await expect.poll(blocks).toEqual(before);
    await expect.poll(() => blockText(page, index)).toBe(text);
    expect(await editor.selection.get()).toMatchObject(caret(leaf));
    errors.assertNone();
  });
}

test('gives back composed text a table cell refuses while Suggesting', async ({
  page,
}) => {
  const errors = recordBrowserRuntimeErrors(page, { strict: true });
  const { blocks, editor } = await open(page);
  const before = await blocks();
  const index = before.findIndex((block) => block.type === 'table');
  const text = await blockText(page, index);
  const leaf = firstLeaf(before[index], [index]);
  const client = await page.context().newCDPSession(page);

  await editor.selection.select(caret(leaf));
  await client.send('Input.imeSetComposition', {
    selectionEnd: 1,
    selectionStart: 1,
    text: 'に',
  });
  await client.send('Input.insertText', { text: 'に' });

  await expect(
    page.getByText('Suggesting is off in tables for now.', { exact: false })
  ).toBeVisible();
  await expect.poll(blocks).toEqual(before);
  await expect.poll(() => blockText(page, index)).toBe(text);
  errors.assertNone();
});

test('refuses turning a paragraph into a list while Suggesting', async ({
  page,
}) => {
  const errors = recordBrowserRuntimeErrors(page, { strict: true });
  const { blocks, editor } = await open(page);
  const before = await blocks();
  const index = before.findIndex(
    (block) =>
      block.type === 'paragraph' && !block.listType && block.children?.[0]?.text
  );

  await editor.selection.select(caret(firstLeaf(before[index], [index])));
  await page.keyboard.type('- ');

  await expect(
    page.getByText('Suggesting is off in lists for now.', { exact: false })
  ).toBeVisible();
  const after = await blocks();

  expect(after[index].listType).toBeUndefined();
  errors.assertNone();
});

test('keeps a paragraph next to a list suggestible', async ({ page }) => {
  const errors = recordBrowserRuntimeErrors(page, { strict: true });
  const { blocks, editor, root } = await open(page);
  const before = await blocks();
  const index = before.findIndex(
    (block, at) =>
      block.type === 'paragraph' &&
      !block.listType &&
      Boolean(before[at + 1]?.listType)
  );

  expect(index).toBeGreaterThanOrEqual(0);
  const leaf = firstLeaf(before[index], [index]);
  const text = before[index].children![0].text!;

  await editor.selection.select(caret(leaf, text.length));
  await page.keyboard.type('Z');

  await expect(
    root.locator(
      '[data-editor-node="text"][data-editor-authored-kind="insert"]',
      { hasText: 'Z' }
    )
  ).toBeVisible();
  await expect(
    page.getByText('Suggesting is off', { exact: false })
  ).toHaveCount(0);
  errors.assertNone();
});

test('refuses select all then Backspace or typing in the playground, applying nothing', async ({
  page,
}) => {
  const errors = recordBrowserRuntimeErrors(page, { strict: true });
  const { blocks, editor, root } = await open(page);
  const before = await blocks();

  await editor.selection.select(caret(firstLeaf(before[0], [0])));
  await root.press('ControlOrMeta+a');
  await root.press('Backspace');

  await expect(
    page.getByText('Suggesting is off in', { exact: false })
  ).toBeVisible();
  await expect.poll(blocks).toEqual(before);

  await page.keyboard.type('Q');
  await expect.poll(blocks).toEqual(before);
  errors.assertNone();
});
