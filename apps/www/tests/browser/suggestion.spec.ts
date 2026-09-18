import {
  createBrowserEditorHarness,
  recordBrowserRuntimeErrors,
} from '@platejs/test/playwright';
import { expect, type Locator, type Page, test } from '@playwright/test';

const ROUTE = '/blocks/suggestion-demo';
const THIRD_PARAGRAPH = 'Try typing your own suggestion here.';

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

test('loads the saved editor-ai suggestions with linked replies and empty initial history', async ({
  page,
}) => {
  const runtimeErrors = recordBrowserRuntimeErrors(page, { strict: true });
  await page.goto('/blocks/editor-ai', { waitUntil: 'commit' });
  const root = page.locator('[data-editor="true"]').first();
  const harness = createBrowserEditorHarness(page, 'saved editor-ai', root);
  await harness.ready({ editor: 'visible', text: 'Collaborative Editing' });

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
    root
      .locator('[data-editor-authored-author="alice"]')
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
  await root.focus();
  await page.keyboard.press('ControlOrMeta+z');
  await expect(alice).toHaveCount(1);
  await expect(root.locator('a[href="/docs/suggestion"]')).toHaveText(
    'suggestions'
  );
  await page.reload({ waitUntil: 'commit' });
  await harness.ready({ editor: 'visible', text: 'Collaborative Editing' });
  expect(
    ((await harness.get.history()) as { undos: unknown[] }).undos
  ).toHaveLength(0);
  await expect(
    root.locator(
      '[data-editor-authored-author="bob"][data-editor-retained="delete"]'
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
  const charlie = root.locator(
    '[data-editor-authored-author="charlie"][data-editor-authored-kind="insert"]'
  );
  const alice = root.locator('[data-editor-authored-author="alice"]');
  const paragraph = root.locator('.editor-paragraph').filter({
    hasText: 'Review and refine content seamlessly.',
  });
  const blockTexts = await editor.get.modelBlockTexts();
  const paragraphText = blockTexts[3];

  await expect(charlie).toHaveCount(1);
  await expect(charlie).toHaveText('overlapping ');
  expect(paragraphText).toContain('overlapping');
  const aliceCount = await alice.count();
  const text =
    ' on many text segments. You can even have overlapping annotations!';
  const offset = text.indexOf('overlapping') + 4;
  await editor.selection.collapse({ path: [3, 4], offset });
  await page.keyboard.type('xyz');
  await editor.assert.modelBlockText(
    3,
    paragraphText.replace('overlapping', 'overxyzlapping')
  );
  await editor.assert.collapsedModelDOMSelection({
    path: [3, 4],
    offset: offset + 3,
    text: 'z',
  });
  await expect(charlie).toHaveCount(2);
  await page.keyboard.press('Backspace');
  await editor.assert.modelBlockText(
    3,
    paragraphText.replace('overlapping', 'overxylapping')
  );
  await editor.assert.collapsedModelDOMSelection({
    path: [3, 4],
    offset: offset + 2,
    text: 'y',
  });
  await page.keyboard.press('Backspace');
  await editor.assert.modelBlockText(
    3,
    paragraphText.replace('overlapping', 'overxlapping')
  );
  await editor.assert.collapsedModelDOMSelection({
    path: [3, 4],
    offset: offset + 1,
    text: 'x',
  });
  await page.keyboard.press('Backspace');
  await editor.assert.modelBlockText(3, paragraphText);
  await editor.assert.collapsedModelDOMSelection({
    path: [3, 4],
    offset,
    text: 'overlapping ',
  });

  await expect(charlie).toHaveCount(1);
  await expect(charlie).toHaveText('overlapping ');
  await expect(paragraph).toContainText('overlapping annotations!');
  await expect(alice).toHaveCount(aliceCount);
  runtimeErrors.assertNone();
});

test('preserves the selected mode when saving and initializes it when reloading a snapshot', async ({
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
  await page.getByRole('button', { name: 'Suggestion', exact: true }).click();
  await page
    .getByRole('menuitemradio', { name: 'Editing', exact: true })
    .click();
  await expect(root).toContainText('the update');
  await expect(root.locator('[data-editor-retained="delete"]')).toContainText(
    'extra'
  );
  await page.getByRole('button', { name: 'Save snapshot' }).click();
  await expect(
    page.getByRole('button', { name: 'Editing', exact: true })
  ).toBeVisible();
  await expect(root).toContainText('the update');
  await page.getByRole('button', { name: 'Reload snapshot' }).click();
  await expect(
    page.getByRole('button', { name: 'Suggestion', exact: true })
  ).toBeVisible();
  await expect(root).toContainText('the update');
  await expect(root.locator('[data-editor-retained="delete"]')).toContainText(
    'extra'
  );
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
    editor
      .locator('[data-editor-authored-kind="insert"]')
      .filter({ hasText: 'suggestions' })
  ).toBeVisible();
  await expect(
    editor
      .locator('[data-editor-authored-kind="insert"]')
      .filter({ hasText: 'like this added text' })
  ).toBeVisible();
  await expect(editor.locator('[data-editor-retained="delete"]')).toContainText(
    'mark text for removal'
  );
  const aliceInsertion = editor
    .locator('[data-editor-authored-author="alice"]')
    .filter({ hasText: 'suggestions' });
  const bobDeletion = editor
    .locator(
      '[data-editor-authored-author="bob"][data-editor-retained="delete"]'
    )
    .filter({ hasText: 'mark text for removal' });
  const charlieInsertion = editor
    .locator('[data-editor-authored-author="charlie"]')
    .filter({ hasText: 'overlapping' });

  await expect(aliceInsertion).toHaveCSS('text-decoration-line', 'underline');
  await expect(bobDeletion).toHaveCSS('text-decoration-line', 'line-through');
  await expect(charlieInsertion).toHaveCSS('text-decoration-line', 'underline');
  const authorBackgrounds = await Promise.all(
    [aliceInsertion, bobDeletion, charlieInsertion].map((suggestion) =>
      suggestion.evaluate(
        (element) => getComputedStyle(element).backgroundColor
      )
    )
  );

  expect(new Set(authorBackgrounds).size).toBe(3);
  await expect(
    editor
      .locator('[data-editor-authored-kind="insert"]')
      .filter({ hasText: 'overlapping' })
  ).toContainText('overlapping');
  await expect(
    editor.locator('[data-discussion-block-trigger]')
  ).toHaveAccessibleName('Open 5 discussion items for this block');
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
    text: 'Welcome to the Plate Playground!',
  });

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
  const seededInsert = root
    .locator('[data-editor-authored-kind="insert"]')
    .filter({ hasText: 'suggestions' });
  const seededDelete = root
    .locator('[data-editor-retained="delete"]')
    .filter({ hasText: 'mark text for removal' });
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
  await page.getByRole('button', { name: 'Suggestion', exact: true }).click();
  await page
    .getByRole('menuitemradio', { name: 'Editing', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: 'Editing', exact: true })
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

  await editor.selection.select({
    anchor: { path: [1, 0], offset: 0 },
    focus: { path: [1, 0], offset: 4 },
  });
  const floatingToggle = page
    .locator('[role="toolbar"]')
    .last()
    .locator('button:has(svg.lucide-pencil-line)');
  await expect(floatingToggle).toBeVisible();
  await floatingToggle.click();
  await expect(
    page.getByRole('button', { name: 'Suggestion', exact: true })
  ).toBeVisible();
  await expect(replacementInsert).toBeVisible();
  await expect(replacementDelete).toBeVisible();

  await editor.selection.select({
    anchor: { path: [1, 0], offset: 0 },
    focus: { path: [1, 0], offset: 4 },
  });
  await expect(floatingToggle).toBeVisible();
  await floatingToggle.click();
  await expect(
    page.getByRole('button', { name: 'Editing', exact: true })
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
  await expect(review).toHaveCount(1);
  await expect(seededInsert).toBeVisible();
  runtimeErrors.assertNone();
});

test('undoes accepting the contiguous homepage insertion', async ({ page }) => {
  const runtimeErrors = recordBrowserRuntimeErrors(page, { strict: true });

  await page.goto('/', { waitUntil: 'commit' });
  const root = page.locator('[data-editor="true"]').first();
  const inserted = root.locator('[data-editor-authored-kind="insert"]');

  await expect(
    root.getByRole('heading', {
      name: 'Welcome to the Plate Playground!',
      exact: true,
    })
  ).toBeVisible({ timeout: 20_000 });
  const history = (await createBrowserEditorHarness(
    page,
    'homepage suggestions',
    root
  ).get.history()) as { undos: unknown[] };

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
  await root.focus();
  await page.keyboard.press('ControlOrMeta+z');

  await expect(card).toHaveCount(1);
  await expect(inserted.filter({ hasText: 'suggestions' })).toBeVisible();
  await expect(
    inserted.filter({ hasText: 'like this added text' })
  ).toBeVisible();
  runtimeErrors.assertNone();
});

test('stops undo before seeded homepage suggestions', async ({ page }) => {
  const runtimeErrors = recordBrowserRuntimeErrors(page, { strict: true });

  await page.goto('/', { waitUntil: 'commit' });
  const root = page.locator('[data-editor="true"]').first();

  await expect(
    root.getByRole('heading', {
      name: 'Welcome to the Plate Playground!',
      exact: true,
    })
  ).toBeVisible({ timeout: 20_000 });
  await root
    .getByRole('button', {
      name: 'Open 5 discussion items for this block',
      exact: true,
    })
    .click();

  const card = page
    .locator('[data-suggestion-review]')
    .filter({ hasText: 'Delete “mark text for removal”' });
  const retained = root.locator('[data-editor-retained="delete"]');

  await card.hover();
  await card.getByRole('button', { name: 'Accept suggestion' }).click();
  await expect(retained).toHaveCount(0);
  await root.focus();
  await page.keyboard.press('ControlOrMeta+z');
  await expect(retained).toContainText('mark text for removal');
  await page.keyboard.press('ControlOrMeta+z');
  await expect(retained).toContainText('mark text for removal');
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
    await expect
      .poll(() =>
        image.evaluate((element) => (element as HTMLImageElement).naturalWidth)
      )
      .toBeGreaterThan(0);
    const source = await image.getAttribute('src');
    const deleteImage = async () => {
      await image.hover();
      const handle = root
        .locator(':scope > div')
        .filter({ has: page.locator('.editor-image img') })
        .getByRole('button', { name: 'Drag block', exact: true });
      await handle.hover();
      await handle.locator('div').first().click();
      await expect(root).toBeFocused();
      await expect(
        root.locator('.editor-image[data-editor-retained]')
      ).toHaveCount(0);
      await page.keyboard.press(action === 'Accept' ? 'Backspace' : 'Delete');
    };

    await deleteImage();
    runtimeErrors.assertNone();
    const retained = root.locator(
      '.editor-image[data-editor-retained="delete"]'
    );

    await expect(root.locator('.editor-file')).toHaveCount(1);
    await expect(
      root.locator('.editor-file[data-editor-retained]')
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
    await paragraph.click();
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
  const retained = root.locator('[data-editor-retained="delete"]').first();
  const inserted = root.locator('[data-editor-authored-kind="insert"]').first();

  await expect(retained).toHaveCSS('text-decoration-line', 'line-through');
  const deletionBackground = await retained.evaluate(
    (element) => getComputedStyle(element).backgroundColor
  );
  const insertionBackground = await inserted.evaluate(
    (element) => getComputedStyle(element).backgroundColor
  );

  expect(deletionBackground).not.toBe('rgba(0, 0, 0, 0)');
  expect(insertionBackground).not.toBe('rgba(0, 0, 0, 0)');
  expect(deletionBackground).toBe(insertionBackground);
  await expect(inserted).toHaveCSS('text-decoration-line', 'underline');
  const authorHighlight = await root.evaluate((element) => {
    const sample = document.createElement('span');
    sample.style.backgroundColor =
      'color-mix(in oklab, var(--color-emerald-200) 80%, transparent)';
    element.ownerDocument.body.append(sample);
    const color = getComputedStyle(sample).backgroundColor;
    sample.remove();
    return color;
  });

  await retained.hover();
  await expect(retained).toHaveCSS('background-color', authorHighlight);
  await page.mouse.move(0, 0);
  await expect(retained).toHaveCSS('background-color', deletionBackground);
  runtimeErrors.assertNone();
});

for (const action of ['Accept', 'Reject'] as const) {
  test(`types inside a deleted word and resolves it with ${action}`, async ({
    page,
  }) => {
    const { root, runtimeErrors } = await openSuggestions(page);
    const retained = root.locator('[data-editor-retained="delete"]');

    await expect(retained).toHaveText('redundant phrase ');
    const target = await retained.evaluate((element) => {
      const text = document
        .createTreeWalker(element, NodeFilter.SHOW_TEXT)
        .nextNode();
      if (!text) throw new Error('Missing retained text');
      const range = document.createRange();
      range.setStart(text, 6);
      range.collapse(true);
      const rect = range.getBoundingClientRect();
      return { x: rect.left, y: rect.top + rect.height / 2 };
    });

    await page.mouse.click(target.x, target.y);
    await page.keyboard.type('XY');
    await expect(retained).toHaveText('redundXYant phrase ');
    await page.keyboard.press('Backspace');
    await expect(retained).toHaveText('redundXant phrase ');
    await page.keyboard.press('ControlOrMeta+z');
    await expect(retained).toHaveText('redundXYant phrase ');
    await page.keyboard.press('ControlOrMeta+Shift+z');
    await page.keyboard.type('Z');
    await expect(retained).toHaveText('redundXZant phrase ');
    await page.keyboard.press('Enter');
    await page.keyboard.type('Q');
    await expect
      .poll(async () => {
        const texts = await retained.allTextContents();
        return texts.join('');
      })
      .toBe('redundXZQant phrase ');
    await expect(
      root
        .locator('[data-editor-node="element"]')
        .filter({ hasText: 'Keep this' })
    ).toHaveText('Keep this redundXZ');
    await expect(
      root
        .locator('[data-editor-node="element"]')
        .filter({ hasText: 'out of the final draft.' })
    ).toHaveText('Qant phrase out of the final draft.');
    const card = page.locator('[data-suggestion-review]');

    await expect(card).toHaveCount(1);
    await expect(card).toContainText('Delete');
    await expect(card).toContainText('Qant phrase');
    await decideSuggestion(page, card, action);
    await expect(retained).toHaveCount(0);
    await expect(root).toContainText(
      action === 'Reject'
        ? 'Keep this redundant phrase out of the final draft.'
        : 'Keep this out of the final draft.'
    );
    await root.focus();
    await page.keyboard.press('ControlOrMeta+z');
    await expect
      .poll(async () => {
        const contents = await retained.allTextContents();

        return contents.join('');
      })
      .toBe('redundXZQant phrase ');
    runtimeErrors.assertNone();
  });
}

test('paints one caret inside redlined text during pointer and arrow navigation', async ({
  page,
}, testInfo) => {
  type CaretFrame = {
    key: string;
    offset: number;
    inside: boolean;
    collapsed: boolean;
    dx: number;
    dy: number;
    height: number;
  };
  const { editor, root, runtimeErrors } = await openSuggestions(page);
  const retained = root.locator('[data-editor-retained="delete"]');
  const caret = root.locator('[data-editor-view-selection-caret]');
  const target = await retained.evaluate((element) => {
    const text = document
      .createTreeWalker(element, NodeFilter.SHOW_TEXT)
      .nextNode();
    if (!text) throw new Error('Missing retained text');
    const range = document.createRange();
    range.setStart(text, 6);
    range.collapse(true);
    const rect = range.getBoundingClientRect();
    return { x: rect.left, y: rect.top + rect.height / 2 };
  });
  await page.evaluate(() => {
    const trace: Array<{ type: string; buttons: number; retained: boolean }> =
      [];
    Object.assign(window, { __retainedCaretInputTrace: trace });
    for (const type of [
      'pointerdown',
      'mousedown',
      'pointerup',
      'mouseup',
      'click',
      'keydown',
    ]) {
      document.addEventListener(
        type,
        (event) => {
          trace.push({
            type: event.type,
            buttons: 'buttons' in event ? Number(event.buttons) : 0,
            retained:
              event.target instanceof Element &&
              !!event.target.closest('[data-editor-retained="delete"]'),
          });
        },
        { capture: true }
      );
    }
    document.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      const frame = new Promise<CaretFrame | null>((resolve) => {
        // Sample the first frame after the key handler schedules its DOM reads.
        queueMicrotask(() =>
          requestAnimationFrame(() => {
            const selection = window.getSelection();
            const caretElement = document.querySelector(
              '[data-editor-view-selection-caret]'
            );
            const retainedElement = document.querySelector(
              '[data-editor-retained="delete"]'
            );
            if (!selection?.rangeCount || !caretElement) {
              resolve(null);
              return;
            }
            const native = selection.getRangeAt(0).getBoundingClientRect();
            const painted = caretElement.getBoundingClientRect();
            resolve({
              key: event.key,
              offset: selection.anchorOffset,
              inside:
                !!selection.anchorNode &&
                !!retainedElement?.contains(selection.anchorNode),
              collapsed: selection.isCollapsed,
              dx: Math.abs(painted.left - native.left),
              dy: Math.abs(painted.top - native.top),
              height: painted.height,
            });
          })
        );
      });
      Object.assign(window, { __retainedCaretArrowFrame: frame });
    });
  });
  await page.mouse.click(target.x, target.y);
  const assertCaret = async (offset: number, arrowKey?: string) => {
    const arrowFrame = arrowKey
      ? await page.evaluate(
          () =>
            (
              window as typeof window & {
                __retainedCaretArrowFrame?: Promise<CaretFrame | null>;
              }
            ).__retainedCaretArrowFrame
        )
      : null;
    if (arrowKey) {
      expect(arrowFrame).toMatchObject({
        key: arrowKey,
        offset,
        inside: true,
        collapsed: true,
      });
    }
    await expect
      .poll(() =>
        retained.evaluate((element) => {
          const selection = window.getSelection();
          return {
            inside:
              !!selection?.anchorNode && element.contains(selection.anchorNode),
            collapsed: selection?.isCollapsed,
            offset: selection?.anchorOffset,
          };
        })
      )
      .toEqual({ inside: true, collapsed: true, offset });
    await expect(caret).toHaveCount(1);
    await expect(caret).toBeVisible();
    const geometry =
      arrowFrame ??
      (await caret.evaluate((element) => {
        const selection = window.getSelection();
        if (!selection?.rangeCount) throw new Error('Missing native selection');
        const native = selection.getRangeAt(0).getBoundingClientRect();
        const painted = element.getBoundingClientRect();
        return {
          dx: Math.abs(painted.left - native.left),
          dy: Math.abs(painted.top - native.top),
          height: painted.height,
        };
      }));
    expect(geometry.dx).toBeLessThanOrEqual(1);
    expect(geometry.dy).toBeLessThanOrEqual(1);
    expect(geometry.height).toBeGreaterThan(10);
  };
  await assertCaret(6);
  const focusRect = await retained.evaluate(() => {
    const selection = window.getSelection();
    if (!selection?.rangeCount) throw new Error('Missing native caret');
    const rect = selection.getRangeAt(0).getBoundingClientRect();
    return { x: rect.left, y: rect.top, height: rect.height };
  });
  const clip = {
    x: Math.floor(focusRect.x) - 3,
    y: Math.floor(focusRect.y),
    width: 14,
    height: Math.ceil(focusRect.height),
  };
  const captures = new Map<
    string,
    { data: number[]; width: number; height: number }
  >();
  for (const control of ['actual', 'absent', 'single', 'duplicate']) {
    await page.evaluate(
      ({ control: mode, focusRect: pointRect }) => {
        document.querySelector('[data-test-caret-controls]')?.remove();
        if (mode === 'actual') return;
        const container = document.createElement('div');
        container.setAttribute('data-test-caret-controls', '');
        container.style.pointerEvents = 'none';
        const style = document.createElement('style');
        style.textContent =
          '[data-editor-view-selection-caret] { visibility: hidden !important; } [data-editor] { caret-color: transparent !important; }';
        container.append(style);
        const count = mode === 'absent' ? 0 : mode === 'single' ? 1 : 2;
        for (let index = 0; index < count; index++) {
          const line = document.createElement('span');
          Object.assign(line.style, {
            backgroundColor: getComputedStyle(
              document.querySelector('[aria-label="Suggestions document"]')!
            ).color,
            height: `${pointRect.height}px`,
            left: `${pointRect.x + index * 5}px`,
            position: 'fixed',
            top: `${pointRect.y}px`,
            width: '1px',
            zIndex: '2147483647',
          });
          container.append(line);
        }
        document.body.append(container);
      },
      { control, focusRect }
    );
    const png = await page.screenshot({
      caret: 'initial',
      clip,
      path: testInfo.outputPath(`retained-caret-${control}.png`),
    });
    if (control === 'actual') {
      const inputTrace = await page.evaluate(
        () =>
          (
            window as typeof window & {
              __retainedCaretInputTrace: Array<{
                type: string;
                buttons: number;
                retained: boolean;
              }>;
            }
          ).__retainedCaretInputTrace
      );
      expect(inputTrace).toEqual([
        { type: 'pointerdown', buttons: 1, retained: true },
        { type: 'mousedown', buttons: 1, retained: true },
        { type: 'pointerup', buttons: 0, retained: true },
        { type: 'mouseup', buttons: 0, retained: true },
        { type: 'click', buttons: 0, retained: true },
      ]);
    }
    captures.set(
      control,
      await page.evaluate(async (base64) => {
        const bytes = Uint8Array.from(atob(base64), (value) =>
          value.charCodeAt(0)
        );
        const image = await createImageBitmap(
          new Blob([bytes], { type: 'image/png' })
        );
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Missing pixel decoder');
        context.drawImage(image, 0, 0);
        return {
          data: Array.from(
            context.getImageData(0, 0, image.width, image.height).data
          ),
          width: image.width,
          height: image.height,
        };
      }, png.toString('base64'))
    );
  }
  const absent = captures.get('absent')!;
  const strokes = (name: string) => {
    const image = captures.get(name)!;
    let count = 0;
    let previous = false;
    for (let x = 0; x < image.width; x++) {
      let changed = 0;
      for (let y = 0; y < image.height; y++) {
        const index = (y * image.width + x) * 4;
        if (
          [0, 1, 2].some(
            (channel) =>
              Math.abs(
                image.data[index + channel] - absent.data[index + channel]
              ) > 24
          )
        ) {
          changed += 1;
        }
      }
      const stroke = changed >= image.height * 0.7;
      if (stroke && !previous) count += 1;
      previous = stroke;
    }
    return count;
  };
  expect(strokes('absent')).toBe(0);
  expect(strokes('single')).toBe(1);
  expect(strokes('duplicate')).toBe(2);
  expect(strokes('actual')).toBe(1);
  await page.evaluate(() => {
    document.querySelector('[data-test-caret-controls]')?.remove();
  });
  await testInfo.attach('retained-caret', {
    body: await page.screenshot({
      caret: 'initial',
      path: testInfo.outputPath('retained-caret.png'),
    }),
    contentType: 'image/png',
  });
  await assertCaret(6);
  await page.keyboard.press('ArrowLeft');
  await assertCaret(5, 'ArrowLeft');
  await page.keyboard.press('ArrowRight');
  await assertCaret(6, 'ArrowRight');
  const original = await editor.get.modelBlockTexts();
  await page.keyboard.type('!');
  await editor.assert.modelBlockTexts(original);
  await page.getByRole('textbox', { name: 'Comment on suggestion' }).click();
  await expect(caret).toHaveCount(0);
  await page.mouse.click(target.x, target.y);
  await assertCaret(6);
  await page.keyboard.press('Escape');
  await page.keyboard.press('End');
  await page.keyboard.type('!');
  await editor.assert.modelBlockTexts([
    original[0],
    `${original[1]}!`,
    original[2],
  ]);
  await expect(caret).toHaveCount(0);
  runtimeErrors.assertNone();
});

test('expands a pointer selection across deleted text boundaries', async ({
  page,
}, testInfo) => {
  const { editor, root, runtimeErrors } = await openSuggestions(page);
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
    };
  });

  const dragAndAssert = async ({
    anchor,
    from,
    selectedTextLength,
    retainedText,
    to,
  }: {
    anchor: 'live' | 'retained';
    from: { x: number; y: number };
    selectedTextLength: number;
    retainedText: string;
    to: { x: number; y: number };
  }) => {
    await page.mouse.move(from.x, from.y);
    await page.mouse.down();
    await page.mouse.move(to.x, to.y, { steps: 8 });
    await page.mouse.up();

    await expect
      .poll(() => editor.get.displayedSelection())
      .toMatchObject({
        doubleHighlighted: false,
        hasVisibleSelection: true,
        source: 'view',
        view: {
          active: true,
          textLength: selectedTextLength,
        },
      });
    await expect(
      root.locator(
        '[data-editor-retained="delete"] [data-editor-view-selection]'
      )
    ).toHaveText(retainedText);
    const displayed = await editor.get.displayedSelection();
    if (anchor === 'retained') {
      expect(displayed.model).toBeNull();
    } else {
      expect(displayed.model?.anchor).toEqual(displayed.model?.focus);
    }
  };

  await dragAndAssert({
    anchor: 'live',
    from: points.prefix,
    selectedTextLength: 20,
    retainedText: 'redundant phras',
    to: points.deletedEnd,
  });
  await dragAndAssert({
    anchor: 'live',
    from: points.suffix,
    selectedTextLength: 16,
    retainedText: 'ndant phrase',
    to: points.deletedStart,
  });
  await dragAndAssert({
    anchor: 'retained',
    from: points.deletedStart,
    selectedTextLength: 16,
    retainedText: 'ndant phrase',
    to: points.suffix,
  });
  await dragAndAssert({
    anchor: 'retained',
    from: points.deletedEnd,
    selectedTextLength: 20,
    retainedText: 'redundant phras',
    to: points.prefix,
  });

  await testInfo.attach('deleted-pointer-selection.json', {
    body: JSON.stringify(await editor.get.displayedSelection(), null, 2),
    contentType: 'application/json',
  });
  await testInfo.attach('deleted-pointer-selection.png', {
    body: await page.screenshot({
      caret: 'initial',
      path: testInfo.outputPath('deleted-pointer-selection.png'),
    }),
    contentType: 'image/png',
  });

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

  await block.evaluate((element, currentBlockIndex) => {
    const target = element as HTMLElement & {
      __suggestionFirstPaints?: SuggestionPaintSnapshot[];
    };
    const editorRoot = element.closest('[data-editor="true"]') as
      | (HTMLElement & {
          __pliteBrowserHandle?: {
            getBlockText: (index: number) => string | null;
          };
        })
      | null;
    let input = 0;
    const capture = (inputIndex: number) => {
      const spans = [
        ...element.querySelectorAll('[data-editor-authored-kind="insert"]'),
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
        model:
          editorRoot?.__pliteBrowserHandle?.getBlockText(currentBlockIndex) ??
          null,
        spans,
        text: element.textContent ?? '',
      });
    };

    target.__suggestionFirstPaints = [];
    editorRoot?.addEventListener(
      'input',
      () => {
        const inputIndex = input;
        input += 1;

        requestAnimationFrame(() => {
          capture(inputIndex);
        });
      },
      { capture: true }
    );
  }, blockIndex);

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
    const inserted = characters.slice(0, input + 1);
    const text = `Try ${inserted.join('')}typing your own suggestion here.`;
    const spans = inserted.map((character, index) => ({
      end: 5 + index,
      index,
      start: 4 + index,
      text: character,
    }));

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
    block.locator('[data-editor-authored-kind="insert"]')
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
    block.locator('[data-editor-authored-kind="insert"]')
  ).toHaveCount(0);
  await expect(block.locator('[data-editor-retained="delete"]')).toHaveCount(0);

  await page.keyboard.press('ControlOrMeta+z');
  await editor.assert.modelBlockText(blockIndex, inserted);
  await editor.assert.selection({
    anchor: { path, offset: at + 1 },
    focus: { path, offset: at + 1 },
  });
  await expect.poll(() => editor.get.selectedText()).toBe('');
  await expect(
    block.locator(`[data-editor-authored-change="${id}"]`)
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
    block.locator('[data-editor-authored-kind="insert"]')
  ).toHaveCount(0);
  await expect(block.locator('[data-editor-retained="delete"]')).toHaveCount(0);
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
    block.locator('[data-editor-authored-kind="insert"]')
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
  await expect(mergedBlock.locator('[data-editor-retained]')).toHaveCount(0);
  await page.keyboard.type('x');
  await editor.assert.modelBlockText(
    blockIndex,
    'Try xtyping your own suggestion here.'
  );
  await editor.assert.collapsedModelDOMSelection({
    path,
    offset: at + 1,
    text: 'x',
  });
  runtimeErrors.assertNone();
});

test('cancels a proposed deletion when its author types the removed character again', async ({
  page,
}) => {
  const { editor, root, runtimeErrors } = await openSuggestions(page);
  const blockTexts = await editor.get.modelBlockTexts();
  const blockIndex = blockTexts.indexOf(THIRD_PARAGRAPH);
  const block = root.locator('[data-editor-node="element"]').nth(blockIndex);
  const trigger = getBlockDiscussionTrigger(block);
  await editor.selection.collapse({ path: [blockIndex, 0], offset: 5 });
  await editor.focus();
  await page.keyboard.press('Backspace');
  await editor.assert.modelBlockText(
    blockIndex,
    'Try yping your own suggestion here.'
  );
  await expect(block.locator('[data-editor-retained="delete"]')).toHaveText(
    't'
  );
  await page.keyboard.type('t');
  await editor.assert.modelBlockText(blockIndex, THIRD_PARAGRAPH);
  await expect(trigger).toHaveCount(0);
  await expect(block.locator('[data-editor-authored-change]')).toHaveCount(0);
  await expect(block.locator('[data-editor-retained]')).toHaveCount(0);
  runtimeErrors.assertNone();
});

test('keeps rapid arrow navigation inside a typed suggestion', async ({
  page,
}) => {
  const { editor, runtimeErrors } = await openSuggestions(page);
  const blockTexts = await editor.get.modelBlockTexts();
  const blockIndex = blockTexts.indexOf(THIRD_PARAGRAPH);

  expect(blockIndex).toBeGreaterThanOrEqual(0);

  const path = [blockIndex, 0];
  const at = 4;

  await editor.selection.collapse({ path, offset: at });
  await editor.focus();
  await page.keyboard.type('XYZ');

  for (const offset of [at + 2, at + 1, at]) {
    await page.keyboard.press('ArrowLeft');
    await expect
      .poll(() => editor.get.selection())
      .toEqual({
        anchor: { path, offset },
        focus: { path, offset },
      });

    if (offset > at) {
      await editor.assert.collapsedModelDOMSelection({
        path,
        offset,
        text: offset === at + 1 ? 'X' : 'Y',
      });
    }
  }

  for (const offset of [at + 1, at + 2, at + 3]) {
    await page.keyboard.press('ArrowRight');
    await expect
      .poll(() => editor.get.selection())
      .toEqual({
        anchor: { path, offset },
        focus: { path, offset },
      });

    if (offset < at + 3) {
      await editor.assert.collapsedModelDOMSelection({
        path,
        offset,
        text: offset === at + 1 ? 'X' : 'Y',
      });
    }
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
    offset: at + 2,
    text: '!',
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

  await editor.assert.collapsedModelDOMSelection({
    path: [blockIndex + 1, 0],
    offset: 0,
    text: 'Y',
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

  await expect(popover).toBeVisible();
  await expect(cards).toHaveCount(1);
  await expect(cards.first()).toContainText('Add paragraph break');
  await decideSuggestion(page, cards.first(), 'Accept');
  await editor.assert.modelBlockTexts(expected);
  await editor.selection.collapse({ path: [blockIndex + 1, 0], offset: 0 });
  await editor.focus();
  await page.keyboard.type('!');

  await editor.assert.modelBlockText(
    blockIndex + 1,
    '!YZtyping your own suggestion here.'
  );
  await expect(
    root
      .locator('[data-editor-authored-kind="insert"]')
      .filter({ hasText: '!' })
  ).toBeVisible();
  runtimeErrors.assertNone();
});

test('rejects a backward paragraph merge and keeps typing', async ({
  page,
}) => {
  const { editor, root, runtimeErrors } = await openSuggestions(page);

  const popover = page.locator('[data-discussion-popover]');

  await root
    .locator('[data-editor-authored-kind="insert"]')
    .filter({ hasText: 'collaboratively' })
    .click();
  await expect(popover).toBeVisible();
  await expect(popover.locator('[data-suggestion-review]')).toHaveCount(1);
  await decideSuggestion(
    page,
    popover.locator('[data-suggestion-review]').first(),
    'Accept'
  );

  await root.locator('[data-editor-retained="delete"]').click();
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

  await editor.assert.modelBlockTexts([
    `${blockTexts[0]}${blockTexts[1]}`,
    ...blockTexts.slice(2),
  ]);

  const mergedBlock = root.locator('[data-editor-node="element"]').first();
  const trigger = getBlockDiscussionTrigger(mergedBlock);

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

  await editor.assert.modelBlockTexts(blockTexts);
  await editor.selection.collapse({ path: [1, 0], offset: 0 });
  await editor.focus();
  await page.keyboard.type('!');
  await editor.assert.modelBlockText(1, `!${blockTexts[1]}`);
  await expect(
    root
      .locator('[data-editor-authored-kind="insert"]')
      .filter({ hasText: '!' })
  ).toBeVisible();
  runtimeErrors.assertNone();
});
