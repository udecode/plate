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

const leafReading = (
  block: Block,
  path: number[],
  text: string
): number[] | null => {
  if (!block.children) return block.text === text ? path : null;

  for (const [index, child] of block.children.entries()) {
    const found = leafReading(child, [...path, index], text);

    if (found) return found;
  }

  return null;
};

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

const refusalToast = (page: Page) =>
  page.locator('[data-sonner-toast][data-type="error"]');

for (const [place, match] of [
  ['a table cell', (block: Block) => block.type === 'table'],
  ['a code block', (block: Block) => block.type === 'codeBlock'],
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

    await expect(refusalToast(page)).toBeVisible();
    await expect.poll(blocks).toEqual(before);
    await expect.poll(() => blockText(page, index)).toBe(text);
    expect(await editor.selection.get()).toMatchObject(caret(leaf));
    errors.assertNone();
  });
}

for (const [place, offset] of [
  ['at the end', 'Paid Extension'.length],
  ['in the middle', 4],
] as const) {
  test(`gives back a key typed ${place} of a table cell while Suggesting`, async ({
    page,
  }) => {
    const errors = recordBrowserRuntimeErrors(page, { strict: true });
    const { blocks, editor } = await open(page);
    const before = await blocks();
    const index = before.findIndex((block) => block.type === 'table');
    const text = await blockText(page, index);
    const cell = 'Paid Extension';
    const leaf = leafReading(before[index], [index], cell);

    expect(leaf).not.toBeNull();
    await editor.selection.select(caret(leaf!, offset));
    await page.keyboard.type('x');

    await expect(refusalToast(page)).toBeVisible();
    await expect.poll(blocks).toEqual(before);
    await expect.poll(() => blockText(page, index)).toBe(text);
    expect(await editor.selection.get()).toMatchObject(caret(leaf!, offset));
    await editor.assert.domCaret({ offset, text: cell });
    errors.assertNone();
  });
}

test('gives back composed text a table cell refuses while Suggesting', async ({
  browserName,
  page,
}) => {
  test.skip(browserName !== 'chromium', 'Chromium composition protocol');
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

  await expect(refusalToast(page)).toBeVisible();
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
  await expect(refusalToast(page)).toHaveCount(0);
  errors.assertNone();
});

test('records typing at the end of a list item while Suggesting and refuses Enter there', async ({
  page,
}) => {
  const errors = recordBrowserRuntimeErrors(page, { strict: true });
  const { blocks, editor, root } = await open(page);
  const before = await blocks();
  const index = before.findIndex((block) => block.listType === 'bulleted');

  expect(index).toBeGreaterThanOrEqual(0);
  const leaf = firstLeaf(before[index], [index]);
  const text = before[index].children![0].text!;
  const inserted = root.locator(
    '[data-editor-node="text"][data-editor-authored-kind="insert"]'
  );

  await editor.selection.select(caret(leaf, text.length));
  await page.keyboard.type(' now');

  await expect(inserted.filter({ hasText: 'now' })).toBeVisible();
  await expect.poll(() => blockText(page, index)).toBe(`${text} now`);
  await expect(refusalToast(page)).toHaveCount(0);
  const typed = await blocks();
  const selection = await editor.selection.get();

  await page.keyboard.press('Enter');

  await expect(refusalToast(page)).toBeVisible();
  await expect.poll(blocks).toEqual(typed);
  expect(await editor.selection.get()).toEqual(selection);

  await page.keyboard.type('new');

  await expect.poll(() => blockText(page, index)).toBe(`${text} nownew`);
  await expect(inserted.filter({ hasText: 'new' })).toBeVisible();
  const after = await blocks();

  expect(after).toHaveLength(before.length);
  expect(after[index].listType).toBe('bulleted');
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

  await expect(refusalToast(page)).toBeVisible();
  await expect.poll(blocks).toEqual(before);

  await page.keyboard.type('Q');
  await expect.poll(blocks).toEqual(before);
  errors.assertNone();
});
