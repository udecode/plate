import {
  BROWSER_HANDLE_KEY,
  createBrowserEditorHarness,
  expect,
  recordBrowserRuntimeErrors,
  test,
} from '@platejs/test/playwright';
import type { Locator, Page } from '@playwright/test';

const ROUTE = '/blocks/suggestion-demo';
const THIRD_PARAGRAPH = 'Try typing your own suggestion here.';
const PLAYGROUND_TITLE = 'Welcome to the Plate Playground!';

type SuggestionPaintSnapshot = {
  input: number;
  model: string | null;
  spans: Array<{
    end: number;
    index: number;
    start: number;
    text: string;
  }>;
  text: string;
};

// A review mark paints its attributes on both the text node and the leaf
// inside it; the text node is the one painted, so locators target it.
const authoredText = (scope: Locator, attributes: string) =>
  scope.locator(`[data-editor-node="text"]${attributes}`);

type ReviewNode = {
  authored?: Array<{ author: string; kind: string }>;
  children?: ReviewNode[];
  text?: string;
};

const leavesOf = (node: ReviewNode): ReviewNode[] =>
  node.children ? node.children.flatMap(leavesOf) : [node];

/** Each block as `[block marks] leaf|leaf[kind:author]`, inline elements flattened to their leaves. */
const reviewTree = async (editor: {
  get: { modelValue: () => Promise<unknown> };
}) =>
  ((await editor.get.modelValue()) as { children: ReviewNode[] }).children.map(
    (block) =>
      `${block.authored?.length ? `[${block.authored.map((mark) => mark.kind).join(',')}] ` : ''}${leavesOf(
        block
      )
        .map((leaf) =>
          leaf.authored?.length
            ? `${leaf.text}[${leaf.authored.map((mark) => `${mark.kind}:${mark.author}`).join(',')}]`
            : leaf.text
        )
        .join('|')}`
  );

const enterSuggestionMode = async (page: Page) => {
  await page
    .getByRole('button', { name: 'Editing mode: Editing', exact: true })
    .click();
  await page
    .getByRole('menuitemradio', { name: 'Suggestion', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: 'Editing mode: Suggestion', exact: true })
  ).toBeVisible();
};

for (const [name, route] of [
  ['editor-ai', '/blocks/editor-ai'],
  ['playground', '/blocks/playground'],
] as const) {
  test(`${name} opens in editing mode with pending suggestions visible`, async ({
    page,
  }) => {
    const runtimeErrors = recordBrowserRuntimeErrors(page, { strict: true });

    await page.goto(route, { waitUntil: 'commit' });
    const root = page.locator('[data-editor="true"]').first();

    await expect(root).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Editing mode: Editing', exact: true })
    ).toBeVisible();
    await expect(
      authoredText(root, '[data-editor-authored-author="alice"]')
        .filter({ hasText: 'suggestions' })
        .first()
    ).toBeVisible();
    await expect(
      authoredText(
        root,
        '[data-editor-authored-author="bob"][data-editor-authored-kind~="delete"]'
      )
    ).toContainText('mark text for removal');
    runtimeErrors.assertNone();
  });
}

test('playground types and pastes direct edits without changing pending suggestions', async ({
  page,
}) => {
  const runtimeErrors = recordBrowserRuntimeErrors(page, { strict: true });
  await page.goto('/blocks/playground', { waitUntil: 'commit' });
  const root = page.locator('[data-editor="true"]').first();
  const editor = createBrowserEditorHarness(page, 'playground editing', root);
  const headingText = 'Welcome to the Plate Playground!';
  const heading = root.locator('[data-editor-node="element"]').first();
  const pending = root.locator('[data-editor-authored-change]');

  await editor.ready({ editor: 'visible', text: headingText });
  const pendingIds = await pending.evaluateAll((elements) =>
    elements.map((element) =>
      element.getAttribute('data-editor-authored-change')
    )
  );
  await editor.selection.collapse({
    path: [0, 0],
    offset: headingText.length,
  });
  await editor.focus();
  await page.keyboard.type('?');

  await editor.assert.modelBlockText(0, `${headingText}?`);
  await editor.clipboard.pasteText('Pasted');
  await editor.assert.modelBlockText(0, `${headingText}?Pasted`);
  await expect(
    authoredText(heading, '[data-editor-authored-kind~="insert"]')
  ).toHaveCount(0);
  expect(
    await pending.evaluateAll((elements) =>
      elements.map((element) =>
        element.getAttribute('data-editor-authored-change')
      )
    )
  ).toEqual(pendingIds);
  runtimeErrors.assertNone();
});

test('playground title can change to H2 from the toolbar', async ({ page }) => {
  const runtimeErrors = recordBrowserRuntimeErrors(page, { strict: true });

  await page.goto('/blocks/playground', { waitUntil: 'commit' });
  const root = page.locator('[data-editor="true"]').first();
  const editor = createBrowserEditorHarness(page, 'playground title', root);

  await editor.ready({ editor: 'visible', text: PLAYGROUND_TITLE });
  await editor.selection.collapse({ offset: 0, path: [0, 0] });
  await editor.focus();
  await page.getByRole('button', { name: 'Heading 1' }).click();
  await page.getByRole('menuitemradio', { name: 'Heading 2' }).click();

  await expect(root.getByRole('heading', { level: 2 }).first()).toContainText(
    PLAYGROUND_TITLE
  );
  runtimeErrors.assertNone();
});

test('playground preserves a table pasted over part of its heading', async ({
  page,
}) => {
  const runtimeErrors = recordBrowserRuntimeErrors(page, { strict: true });
  await page.goto('/blocks/playground', { waitUntil: 'commit' });
  const root = page.locator('[data-editor="true"]').first();
  const editor = createBrowserEditorHarness(
    page,
    'playground title paste',
    root
  );

  await editor.ready({ editor: 'visible', text: PLAYGROUND_TITLE });
  await editor.selection.select({
    anchor: { path: [0, 0], offset: 1 },
    focus: { path: [0, 0], offset: 3 },
  });
  await editor.clipboard.pasteHtml(
    '<table><tbody><tr><td><p>Pasted cell</p></td></tr></tbody></table>',
    'Pasted cell'
  );

  await editor.assert.modelBlockText(0, 'W');
  await editor.assert.modelBlockText(2, 'come to the Plate Playground!');
  await expect(root.getByRole('heading', { level: 1 })).toHaveCount(2);
  await expect(root.locator('table').first()).toContainText('Pasted cell');
  const pasted = (await editor.get.modelValue()) as {
    children: Array<{ type?: string }>;
  };
  expect(pasted.children.some((node) => node.type === 'table')).toBe(true);

  await root.press('ControlOrMeta+Z');
  await editor.assert.modelBlockText(0, PLAYGROUND_TITLE);
  const undone = (await editor.get.modelValue()) as {
    children: Array<{ type?: string }>;
  };
  expect(undone.children[1]).toMatchObject({
    type: 'paragraph',
  });
  await root.press('ControlOrMeta+Shift+Z');
  await expect(root.locator('table').first()).toContainText('Pasted cell');
  runtimeErrors.assertNone();
});

test('playground deletes commented text directly in editing mode', async ({
  page,
}) => {
  const runtimeErrors = recordBrowserRuntimeErrors(page, { strict: true });
  await page.goto('/blocks/playground-demo', { waitUntil: 'commit' });
  const root = page.locator('[data-editor="true"]').first();
  const editor = createBrowserEditorHarness(
    page,
    'playground commented deletion',
    root
  );
  const authored = root.locator('[data-editor-authored-change]');

  await editor.ready({
    editor: 'visible',
    text: 'Welcome to the Plate Playground!',
  });
  await expect(
    page.getByRole('button', { name: 'Editing mode: Editing', exact: true })
  ).toBeVisible();
  await expect(
    root.locator('[data-discussion-block-trigger]')
  ).toHaveAccessibleName('Open 5 discussion items for this block');
  const before = await editor.get.modelBlockText(3);
  const changeIds = await authored.evaluateAll((elements) => [
    ...new Set(
      elements.map((element) =>
        element.getAttribute('data-editor-authored-change')
      )
    ),
  ]);

  expect(before).toContain('comments on many text segments.');
  // Review coordinates: the pending insertion and deletion keep their own
  // text nodes, so the "comments" link sits at [3, 6].
  await editor.selection.select({
    anchor: { path: [3, 6, 0], offset: 0 },
    focus: { path: [3, 7], offset: 23 },
  });
  await editor.focus();
  await page.keyboard.press('Backspace');

  await editor.assert.modelBlockText(
    3,
    before!.replace('comments on many text segments.', '')
  );
  expect(
    await authored.evaluateAll((elements) => [
      ...new Set(
        elements.map((element) =>
          element.getAttribute('data-editor-authored-change')
        )
      ),
    ])
  ).toEqual(changeIds);
  await expect(
    root.locator('[data-discussion-block-trigger]')
  ).toHaveAccessibleName('Open 4 discussion items for this block');
  runtimeErrors.assertNone();
});

test('homepage select-all deletion stays editable', async ({ page }) => {
  const runtimeErrors = recordBrowserRuntimeErrors(page, { strict: true });

  await page.goto('/', { waitUntil: 'commit' });
  const root = page.locator('[data-editor="true"]').first();
  const editor = createBrowserEditorHarness(
    page,
    'homepage select-all deletion',
    root
  );

  await editor.ready({
    editor: 'visible',
    text: PLAYGROUND_TITLE,
  });
  const initialBlocks = await editor.get.modelBlockTexts();
  expect(initialBlocks.length).toBeGreaterThan(1);

  await editor.focus();
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.press('Backspace');
  // Editing removes the live text and keeps Bob's pending deletion as its own
  // struck line, so accepting it leaves the plain editor's one empty line.
  const emptyLine = 1;
  await expect
    .poll(() => reviewTree(editor))
    .toEqual(['[delete] mark text for removal[delete:bob]', '']);
  await editor.assert.selection({
    anchor: { path: [emptyLine, 0], offset: 0 },
    focus: { path: [emptyLine, 0], offset: 0 },
  });

  await page.keyboard.type('x');

  await expect
    .poll(() => reviewTree(editor))
    .toEqual(['[delete] mark text for removal[delete:bob]', 'x']);
  await editor.assert.collapsedModelDOMSelection({
    path: [emptyLine, 0],
    offset: 1,
    text: 'x',
  });
  runtimeErrors.assertNone();
});

test('homepage preserves consecutive empty paragraphs before follow-up typing', async ({
  page,
}) => {
  const runtimeErrors = recordBrowserRuntimeErrors(page, { strict: true });

  await page.goto('/', { waitUntil: 'commit' });
  const root = page.locator('[data-editor="true"]').first();
  const editor = createBrowserEditorHarness(
    page,
    'homepage consecutive Enter',
    root
  );

  await editor.ready({
    editor: 'visible',
    text: PLAYGROUND_TITLE,
  });
  // Bob's pending deletion stays as a struck first line, so every live line
  // below sits one index later than in a plain editor.
  const struck = 'mark text for removal';

  await editor.selectAll();
  await editor.deleteFragment();
  await editor.assert.modelBlockTexts([struck, '']);
  await editor.focus();

  await page.keyboard.press('Enter');
  await editor.assert.modelBlockTexts([struck, '', '']);
  await editor.assert.selection({
    anchor: { path: [2, 0], offset: 0 },
    focus: { path: [2, 0], offset: 0 },
  });
  await page.keyboard.press('Enter');
  await editor.assert.modelBlockTexts([struck, '', '', '']);
  await editor.assert.selection({
    anchor: { path: [3, 0], offset: 0 },
    focus: { path: [3, 0], offset: 0 },
  });
  await page.keyboard.type('x');
  await editor.assert.modelBlockTexts([struck, '', '', 'x']);
  await editor.assert.collapsedModelDOMSelection({
    path: [3, 0],
    offset: 1,
    text: 'x',
  });
  runtimeErrors.assertNone();
});

test('playground deletes mixed accepted and pending text directly in editing mode', async ({
  page,
}, testInfo) => {
  const runtimeErrors = recordBrowserRuntimeErrors(page, { strict: true });
  await page.goto('/', { waitUntil: 'commit' });
  const root = page.locator('[data-editor="true"]').first();
  const editor = createBrowserEditorHarness(
    page,
    'playground mixed pending deletion',
    root
  );

  await editor.ready({
    editor: 'visible',
    text: 'Welcome to the Plate Playground!',
  });
  await expect(
    page.getByRole('button', { name: 'Editing mode: Editing', exact: true })
  ).toBeVisible();
  const paragraph = root.locator('.editor-paragraph').filter({
    hasText: 'Review and refine content seamlessly.',
  });
  const authored = root.locator('[data-editor-authored-change]');
  const [before, pendingIds] = await Promise.all([
    editor.get.modelBlockText(3),
    authored.evaluateAll((elements) => [
      ...new Set(
        elements.map((element) =>
          element.getAttribute('data-editor-authored-change')
        )
      ),
    ]),
  ]);
  if (!before) throw new Error('Missing paragraph text.');
  const prefix = 'Review and refine content seamlessly. Use ';
  const startOffset = prefix.length - 'Use '.length;
  await editor.selection.dragTextRange({
    endAffinity: 'after',
    endOffset: 'suggestions'.length,
    endText: 'suggestions',
    startOffset,
    text: prefix,
  });
  await editor.assert.selection({
    anchor: { path: [3, 0], offset: startOffset },
    focus: { path: [3, 2], offset: 0 },
  });
  await expect(root).toBeFocused();
  await page.keyboard.press('Backspace');

  await editor.assert.modelBlockText(3, before.replace('Use suggestions', ''));
  const remainingIds = await authored.evaluateAll((elements) => [
    ...new Set(
      elements.map((element) =>
        element.getAttribute('data-editor-authored-change')
      )
    ),
  ]);
  // Alice's insertion also holds " like this added text", so it stays
  // pending; the direct edit records no change of its own.
  expect(remainingIds).toEqual(pendingIds);
  await expect(root.locator('a[href="/docs/suggestion"]')).toHaveCount(0);
  await expect(
    authoredText(paragraph, '[data-editor-authored-kind~="delete"]').filter({
      hasText: 'Use',
    })
  ).toHaveCount(0);
  await paragraph.scrollIntoViewIfNeeded();
  await testInfo.attach('mixed-pending-direct-edit.png', {
    body: await paragraph.screenshot({
      caret: 'initial',
      path: testInfo.outputPath('mixed-pending-direct-edit.png'),
    }),
    contentType: 'image/png',
  });
  runtimeErrors.assertNone();
});

test("homepage Editing deletes the live text around another author's struck text and keeps their deletion", async ({
  page,
}) => {
  const runtimeErrors = recordBrowserRuntimeErrors(page, { strict: true });
  await page.goto('/', { waitUntil: 'commit' });
  const root = page.locator('[data-editor="true"]').first();
  const editor = createBrowserEditorHarness(
    page,
    'homepage struck text inside a direct deletion',
    root
  );

  await editor.ready({
    editor: 'visible',
    text: 'Welcome to the Plate Playground!',
  });
  const before = await editor.get.modelBlockText(3);
  if (!before) throw new Error('Missing paragraph text.');

  const selectedText = await root.evaluate((element: HTMLElement) => {
    const walker = element.ownerDocument.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT
    );
    const nodes: Node[] = [];

    while (walker.nextNode()) nodes.push(walker.currentNode);

    const startNode = nodes.find((node) => node.textContent === ' or to ');
    const endNode = nodes.find(
      (node) => node.textContent === '. Discuss changes using '
    );
    const selection = element.ownerDocument.getSelection();
    if (!startNode || !endNode || !selection) {
      throw new Error('Missing struck-text DOM boundary.');
    }

    element.focus();
    selection.setBaseAndExtent(startNode, 1, endNode, '. Discuss'.length);
    element.ownerDocument.dispatchEvent(
      new Event('selectionchange', { bubbles: true })
    );

    return selection.toString();
  });
  expect(selectedText.replaceAll('\u00A0', ' ')).toContain(
    'mark text for removal'
  );
  await page.waitForTimeout(100);

  await page.keyboard.press('Backspace');
  await editor.assert.modelBlockText(
    3,
    before.replace('or to ', '').replace('. Discuss', '')
  );
  await expect(
    authoredText(
      root,
      '[data-editor-authored-author="bob"][data-editor-authored-kind~="delete"]'
    )
  ).toHaveText('mark text for removal');
  runtimeErrors.assertNone();
});

test('homepage removes a multi-block selection over struck text in Editing and keeps the struck line', async ({
  page,
}, testInfo) => {
  const runtimeErrors = recordBrowserRuntimeErrors(page, { strict: true });
  // The deletion pulls the lazy Potion iframe into the viewport, and Firefox
  // logs potion.platejs.org's obsolete allow-from X-Frame-Options as an error.
  await page.route('https://potion.platejs.org/**', (route) =>
    route.fulfill({ body: '', contentType: 'text/html' })
  );
  await page.setViewportSize({ height: 1000, width: 1440 });
  await page.goto('/', { waitUntil: 'commit' });
  const root = page.locator('[data-editor="true"]').first();
  const editor = createBrowserEditorHarness(
    page,
    'homepage mixed-suggestion multi-block deletion',
    root
  );
  const collaborative = root.getByRole('heading', {
    name: 'Collaborative Editing',
  });
  const ai = root.getByRole('heading', { name: 'AI-Powered Editing' });
  const richContent = root.getByRole('heading', {
    name: 'Rich Content Editing',
  });
  const bobDeletion = authoredText(
    root,
    '[data-editor-authored-author="bob"][data-editor-authored-kind~="delete"]'
  );
  const finalLine = 'Edit existing text (improve, fix grammar, change tone)';

  await editor.ready({ editor: 'visible', text: PLAYGROUND_TITLE });
  const [intro, linkLine] = await editor.get.modelBlockTexts();
  await editor.selection.dragTextRange({
    direction: 'backward',
    endAffinity: 'after',
    endOffset: finalLine.length,
    endText: finalLine,
    startOffset: 0,
    text: 'Collaborative Editing',
  });
  await expect
    .poll(() => editor.get.displayedSelection())
    .toMatchObject({ doubleHighlighted: false, source: 'native' });
  const handle = collaborative
    .locator('xpath=ancestor::div[contains(@class, "relative")][1]')
    .getByRole('button', { name: 'Drag block', exact: true });
  await handle.hover();

  await page.keyboard.press('Backspace');

  await testInfo.attach('mixed-suggestion-block-delete.png', {
    body: await root.screenshot({
      caret: 'initial',
      path: testInfo.outputPath('mixed-suggestion-block-delete.png'),
    }),
    contentType: 'image/png',
  });

  // Whole blocks go, as without struck text; Bob's struck text stays as its
  // own struck line, and the caret lands at the end of the line before.
  await expect(collaborative).toHaveCount(0);
  await expect(ai).toHaveCount(0);
  await expect(richContent).toBeVisible();
  const texts = await editor.get.modelBlockTexts();

  expect(texts.slice(0, 4)).toEqual([
    intro,
    linkLine,
    'mark text for removal',
    'Rich Content Editing',
  ]);
  const tree = await reviewTree(editor);

  expect(tree[2]).toBe('[delete] mark text for removal[delete:bob]');
  await editor.assert.collapsedModelDOMSelection({
    path: [1, 4],
    offset: ' to discover more.'.length,
    text: ' to discover more.',
  });
  await editor.undo();
  await expect(collaborative).toBeVisible();
  await expect(ai).toBeVisible();
  await expect(bobDeletion).toHaveText('mark text for removal');
  await editor.redo();
  await expect(collaborative).toHaveCount(0);
  await expect(ai).toHaveCount(0);
  await page.keyboard.type('x');
  await editor.assert.modelBlockText(1, `${linkLine}x`);
  await expect(bobDeletion).toHaveText('mark text for removal');
  runtimeErrors.assertNone();
});

test('suggestion demo opens in suggesting mode', async ({ page }) => {
  const runtimeErrors = recordBrowserRuntimeErrors(page, { strict: true });

  await page.goto(ROUTE, { waitUntil: 'commit' });
  const root = page.locator('[data-editor="true"]').first();

  await expect(root).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Editing mode: Suggestion', exact: true })
  ).toBeVisible();
  runtimeErrors.assertNone();
});

for (const { keys, kind, marker } of [
  {
    keys: ['End', ...new Array(16).fill('ArrowLeft'), 'Enter'],
    kind: 'split',
    marker: { content: '"¶"', line: 'none' },
  },
  {
    keys: ['Home', 'Backspace'],
    kind: 'join',
    marker: { content: '"¶"', line: 'line-through' },
  },
  {
    keys: ['Home', 'Shift+End', 'Backspace'],
    kind: 'delete',
    marker: { content: '""', line: 'none' },
  },
]) {
  test(`marks a suggested ${kind} in the gutter in its change's color`, async ({
    page,
  }) => {
    const runtimeErrors = recordBrowserRuntimeErrors(page, { strict: true });

    await page.goto(ROUTE, { waitUntil: 'commit' });
    const root = page.locator('[data-editor="true"]').first();

    await expect(
      page.getByRole('button', {
        name: 'Editing mode: Suggestion',
        exact: true,
      })
    ).toBeVisible();
    await root.getByText(THIRD_PARAGRAPH).click();
    for (const key of keys) await page.keyboard.press(key);

    const block = root.locator(
      `[data-editor-node="element"][data-editor-authored-kind~="${kind}"]`
    );

    await expect(block).toHaveCount(1);
    const paint = await block.evaluate((node) => {
      const after = getComputedStyle(node, '::after');
      const probe = document.createElement('span');

      probe.style.color = getComputedStyle(node)
        .getPropertyValue('--suggestion-fg')
        .trim();
      document.body.append(probe);
      const change = getComputedStyle(probe).color;
      probe.remove();

      return {
        change,
        content: after.content,
        line: after.textDecorationLine,
        marker: after.content === '""' ? after.backgroundColor : after.color,
      };
    });

    expect(paint).toEqual({
      ...marker,
      change: paint.change,
      marker: paint.change,
    });
    expect(paint.change).toMatch(/^(rgb|oklch|color)\(/);
    runtimeErrors.assertNone();
  });
}

test('loads the saved editor-ai suggestions with linked replies and empty initial history', async ({
  page,
}) => {
  const runtimeErrors = recordBrowserRuntimeErrors(page, { strict: true });
  await page.goto('/blocks/editor-ai', { waitUntil: 'commit' });
  const root = page.locator('[data-editor="true"]').first();
  const harness = createBrowserEditorHarness(page, 'saved editor-ai', root);
  await harness.ready({ editor: 'visible', text: 'Collaborative Editing' });
  await expect(
    page.getByRole('button', { name: 'Editing mode: Editing', exact: true })
  ).toBeVisible();

  for (const [author, text] of [
    ['alice', 'suggestions'],
    ['bob', 'mark text for removal'],
    ['charlie', 'overlapping'],
  ]) {
    await expect(
      root
        .locator(`[data-editor-authored-author="${author}"]`)
        .filter({ hasText: text })
        .first()
    ).toBeVisible();
  }
  await expect(
    authoredText(root, '[data-editor-authored-author="alice"]')
      .filter({ hasText: 'like this added text' })
      .first()
  ).toHaveCSS('text-decoration-line', 'underline');
  expect(
    ((await harness.get.history()) as { undos: unknown[] }).undos
  ).toHaveLength(0);
  await root.locator('[data-discussion-block-trigger]').first().click();
  await expect(
    page.getByText(
      'Nice demonstration of overlapping annotations with both comments and suggestions!',
      { exact: true }
    )
  ).toBeVisible();
  const alice = page
    .locator('[data-suggestion-review]')
    .filter({ hasText: 'suggestions like this added text' });
  await expect(alice).toHaveCount(1);
  await alice.hover();
  await alice.getByRole('button', { name: 'Accept suggestion' }).click();
  await expect(alice).toHaveCount(0);
  await harness.undo();
  await root.locator('[data-discussion-block-trigger]').first().click();
  await expect(alice).toHaveCount(1);
  await expect(root.locator('a[href="/docs/suggestion"]')).toHaveText(
    'suggestions'
  );
  await page.reload({ waitUntil: 'commit' });
  await harness.ready({ editor: 'visible', text: 'Collaborative Editing' });
  await expect(
    page.getByRole('button', { name: 'Editing mode: Editing', exact: true })
  ).toBeVisible();
  expect(
    ((await harness.get.history()) as { undos: unknown[] }).undos
  ).toHaveLength(0);
  await expect(
    authoredText(
      root,
      '[data-editor-authored-author="bob"][data-editor-authored-kind~="delete"]'
    )
  ).toContainText('mark text for removal');
  runtimeErrors.assertNone();
});

test("restores another author's suggestion after canceling text typed inside it", async ({
  page,
}) => {
  const runtimeErrors = recordBrowserRuntimeErrors(page, { strict: true });
  await page.goto('/blocks/editor-ai', { waitUntil: 'commit' });
  const root = page.locator('[data-editor="true"]').first();
  const editor = createBrowserEditorHarness(page, 'saved editor-ai', root);
  await editor.ready({ editor: 'visible', text: 'Collaborative Editing' });
  await enterSuggestionMode(page);
  const charlie = authoredText(
    root,
    '[data-editor-authored-author="charlie"][data-editor-authored-kind~="insert"]'
  );
  const alice = authoredText(root, '[data-editor-authored-author="alice"]');
  const paragraph = root.locator('.editor-paragraph').filter({
    hasText: 'Review and refine content seamlessly.',
  });
  const blockTexts = await editor.get.modelBlockTexts();
  const paragraphText = blockTexts[3];

  await expect(charlie).toHaveCount(1);
  await expect(charlie).toHaveText('overlapping ');
  expect(paragraphText).toContain('overlapping');
  const aliceCount = await alice.count();
  const { children: blocks } = (await editor.get.modelValue()) as {
    children: Array<{ children: ReviewNode[] }>;
  };
  const charlieIndex = blocks[3].children.findIndex((child) =>
    child.authored?.some(
      (mark) => mark.author === 'charlie' && mark.kind === 'insert'
    )
  );
  const charliePath = [3, charlieIndex];
  const typedPath = [3, charlieIndex + 1];
  const offset = 'over'.length;
  await editor.selection.collapse({ path: charliePath, offset });
  await page.keyboard.type('xyz');
  await editor.assert.modelBlockText(
    3,
    paragraphText.replace('overlapping', 'overxyzlapping')
  );
  await editor.assert.collapsedModelDOMSelection({
    path: typedPath,
    offset: 3,
    text: 'xyz',
  });
  await expect(charlie).toHaveCount(2);
  await page.keyboard.press('Backspace');
  await editor.assert.modelBlockText(
    3,
    paragraphText.replace('overlapping', 'overxylapping')
  );
  await editor.assert.collapsedModelDOMSelection({
    path: typedPath,
    offset: 2,
    text: 'xy',
  });
  await page.keyboard.press('Backspace');
  await editor.assert.modelBlockText(
    3,
    paragraphText.replace('overlapping', 'overxlapping')
  );
  await editor.assert.collapsedModelDOMSelection({
    path: typedPath,
    offset: 1,
    text: 'x',
  });
  await page.keyboard.press('Backspace');
  await editor.assert.modelBlockText(3, paragraphText);
  await editor.assert.collapsedModelDOMSelection({
    path: charliePath,
    offset,
    text: 'overlapping ',
  });

  await expect(charlie).toHaveCount(1);
  await expect(charlie).toHaveText('overlapping ');
  await expect(paragraph).toContainText('overlapping annotations!');
  await expect(alice).toHaveCount(aliceCount);
  runtimeErrors.assertNone();
});

test('keeps markup visible when changing mode and restores the initial mode when reloading a snapshot', async ({
  page,
}) => {
  const runtimeErrors = recordBrowserRuntimeErrors(page, { strict: true });
  await page.goto('/blocks/suggestion-persistence-demo', {
    waitUntil: 'commit',
  });
  const root = page.getByRole('textbox', {
    name: 'Saved suggestions document',
  });
  await expect(root).toContainText('the update');
  await page
    .getByRole('button', { name: 'Editing mode: Suggestion', exact: true })
    .click();
  await page
    .getByRole('menuitemradio', { name: 'Editing', exact: true })
    .click();
  await expect(root).toContainText('the update');
  await expect(
    authoredText(root, '[data-editor-authored-kind~="delete"]')
  ).toContainText('extra');
  await page.getByRole('button', { name: 'Save snapshot' }).click();
  await expect(
    page.getByRole('button', { name: 'Editing mode: Editing', exact: true })
  ).toBeVisible();
  await expect(root).toContainText('the update');
  await page.getByRole('button', { name: 'Reload snapshot' }).click();
  await expect(
    page.getByRole('button', { name: 'Editing mode: Suggestion', exact: true })
  ).toBeVisible();
  await expect(root).toContainText('the update');
  await expect(
    authoredText(root, '[data-editor-authored-kind~="delete"]')
  ).toContainText('extra');
  runtimeErrors.assertNone();
});

test('loads the homepage playground with its original suggestion set', async ({
  page,
}) => {
  const runtimeErrors = recordBrowserRuntimeErrors(page, { strict: true });

  await page.goto('/', { waitUntil: 'commit' });

  const editor = page.locator('[data-editor="true"]').first();

  await expect(
    editor.getByRole('heading', {
      name: 'Welcome to the Plate Playground!',
      exact: true,
    })
  ).toBeVisible({ timeout: 20_000 });
  await expect(
    authoredText(editor, '[data-editor-authored-author="alice"]').filter({
      hasText: 'suggestions',
    })
  ).toBeVisible();
  await enterSuggestionMode(page);
  await expect(
    authoredText(editor, '[data-editor-authored-author="alice"]').filter({
      hasText: 'suggestions',
    })
  ).toBeVisible();
  await expect(
    authoredText(editor, '[data-editor-authored-author="alice"]').filter({
      hasText: 'like this added text',
    })
  ).toBeVisible();
  await expect(
    authoredText(editor, '[data-editor-authored-kind~="delete"]')
  ).toContainText('mark text for removal');
  const aliceInsertion = authoredText(
    editor,
    '[data-editor-authored-author="alice"]'
  ).filter({ hasText: 'suggestions' });
  const bobDeletion = authoredText(
    editor,
    '[data-editor-authored-author="bob"][data-editor-authored-kind~="delete"]'
  ).filter({ hasText: 'mark text for removal' });
  const charlieInsertion = authoredText(
    editor,
    '[data-editor-authored-author="charlie"]'
  ).filter({ hasText: 'overlapping' });

  await expect(aliceInsertion).toHaveCSS('text-decoration-line', 'underline');
  await expect(bobDeletion).toHaveCSS('text-decoration-line', 'line-through');
  await expect(charlieInsertion).toHaveCSS('text-decoration-line', 'underline');
  // Each change paints its own color.
  const changeBackgrounds = await Promise.all(
    [aliceInsertion, bobDeletion, charlieInsertion].map((suggestion) =>
      suggestion.evaluate(
        (element) => getComputedStyle(element).backgroundColor
      )
    )
  );

  expect(new Set(changeBackgrounds).size).toBe(3);
  await expect(
    authoredText(editor, '[data-editor-authored-kind~="insert"]').filter({
      hasText: 'overlapping',
    })
  ).toContainText('overlapping');
  await expect(
    editor.locator('[data-discussion-block-trigger]')
  ).toHaveAccessibleName('Open 5 discussion items for this block');
  runtimeErrors.assertNone();
});

test('paints the first typed homepage suggestion with the inserted character', async ({
  page,
}) => {
  const runtimeErrors = recordBrowserRuntimeErrors(page, { strict: true });

  await page.goto('/blocks/playground-demo', { waitUntil: 'commit' });
  const root = page.locator('[data-editor="true"]').first();
  const editor = createBrowserEditorHarness(page, 'homepage suggestions', root);

  await editor.ready({
    editor: 'visible',
    text: 'Welcome to the Plate Playground!',
  });
  await enterSuggestionMode(page);
  runtimeErrors.reset();

  const blockIndex = 1;
  const blockTexts = await editor.get.modelBlockTexts();
  const before = blockTexts[blockIndex];
  const insertionText = 'capabilities';
  const textNode =
    ". This playground showcases just a part of Plate's capabilities. ";
  const at = textNode.indexOf(insertionText);

  const capturePaint = (paintIndex: number) =>
    page.evaluate(
      async ([{ captureIndex, currentBlockIndex }, key]) => {
        await new Promise<void>((resolve) => {
          requestAnimationFrame(() => {
            resolve();
          });
        });
        const editorRoot = document.querySelector('[data-editor="true"]') as
          | (HTMLElement &
              Record<
                string,
                | {
                    getBlockText: (index: number) => string | null;
                  }
                | undefined
              >)
          | null;
        const element = editorRoot
          ?.querySelectorAll<HTMLElement>('[data-editor-node="element"]')
          .item(currentBlockIndex);
        if (!element) throw new Error('Missing playground paragraph.');
        const spans = [
          ...element.querySelectorAll(
            '[data-editor-node="text"][data-editor-authored-kind~="insert"]'
          ),
        ].map((node, index) => {
          const range = document.createRange();

          range.setStart(element, 0);
          range.setEndBefore(node);
          const start = range.toString().length;
          const text = node.textContent ?? '';

          return { end: start + text.length, index, start, text };
        });

        return {
          input: captureIndex,
          model: editorRoot?.[key]?.getBlockText(currentBlockIndex) ?? null,
          spans,
          text: element.textContent ?? '',
        } satisfies SuggestionPaintSnapshot;
      },
      [
        { captureIndex: paintIndex, currentBlockIndex: blockIndex },
        BROWSER_HANDLE_KEY,
      ] as const
    );

  await editor.selection.collapse({ path: [blockIndex, 2], offset: at });
  await editor.focus();
  await page.keyboard.type('w');
  const firstPaint = await capturePaint(0);
  await page.keyboard.type('w');
  const secondPaint = await capturePaint(1);
  const first = before.replace(insertionText, `w${insertionText}`);
  const second = before.replace(insertionText, `ww${insertionText}`);

  expect(firstPaint).toMatchObject({
    input: 0,
    model: first,
    spans: [{ index: 0, text: 'w' }],
  });
  expect(firstPaint.text).toContain("Plate's wcapabilities.");
  // The second letter extends the same insertion, painted as one run.
  expect(secondPaint).toMatchObject({
    input: 1,
    model: second,
    spans: [
      {
        end: firstPaint.spans[0].start + 2,
        index: 0,
        start: firstPaint.spans[0].start,
        text: 'ww',
      },
    ],
  });
  expect(secondPaint.text).toContain("Plate's wwcapabilities.");
  runtimeErrors.assertNone();
});

test('keeps pending suggestions visible through both homepage mode controls', async ({
  page,
}) => {
  const runtimeErrors = recordBrowserRuntimeErrors(page, { strict: true });
  await page.goto('/', { waitUntil: 'commit' });
  const root = page.locator('[data-editor="true"]').first();
  const editor = createBrowserEditorHarness(
    page,
    'homepage suggestion modes',
    root
  );
  await editor.ready({
    editor: 'visible',
    text: PLAYGROUND_TITLE,
  });

  await expect(
    page.getByRole('button', { name: 'Editing mode: Editing', exact: true })
  ).toBeVisible();
  const heading = root.getByRole('heading', { level: 1 });
  const authoredCount = await root
    .locator('[data-editor-authored-change]')
    .count();

  await editor.selection.collapse({
    path: [0, 0],
    offset: PLAYGROUND_TITLE.length,
  });
  await page.keyboard.type('!');
  await expect(heading).toHaveText(`${PLAYGROUND_TITLE}!`);
  expect(await root.locator('[data-editor-authored-change]').count()).toBe(
    authoredCount
  );
  await page.keyboard.press('ControlOrMeta+z');
  await expect(heading).toHaveText(PLAYGROUND_TITLE);

  await page
    .getByRole('button', { name: 'Editing mode: Editing', exact: true })
    .click();
  await page
    .getByRole('menuitemradio', { name: 'Suggestion', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: 'Editing mode: Suggestion', exact: true })
  ).toBeVisible();

  await editor.selection.select({
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [0, 0], offset: 7 },
  });
  await page.keyboard.type('Hello');
  const replacementInsert = root
    .getByRole('heading', { level: 1 })
    .filter({ hasText: 'Hello' });
  const replacementDelete = root
    .getByRole('heading', { level: 1 })
    .locator('span')
    .filter({ hasText: 'Welcom' })
    .last();
  const seededInsert = authoredText(
    root,
    '[data-editor-authored-author="alice"]'
  ).filter({ hasText: 'suggestions' });
  const seededDelete = authoredText(
    root,
    '[data-editor-authored-kind~="delete"]'
  ).filter({ hasText: 'mark text for removal' });
  await expect(replacementInsert).toBeVisible();
  await expect(replacementDelete).toBeVisible();
  const replacementDeleteIsMarked = () =>
    replacementDelete.evaluate((element) => {
      let current: Element | null = element;
      while (current && current.tagName !== 'H1') {
        if (getComputedStyle(current).textDecorationLine === 'line-through') {
          return true;
        }
        current = current.parentElement;
      }
      return false;
    });
  expect(await replacementDeleteIsMarked()).toBe(true);

  const valueBefore = await editor.get.modelValue();
  const historyBefore = await editor.get.history();
  await page
    .getByRole('button', { name: 'Editing mode: Suggestion', exact: true })
    .click();
  await page
    .getByRole('menuitemradio', { name: 'Editing', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: 'Editing mode: Editing', exact: true })
  ).toBeVisible();
  for (const suggestion of [
    replacementInsert,
    replacementDelete,
    seededInsert,
    seededDelete,
  ]) {
    await expect(suggestion).toBeVisible();
  }
  expect(await replacementDeleteIsMarked()).toBe(true);
  expect(await editor.get.modelValue()).toEqual(valueBefore);
  expect(await editor.get.history()).toEqual(historyBefore);

  const selectForFloatingToggle = async () => {
    await editor.selection.collapse({ path: [1, 0], offset: 4 });
    await editor.focus();
    for (let index = 0; index < 4; index++) {
      await page.keyboard.press('Shift+ArrowLeft');
    }
  };
  await selectForFloatingToggle();
  const floatingToggle = page
    .locator('[role="toolbar"]')
    .last()
    .locator('button:has(svg.lucide-pencil-line)');
  await expect(floatingToggle).toBeVisible();
  await floatingToggle.click();
  await expect(
    page.getByRole('button', { name: 'Editing mode: Suggestion', exact: true })
  ).toBeVisible();
  await expect(replacementInsert).toBeVisible();
  await expect(replacementDelete).toBeVisible();

  await selectForFloatingToggle();
  await expect(floatingToggle).toBeVisible();
  await floatingToggle.click();
  await expect(
    page.getByRole('button', { name: 'Editing mode: Editing', exact: true })
  ).toBeVisible();
  expect(await editor.get.modelValue()).toEqual(valueBefore);
  expect(await editor.get.history()).toEqual(historyBefore);
  const discussion = root.getByRole('button', {
    name: 'Open 5 discussion items for this block',
    exact: true,
  });
  await expect(discussion).toBeVisible();
  await discussion.click();
  const review = page
    .locator('[data-suggestion-review]')
    .filter({ hasText: 'suggestions like this added text' });
  await expect(review).toHaveCount(1);
  await review.hover();
  await review.getByRole('button', { name: 'Accept suggestion' }).click();
  await expect(review).toHaveCount(0);
  await root.focus();
  await page.keyboard.press('ControlOrMeta+z');
  await discussion.click();
  await expect(review).toHaveCount(1);
  await expect(seededInsert).toBeVisible();
  runtimeErrors.assertNone();
});

test('undoes accepting the contiguous homepage insertion', async ({ page }) => {
  const runtimeErrors = recordBrowserRuntimeErrors(page, { strict: true });

  await page.goto('/', { waitUntil: 'commit' });
  const root = page.locator('[data-editor="true"]').first();
  const editor = createBrowserEditorHarness(page, 'homepage suggestions', root);
  const aliceSuggestion = authoredText(
    root,
    '[data-editor-authored-author="alice"]'
  );

  await expect(
    root.getByRole('heading', {
      name: 'Welcome to the Plate Playground!',
      exact: true,
    })
  ).toBeVisible({ timeout: 20_000 });
  await enterSuggestionMode(page);
  const history = (await editor.get.history()) as { undos: unknown[] };

  expect(history.undos).toHaveLength(0);
  await root
    .getByRole('button', {
      name: 'Open 5 discussion items for this block',
      exact: true,
    })
    .click();
  const card = page
    .locator('[data-suggestion-review]')
    .filter({ hasText: 'suggestions like this added text' });

  await expect(card).toHaveCount(1);
  await card.hover();
  await card.getByRole('button', { name: 'Accept suggestion' }).click();
  await expect(card).toHaveCount(0);
  await editor.undo();
  await root
    .getByRole('button', {
      name: 'Open 5 discussion items for this block',
      exact: true,
    })
    .click();

  await expect(card).toHaveCount(1);
  await expect(
    aliceSuggestion.filter({ hasText: 'suggestions' })
  ).toBeVisible();
  await expect(
    aliceSuggestion.filter({ hasText: 'like this added text' })
  ).toBeVisible();
  runtimeErrors.assertNone();
});

test('stops undo before seeded homepage suggestions', async ({ page }) => {
  const runtimeErrors = recordBrowserRuntimeErrors(page, { strict: true });

  await page.goto('/', { waitUntil: 'commit' });
  const root = page.locator('[data-editor="true"]').first();
  const editor = createBrowserEditorHarness(page, 'homepage suggestions', root);

  await expect(
    root.getByRole('heading', {
      name: 'Welcome to the Plate Playground!',
      exact: true,
    })
  ).toBeVisible({ timeout: 20_000 });
  await enterSuggestionMode(page);
  await root
    .getByRole('button', {
      name: 'Open 5 discussion items for this block',
      exact: true,
    })
    .click();

  const card = page
    .locator('[data-suggestion-review]')
    .filter({ hasText: 'Delete “mark text for removal”' });
  const struck = authoredText(root, '[data-editor-authored-kind~="delete"]');

  await decideSuggestion(page, card, 'Accept');
  await expect(struck).toHaveCount(0);
  await editor.undo();
  await expect(struck).toHaveText('mark text for removal');
  await editor.undo();
  await expect(struck).toHaveText('mark text for removal');
  runtimeErrors.assertNone();
});

const openSuggestions = async (page: Page) => {
  const runtimeErrors = recordBrowserRuntimeErrors(page, { strict: true });

  await page.goto(ROUTE, { waitUntil: 'commit' });

  const root = page.getByRole('textbox', { name: 'Suggestions document' });
  const editor = createBrowserEditorHarness(page, 'suggestions', root);

  await editor.ready({ editor: 'visible', text: THIRD_PARAGRAPH });

  return { editor, root, runtimeErrors };
};

for (const action of ['Accept', 'Reject'] as const) {
  test(`deletes the playground image and resolves it with ${action}`, async ({
    page,
  }, testInfo) => {
    expect(testInfo.retry).toBe(0);
    const runtimeErrors = recordBrowserRuntimeErrors(page, { strict: true });

    await page.goto('/', { waitUntil: 'commit' });
    const root = page.locator('[data-editor="true"]').first();
    const image = root.locator('.editor-image img');

    await expect(image).toBeVisible({ timeout: 20_000 });
    await enterSuggestionMode(page);
    await expect
      .poll(() =>
        image.evaluate((element) => (element as HTMLImageElement).naturalWidth)
      )
      .toBeGreaterThan(0);
    const source = await image.getAttribute('src');
    const deleteImage = async () => {
      await image.click();
      await expect(root).toBeFocused();
      await expect(
        root.locator('.editor-image[data-editor-authored-kind="delete"]')
      ).toHaveCount(0);
      await page.keyboard.press(action === 'Accept' ? 'Backspace' : 'Delete');
    };

    await deleteImage();
    runtimeErrors.assertNone();
    const retained = root.locator(
      '.editor-image[data-editor-authored-kind="delete"]'
    );

    await expect(root.locator('.editor-file')).toHaveCount(1);
    await expect(
      root.locator('.editor-file[data-editor-authored-kind="delete"]')
    ).toHaveCount(0);
    await expect(retained.locator('img')).toHaveAttribute('src', source!);
    await expect(retained.locator('img')).toBeVisible();
    await expect(retained).toContainText(
      'Images with captions provide context.'
    );
    runtimeErrors.assertNone();
    await page.keyboard.press('ControlOrMeta+z');
    await expect(retained).toHaveCount(0);
    await expect(image).toHaveAttribute('src', source!);
    await page.keyboard.press('ControlOrMeta+Shift+z');
    await expect(retained.locator('img')).toHaveAttribute('src', source!);

    await retained.locator('img').click();
    const card = page.locator('[data-suggestion-review]');
    await expect(card).toHaveCount(1);
    await expect(card).toContainText('Delete');
    await decideSuggestion(page, card, action);
    await expect(retained).toHaveCount(0);
    await expect(image).toHaveCount(action === 'Accept' ? 0 : 1);
    if (action === 'Reject') {
      await expect(image).toHaveAttribute('src', source!);
      await expect(root).toContainText('Images with captions provide context.');
    }

    const paragraph = root.locator('.editor-paragraph').filter({
      hasText: 'Embed rich media like images directly in your content.',
    });
    // The reselected image's toolbar flips above it when the viewport has no
    // room below, covering this paragraph's middle, so click its first word.
    await paragraph.click({ position: { x: 12, y: 12 } });
    await page.keyboard.press('End');
    await page.keyboard.type(' Still editing.');
    await expect(paragraph).toContainText('Still editing.');
    runtimeErrors.assertNone();
  });
}

const getBlockDiscussionTrigger = (block: Locator) =>
  block
    .locator('xpath=ancestor::div[div[@contenteditable="false"]][1]')
    .locator('[data-discussion-block-trigger]');

test('uses the editor content root as the suggestion surface', async ({
  page,
}) => {
  const { root, runtimeErrors } = await openSuggestions(page);

  await expect(root).toHaveClass(/data-editor-authored-change/);
  expect(
    await root.evaluate((element) =>
      element.parentElement?.classList.contains('contents')
    )
  ).toBe(false);
  const struck = authoredText(
    root,
    '[data-editor-authored-kind~="delete"]'
  ).first();
  const inserted = authoredText(
    root,
    '[data-editor-authored-kind~="insert"]'
  ).first();

  await expect(struck).toHaveCSS('text-decoration-line', 'line-through');
  await expect(inserted).toHaveCSS('text-decoration-line', 'underline');
  const deletionBackground = await struck.evaluate(
    (element) => getComputedStyle(element).backgroundColor
  );
  const insertionBackground = await inserted.evaluate(
    (element) => getComputedStyle(element).backgroundColor
  );

  // One author, two changes: each change paints its own color.
  expect(deletionBackground).not.toBe('rgba(0, 0, 0, 0)');
  expect(insertionBackground).not.toBe('rgba(0, 0, 0, 0)');
  expect(deletionBackground).not.toBe(insertionBackground);

  await struck.hover();
  await expect
    .poll(() =>
      struck.evaluate((element) => getComputedStyle(element).backgroundColor)
    )
    .not.toBe(deletionBackground);
  await page.mouse.move(0, 0);
  await expect(struck).toHaveCSS('background-color', deletionBackground);
  runtimeErrors.assertNone();
});

for (const action of ['Accept', 'Reject'] as const) {
  test(`types inside a deleted word and resolves it with ${action}`, async ({
    page,
  }) => {
    const { editor, root, runtimeErrors } = await openSuggestions(page);
    const struck = authoredText(root, '[data-editor-authored-kind~="delete"]');
    const struckTree = (typed: string) => [
      'Review |collaboratively [insert:alice]|and refine this sentence.',
      `Keep this |redundant phrase [delete:alice]|${typed}[insert:alice]|out of the final draft.`,
      THIRD_PARAGRAPH,
    ];

    await expect(struck).toHaveText('redundant phrase ');
    const target = await struck.evaluate((element) => {
      const text = document
        .createTreeWalker(element, NodeFilter.SHOW_TEXT)
        .nextNode();
      if (!text) throw new Error('Missing struck text');
      const range = document.createRange();
      range.setStart(text, 6);
      range.collapse(true);
      const rect = range.getBoundingClientRect();
      return { x: rect.left, y: rect.top + rect.height / 2 };
    });

    // A click inside struck letters puts the caret there, and typing lands
    // after them, so accepting the deletion keeps what was typed.
    await page.mouse.click(target.x, target.y);
    await page.keyboard.type('XY');
    await expect.poll(() => reviewTree(editor)).toEqual(struckTree('XY'));
    await editor.assert.collapsedModelDOMSelection({
      path: [1, 2],
      offset: 2,
      text: 'XY',
    });
    await page.keyboard.press('Backspace');
    await expect.poll(() => reviewTree(editor)).toEqual(struckTree('X'));
    await page.keyboard.press('ControlOrMeta+z');
    await expect.poll(() => reviewTree(editor)).toEqual(struckTree('XY'));
    await page.keyboard.press('ControlOrMeta+Shift+z');
    await page.keyboard.type('Z');
    await expect.poll(() => reviewTree(editor)).toEqual(struckTree('XZ'));
    const card = page.locator('[data-suggestion-review]');

    await expect(card).toHaveCount(1);
    await expect(card).toContainText('Replace “redundant phrase” with “XZ”');
    await decideSuggestion(page, card, action);
    await expect(struck).toHaveCount(0);
    await editor.assert.modelBlockText(
      1,
      action === 'Reject'
        ? 'Keep this redundant phrase out of the final draft.'
        : 'Keep this XZout of the final draft.'
    );
    await root.focus();
    await page.keyboard.press('ControlOrMeta+z');
    await expect.poll(() => reviewTree(editor)).toEqual(struckTree('XZ'));
    runtimeErrors.assertNone();
  });
}

test('keeps ordinary and inserted-only pointer selections native', async ({
  page,
}) => {
  const { editor, root, runtimeErrors } = await openSuggestions(page);
  const authoredIdentities = await root
    .locator('[data-editor-authored-change]')
    .evaluateAll((elements) =>
      elements.map((element) =>
        element.getAttribute('data-editor-authored-change')
      )
    );
  const points = await root.evaluate((element) => {
    const findText = (value: string) => {
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      let text: Node | null;
      while ((text = walker.nextNode())) {
        if (text.textContent?.includes(value)) return text;
      }
      throw new Error(`Missing text: ${value}`);
    };
    const pointAt = (text: Node, offset: number) => {
      const range = document.createRange();
      range.setStart(text, offset);
      range.collapse(true);
      const rect = range.getBoundingClientRect();
      return { x: rect.left, y: rect.top + rect.height / 2 };
    };
    const insertion = findText('collaboratively ');
    const ordinary = findText('Try typing your own suggestion here.');

    return {
      insertEnd: pointAt(insertion, 8),
      insertStart: pointAt(insertion, 1),
      ordinaryEnd: pointAt(ordinary, 16),
      ordinaryStart: pointAt(ordinary, 4),
    };
  });

  for (const { from, selectedTextLength, to } of [
    {
      from: points.ordinaryStart,
      selectedTextLength: 12,
      to: points.ordinaryEnd,
    },
    {
      from: points.insertStart,
      selectedTextLength: 7,
      to: points.insertEnd,
    },
  ]) {
    await page.mouse.move(from.x, from.y);
    await page.mouse.down();
    try {
      await page.mouse.move(to.x, to.y, { steps: 8 });
      await expect
        .poll(() => editor.get.displayedSelection())
        .toMatchObject({
          doubleHighlighted: false,
          hasVisibleSelection: true,
          native: { textLength: selectedTextLength },
          source: 'native',
        });
    } finally {
      await page.mouse.up();
    }
  }

  expect(
    await root
      .locator('[data-editor-authored-change]')
      .evaluateAll((elements) =>
        elements.map((element) =>
          element.getAttribute('data-editor-authored-change')
        )
      )
  ).toEqual(authoredIdentities);
  runtimeErrors.assertNone();
});

test('expands a pointer selection across deleted text boundaries', async ({
  page,
}) => {
  const { editor, root, runtimeErrors } = await openSuggestions(page);
  const authoredIdentities = await root
    .locator('[data-editor-authored-change]')
    .evaluateAll((elements) =>
      elements.map((element) =>
        element.getAttribute('data-editor-authored-change')
      )
    );
  const points = await root.evaluate((element) => {
    const findText = (value: string) => {
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      let text: Node | null;
      while ((text = walker.nextNode())) {
        if (text.textContent?.includes(value)) return text;
      }
      throw new Error(`Missing text: ${value}`);
    };
    const pointAt = (text: Node, offset: number) => {
      const range = document.createRange();
      range.setStart(text, offset);
      range.collapse(true);
      const rect = range.getBoundingClientRect();
      return { x: rect.left, y: rect.top + rect.height / 2 };
    };
    const deleted = findText('redundant phrase');
    const prefix = findText('Keep this ');
    const suffix = findText('out of the final draft.');
    return {
      deletedEnd: pointAt(deleted, 15),
      deletedStart: pointAt(deleted, 4),
      prefix: pointAt(prefix, 5),
      suffix: pointAt(suffix, 3),
      suffixFar: pointAt(suffix, 12),
      suffixNear: pointAt(suffix, 2),
    };
  });

  // Struck text is ordinary document text now, so a drag across its edges is
  // one native selection, highlighted once, that keeps a model range.
  const dragAndAssert = async ({
    from,
    selectedTextLength,
    to,
  }: {
    from: { x: number; y: number };
    selectedTextLength: number;
    to: { x: number; y: number };
  }) => {
    // A press inside the previous native selection would start a drag and
    // drop of it, so each drag starts from a collapsed caret.
    await editor.selection.collapse({ path: [2, 0], offset: 0 });
    await page.mouse.move(from.x, from.y);
    await page.mouse.down();
    try {
      await page.mouse.move(to.x, to.y, { steps: 8 });
      await expect
        .poll(() => editor.get.displayedSelection())
        .toMatchObject({
          doubleHighlighted: false,
          hasVisibleSelection: true,
          native: { textLength: selectedTextLength },
          source: 'native',
        });
    } finally {
      await page.mouse.up();
    }

    const displayed = await editor.get.displayedSelection();

    expect(displayed.model).not.toBeNull();
    expect(displayed.model?.anchor).not.toEqual(displayed.model?.focus);
  };

  await dragAndAssert({
    from: points.prefix,
    selectedTextLength: 24,
    to: points.suffixNear,
  });
  await dragAndAssert({
    from: points.prefix,
    selectedTextLength: 34,
    to: points.suffixFar,
  });
  const copied = await editor.clipboard.copyNativeEventPayload();
  expect(copied.text).toBe('this redundant phrase out of the f');
  await dragAndAssert({
    from: points.prefix,
    selectedTextLength: 20,
    to: points.deletedEnd,
  });
  await dragAndAssert({
    from: points.suffix,
    selectedTextLength: 16,
    to: points.deletedStart,
  });
  await dragAndAssert({
    from: points.deletedStart,
    selectedTextLength: 16,
    to: points.suffix,
  });
  await dragAndAssert({
    from: points.deletedEnd,
    selectedTextLength: 20,
    to: points.prefix,
  });
  expect(
    await root
      .locator('[data-editor-authored-change]')
      .evaluateAll((elements) =>
        elements.map((element) =>
          element.getAttribute('data-editor-authored-change')
        )
      )
  ).toEqual(authoredIdentities);

  const original = await editor.get.modelBlockTexts();
  await root.getByText(THIRD_PARAGRAPH, { exact: true }).click();
  await page.keyboard.press('End');
  await page.keyboard.type('!');
  await editor.assert.modelBlockTexts([
    original[0],
    original[1],
    `${original[2]}!`,
  ]);
  runtimeErrors.assertNone();
});

const decideSuggestion = async (
  page: Page,
  card: Locator,
  action: 'Accept' | 'Reject'
) => {
  const id = await card.getAttribute('data-suggestion-review');

  expect(id).toBeTruthy();

  const fixedCard = page.locator(`[data-suggestion-review="${id}"]`);
  const relatedAction = fixedCard.getByRole('button', {
    name: `${action} related`,
    exact: true,
  });

  await fixedCard.hover();
  await fixedCard
    .getByRole('button', { name: `${action} suggestion`, exact: true })
    .click();

  await expect
    .poll(
      async () =>
        (await fixedCard.count()) === 0 || (await relatedAction.isVisible())
    )
    .toBe(true);

  if ((await fixedCard.count()) > 0) {
    await relatedAction.click();
  }

  await expect(fixedCard).toHaveCount(0);
};

test('paints each typed suggestion at the first frame', async ({ page }) => {
  const { editor, root, runtimeErrors } = await openSuggestions(page);
  const blocks = root.locator('[data-editor-node="element"]');
  const blockTexts = await editor.get.modelBlockTexts();
  const blockIndex = blockTexts.indexOf(THIRD_PARAGRAPH);

  expect(blockIndex).toBeGreaterThanOrEqual(0);

  const block = blocks.nth(blockIndex);

  await block.evaluate(
    (element, [currentBlockIndex, key]) => {
      const target = element as HTMLElement & {
        __suggestionFirstPaints?: SuggestionPaintSnapshot[];
      };
      const editorRoot = element.closest('[data-editor="true"]') as
        | (HTMLElement &
            Record<
              string,
              | {
                  getBlockText: (index: number) => string | null;
                }
              | undefined
            >)
        | null;
      let input = 0;
      const capture = (inputIndex: number) => {
        const spans = [
          ...element.querySelectorAll(
            '[data-editor-node="text"][data-editor-authored-kind~="insert"]'
          ),
        ].map((node, index) => {
          const before = document.createRange();

          before.setStart(element, 0);
          before.setEndBefore(node);

          const start = before.toString().length;
          const text = node.textContent ?? '';

          return {
            end: start + text.length,
            index,
            start,
            text,
          };
        });

        target.__suggestionFirstPaints?.push({
          input: inputIndex,
          model: editorRoot?.[key]?.getBlockText(currentBlockIndex) ?? null,
          spans,
          text: element.textContent ?? '',
        });
      };

      target.__suggestionFirstPaints = [];
      // The editor handles typed text from beforeinput and cancels it, so no
      // input event follows; the first frame after beforeinput is the one
      // that must already paint the insertion.
      editorRoot?.addEventListener(
        'beforeinput',
        () => {
          const inputIndex = input;
          input += 1;

          requestAnimationFrame(() => {
            capture(inputIndex);
          });
        },
        { capture: true }
      );
    },
    [blockIndex, BROWSER_HANDLE_KEY] as const
  );

  const at = 4;
  await editor.selection.collapse({ path: [blockIndex, 0], offset: at });
  await editor.focus();

  for (const [index, text] of ['X', 'Y', 'Z'].entries()) {
    await page.keyboard.type(text);
    await expect
      .poll(() =>
        block.evaluate(
          (element) =>
            (
              element as HTMLElement & {
                __suggestionFirstPaints?: unknown[];
              }
            ).__suggestionFirstPaints?.length ?? 0
        )
      )
      .toBe(index + 1);
  }

  const paints = await block.evaluate(
    (element) =>
      (
        element as HTMLElement & {
          __suggestionFirstPaints?: Array<{
            decorated: string;
            text: string;
          }>;
        }
      ).__suggestionFirstPaints ?? []
  );

  const characters = ['X', 'Y', 'Z'];
  const expected = characters.flatMap((_, input) => {
    const inserted = characters.slice(0, input + 1).join('');
    const text = `Try ${inserted}typing your own suggestion here.`;
    // Each letter extends the one insertion, painted as one run.
    const spans = [
      { end: 4 + inserted.length, index: 0, start: 4, text: inserted },
    ];

    return [
      {
        input,
        model: text,
        spans,
        text,
      },
    ];
  });

  expect(paints).toEqual(expected);
  runtimeErrors.assertNone();
});

test('removes a canceled own insertion from its open discussion and restores it through undo', async ({
  page,
}) => {
  const { editor, root, runtimeErrors } = await openSuggestions(page);
  const blockTexts = await editor.get.modelBlockTexts();
  const blockIndex = blockTexts.indexOf(THIRD_PARAGRAPH);

  expect(blockIndex).toBeGreaterThanOrEqual(0);

  const block = root.locator('[data-editor-node="element"]').nth(blockIndex);
  const trigger = getBlockDiscussionTrigger(block);
  const popover = page.locator('[data-discussion-popover]');
  const cards = popover.locator('[data-suggestion-review]');
  const path = [blockIndex, 0];
  const at = 4;
  const inserted = 'Try ptyping your own suggestion here.';

  await expect(trigger).toHaveCount(0);
  await editor.selection.collapse({ path, offset: at });
  await editor.focus();
  await page.keyboard.type('p');
  await editor.assert.modelBlockText(blockIndex, inserted);
  await expect(
    authoredText(block, '[data-editor-authored-kind~="insert"]')
  ).toHaveText('p');
  await expect(trigger).toHaveAccessibleName(
    'Open 1 discussion item for this block'
  );
  await trigger.click();
  await expect(cards).toHaveCount(1);
  await expect(cards).toContainText('Add “p”');
  const id = await cards.getAttribute('data-suggestion-review');

  expect(id).toBeTruthy();

  await editor.focus();
  await expect(cards).toBeVisible();
  await page.keyboard.press('Backspace');
  await editor.assert.modelBlockText(blockIndex, THIRD_PARAGRAPH);
  await editor.assert.collapsedModelDOMSelection({
    path,
    offset: at,
    text: THIRD_PARAGRAPH,
  });
  await expect(cards).toHaveCount(0);
  await expect(trigger).toHaveCount(0);
  await expect(
    authoredText(block, '[data-editor-authored-kind~="insert"]')
  ).toHaveCount(0);
  await expect(
    authoredText(block, '[data-editor-authored-kind~="delete"]')
  ).toHaveCount(0);

  await page.keyboard.press('ControlOrMeta+z');
  await editor.assert.modelBlockText(blockIndex, inserted);
  // Review coordinates: the restored insertion is its own text node.
  await editor.assert.selection({
    anchor: { path: [blockIndex, 1], offset: 1 },
    focus: { path: [blockIndex, 1], offset: 1 },
  });
  await expect.poll(() => editor.get.selectedText()).toBe('');
  await expect(
    authoredText(block, `[data-editor-authored-change~="${id}"]`)
  ).toHaveText('p');
  await expect(trigger).toHaveCount(1);

  if (!(await popover.isVisible())) await trigger.click();

  await expect(cards).toHaveCount(1);
  await expect(cards).toHaveAttribute('data-suggestion-review', id!);
  await expect(cards).toContainText('Add “p”');
  await expect(cards).not.toContainText('Delete “p”');
  await editor.focus();
  await page.keyboard.press('ControlOrMeta+Shift+z');
  await editor.assert.modelBlockText(blockIndex, THIRD_PARAGRAPH);
  await editor.assert.collapsedModelDOMSelection({
    path,
    offset: at,
    text: THIRD_PARAGRAPH,
  });
  await expect(cards).toHaveCount(0);
  await expect(trigger).toHaveCount(0);
  await expect(
    authoredText(block, '[data-editor-authored-kind~="insert"]')
  ).toHaveCount(0);
  await expect(
    authoredText(block, '[data-editor-authored-kind~="delete"]')
  ).toHaveCount(0);
  runtimeErrors.assertNone();
});

test('undoes accepting an own insertion without replaying the older edit', async ({
  page,
}) => {
  const { editor, root, runtimeErrors } = await openSuggestions(page);
  const blockTexts = await editor.get.modelBlockTexts();
  const blockIndex = blockTexts.indexOf(THIRD_PARAGRAPH);

  expect(blockIndex).toBeGreaterThanOrEqual(0);

  const block = root.locator('[data-editor-node="element"]').nth(blockIndex);
  const trigger = getBlockDiscussionTrigger(block);
  const path = [blockIndex, 0];

  await editor.selection.collapse({ path, offset: 4 });
  await editor.focus();
  await page.keyboard.type('p');
  await trigger.click();

  const card = page.locator('[data-suggestion-review]');

  await expect(card).toContainText('Add “p”');
  await card.hover();
  await card.getByRole('button', { name: 'Accept suggestion' }).click();
  await expect(card).toHaveCount(0);
  await root.focus();
  await page.keyboard.press('ControlOrMeta+z');

  if (!(await card.isVisible())) await trigger.click();
  await expect(card).toHaveCount(1);
  await expect(card).toContainText('Add “p”');
  await expect(
    authoredText(block, '[data-editor-authored-kind~="insert"]')
  ).toHaveText('p');
  runtimeErrors.assertNone();
});

test('clears an inserted paragraph break when Backspace immediately rejoins it', async ({
  page,
}) => {
  const { editor, root, runtimeErrors } = await openSuggestions(page);
  const blockTexts = await editor.get.modelBlockTexts();
  const blockIndex = blockTexts.indexOf(THIRD_PARAGRAPH);

  expect(blockIndex).toBeGreaterThanOrEqual(0);

  const path = [blockIndex, 0];
  const at = 4;

  await editor.selection.collapse({ path, offset: at });
  await editor.focus();
  await page.keyboard.press('Enter');
  await editor.assert.modelBlockTexts([
    ...blockTexts.slice(0, blockIndex),
    'Try ',
    'typing your own suggestion here.',
    ...blockTexts.slice(blockIndex + 1),
  ]);
  await editor.assert.collapsedModelDOMSelection({
    path: [blockIndex + 1, 0],
    offset: 0,
    text: 'typing your own suggestion here.',
  });

  const rightBlock = root
    .locator('[data-editor-node="element"]')
    .nth(blockIndex + 1);
  const trigger = getBlockDiscussionTrigger(rightBlock);
  const cards = page.locator('[data-suggestion-review]');

  await expect(trigger).toHaveAccessibleName(
    'Open 1 discussion item for this block'
  );
  await trigger.click();
  await expect(cards).toHaveCount(1);
  await expect(cards).toContainText('Add paragraph break');
  await editor.focus();
  await expect(cards).toBeVisible();
  await page.keyboard.press('Backspace');
  await editor.assert.modelBlockTexts(blockTexts);
  await editor.assert.collapsedModelDOMSelection({
    path,
    offset: at,
    text: THIRD_PARAGRAPH,
  });

  const mergedBlock = root
    .locator('[data-editor-node="element"]')
    .nth(blockIndex);

  await expect(cards).toHaveCount(0);
  await expect(getBlockDiscussionTrigger(mergedBlock)).toHaveCount(0);
  await expect(
    authoredText(mergedBlock, '[data-editor-authored-kind~="delete"]')
  ).toHaveCount(0);
  await page.keyboard.type('x');
  await editor.assert.modelBlockText(
    blockIndex,
    'Try xtyping your own suggestion here.'
  );
  // Review coordinates: the typed insertion is its own text node.
  await editor.assert.collapsedModelDOMSelection({
    path: [blockIndex, 1],
    offset: 1,
    text: 'x',
  });
  runtimeErrors.assertNone();
});

test('keeps rapid arrow navigation inside a typed suggestion', async ({
  page,
}) => {
  const { editor, runtimeErrors } = await openSuggestions(page);
  const blockTexts = await editor.get.modelBlockTexts();
  const blockIndex = blockTexts.indexOf(THIRD_PARAGRAPH);

  expect(blockIndex).toBeGreaterThanOrEqual(0);

  await editor.selection.collapse({ path: [blockIndex, 0], offset: 4 });
  await editor.focus();
  await page.keyboard.type('XYZ');

  // Review coordinates: "XYZ" is one inserted text node after "Try ".
  const path = [blockIndex, 1];

  for (const offset of [2, 1, 0]) {
    await page.keyboard.press('ArrowLeft');
    await expect
      .poll(() => editor.get.selection())
      .toEqual({
        anchor: { path, offset },
        focus: { path, offset },
      });
    await editor.assert.collapsedModelDOMSelection({
      path,
      offset,
      text: 'XYZ',
    });
  }

  for (const offset of [1, 2, 3]) {
    await page.keyboard.press('ArrowRight');
    await expect
      .poll(() => editor.get.selection())
      .toEqual({
        anchor: { path, offset },
        focus: { path, offset },
      });
    await editor.assert.collapsedModelDOMSelection({
      path,
      offset,
      text: 'XYZ',
    });
  }

  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.type('!');
  await editor.assert.modelBlockText(
    blockIndex,
    'Try X!YZtyping your own suggestion here.'
  );
  await editor.assert.collapsedModelDOMSelection({
    path,
    offset: 2,
    text: 'X!YZ',
  });
  runtimeErrors.assertNone();
});

test('accepts a paragraph break inside a typed suggestion and keeps typing', async ({
  page,
}) => {
  const { editor, root, runtimeErrors } = await openSuggestions(page);
  const blockTexts = await editor.get.modelBlockTexts();
  const blockIndex = blockTexts.indexOf(THIRD_PARAGRAPH);

  expect(blockIndex).toBeGreaterThanOrEqual(0);

  const path = [blockIndex, 0];
  const at = 4;

  await editor.selection.collapse({ path, offset: at });
  await editor.focus();
  await page.keyboard.type('XYZ');
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('ArrowLeft');
  await page.evaluate(() => new Promise(requestAnimationFrame));
  await page.keyboard.press('Enter');

  // The new line starts with the rest of the insertion, one text node.
  await editor.assert.collapsedModelDOMSelection({
    path: [blockIndex + 1, 0],
    offset: 0,
    text: 'YZ',
  });

  const expected = [
    ...blockTexts.slice(0, blockIndex),
    'Try X',
    'YZtyping your own suggestion here.',
    ...blockTexts.slice(blockIndex + 1),
  ];

  await editor.assert.modelBlockTexts(expected);

  const rightBlock = root
    .locator('[data-editor-node="element"]')
    .nth(blockIndex + 1);
  const trigger = getBlockDiscussionTrigger(rightBlock);

  await expect(trigger).toHaveAccessibleName(/Open \d+ discussion items?/);
  await trigger.click();

  const popover = page.locator('[data-discussion-popover]');
  const cards = popover.locator('[data-suggestion-review]');

  // The block shows the typed insertion's card and the break's own card.
  const breakCard = cards.filter({ hasText: 'Add paragraph break' });

  await expect(popover).toBeVisible();
  await expect(breakCard).toHaveCount(1);
  await decideSuggestion(page, breakCard, 'Accept');
  await editor.assert.modelBlockTexts(expected);
  await editor.selection.collapse({ path: [blockIndex + 1, 0], offset: 0 });
  await editor.focus();
  await page.keyboard.type('!');

  await editor.assert.modelBlockText(
    blockIndex + 1,
    '!YZtyping your own suggestion here.'
  );
  await expect(
    authoredText(root, '[data-editor-authored-kind~="insert"]').filter({
      hasText: '!',
    })
  ).toBeVisible();
  runtimeErrors.assertNone();
});

test('rejects a backward paragraph merge and keeps typing', async ({
  page,
}) => {
  const { editor, root, runtimeErrors } = await openSuggestions(page);

  const popover = page.locator('[data-discussion-popover]');

  await authoredText(root, '[data-editor-authored-kind~="insert"]')
    .filter({ hasText: 'collaboratively' })
    .click();
  await expect(popover).toBeVisible();
  await expect(popover.locator('[data-suggestion-review]')).toHaveCount(1);
  await decideSuggestion(
    page,
    popover.locator('[data-suggestion-review]').first(),
    'Accept'
  );

  await authoredText(root, '[data-editor-authored-kind~="delete"]').click();
  await expect(popover).toBeVisible();
  await expect(popover.locator('[data-suggestion-review]')).toHaveCount(1);
  await decideSuggestion(
    page,
    popover.locator('[data-suggestion-review]').first(),
    'Accept'
  );

  const blockTexts = await editor.get.modelBlockTexts();

  await editor.selection.collapse({ path: [1, 0], offset: 0 });
  await editor.focus();
  await page.keyboard.press('Backspace');

  // The review tree keeps both lines and marks the second as joined; the
  // caret moves to the end of the first, where a plain editor puts it.
  await expect
    .poll(() => reviewTree(editor))
    .toEqual([
      blockTexts[0],
      `[join] ${blockTexts[1]}`,
      ...blockTexts.slice(2),
    ]);
  await editor.assert.collapsedModelDOMSelection({
    path: [0, 0],
    offset: blockTexts[0].length,
    text: blockTexts[0],
  });

  const joinedBlock = root.locator('[data-editor-node="element"]').nth(1);
  const trigger = getBlockDiscussionTrigger(joinedBlock);

  await expect(trigger).toHaveAccessibleName(
    'Open 1 discussion item for this block'
  );
  await trigger.click();
  await expect(popover).toBeVisible();
  await expect(popover.locator('[data-suggestion-review]')).toHaveCount(1);
  await expect(popover.locator('[data-suggestion-review]')).toContainText(
    'Delete paragraph break'
  );
  await decideSuggestion(
    page,
    popover.locator('[data-suggestion-review]').first(),
    'Reject'
  );

  await expect.poll(() => reviewTree(editor)).toEqual(blockTexts);
  await editor.selection.collapse({ path: [1, 0], offset: 0 });
  await editor.focus();
  await page.keyboard.type('!');
  await editor.assert.modelBlockText(1, `!${blockTexts[1]}`);
  await expect(
    authoredText(root, '[data-editor-authored-kind~="insert"]').filter({
      hasText: '!',
    })
  ).toBeVisible();
  runtimeErrors.assertNone();
});
