import {
  createPliteBrowserEditorHarness,
  getPliteReactRenderProfilerSnapshot,
  installPliteReactRenderProfiler,
  recordPliteBrowserRuntimeErrors,
  resetPliteReactRenderProfiler,
} from '@platejs/test/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';

const EDITOR = '[data-plite-editor="true"]';

test('Playground loads its full document and starter discussions', async ({
  page,
}) => {
  const errors = recordPliteBrowserRuntimeErrors(page);

  try {
    await page.goto('/blocks/playground-demo', { waitUntil: 'commit' });
    await expect(
      page.getByRole('heading', { name: 'Welcome to the Plate Playground!' })
    ).toBeVisible({ timeout: 20_000 });
    await expect(
      page.getByRole('textbox', { name: 'Enter your code here...' })
    ).toContainText('classDiagram');
    await page
      .getByRole('button', { name: 'Open 5 discussion items for this block' })
      .click();
    const discussion = page.getByRole('dialog', { name: 'Discussion items' });
    await expect(discussion.getByRole('article')).toHaveCount(5);
    await expect(discussion).toContainText(
      'Comments are a great way to provide feedback and discuss changes.'
    );
    await expect(discussion).toContainText(
      'Nice demonstration of overlapping annotations with both comments and suggestions!'
    );
    await expect(
      discussion.getByRole('textbox', { name: 'Reply to thread' })
    ).toHaveCount(2);
    errors.assertNone();
  } finally {
    errors.stop();
  }
});

const FIRST_BLOCK =
  'This paragraph has two overlapping comments backed by persistent editor anchors.';
const OWNERSHIP_TEXT = FIRST_BLOCK.slice(5, 34);
const OVERLAP_TEXT = FIRST_BLOCK.slice(24, 55);
const bold = process.platform === 'darwin' ? 'Meta+b' : 'Control+b';
const aiHotkey = process.platform === 'darwin' ? 'Meta+j' : 'Control+j';
const commentHotkey =
  process.platform === 'darwin' ? 'Meta+Shift+m' : 'Control+Shift+m';
const submit = process.platform === 'darwin' ? 'Meta+Enter' : 'Control+Enter';
const selectAll = process.platform === 'darwin' ? 'Meta+a' : 'Control+a';
const undo = process.platform === 'darwin' ? 'Meta+z' : 'Control+z';
const redo = process.platform === 'darwin' ? 'Meta+Shift+z' : 'Control+Shift+z';

const getDemo = (page: Page) => {
  const primary = page.locator('[data-comment-editor="primary"]');

  return {
    editor: primary.locator(EDITOR).first(),
    popover: page.locator('[data-discussion-popover]'),
    primary,
    reviewer: page.locator('[data-comment-editor="reviewer"]'),
    staticView: page.locator('[data-comment-editor="static"]'),
  };
};

const openDemo = async (page: Page) => {
  await page.goto('/blocks/discussion-proof', { waitUntil: 'commit' });
  await expect(page.getByLabel('Static annotated document')).toBeVisible({
    timeout: 20_000,
  });
  await createPliteBrowserEditorHarness(
    page,
    'Comments proof',
    getDemo(page).editor
  ).ready({ editor: 'visible', text: FIRST_BLOCK });
};

const pointAtTextOffset = async (
  target: Locator,
  offset: number,
  edge: 'end' | 'start' = 'start'
) =>
  target.evaluate(
    (element, { absoluteOffset, edge: targetEdge }) => {
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
        acceptNode: (node) =>
          node.parentElement?.closest('[data-plite-node="text"]')
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_REJECT,
      });
      let consumed = 0;
      let current = walker.nextNode();

      while (current) {
        const text = current as Text;

        if (absoluteOffset < consumed + text.length) {
          const range = document.createRange();
          const localOffset = absoluteOffset - consumed;

          range.setStart(text, localOffset);
          range.setEnd(text, Math.min(localOffset + 1, text.length));

          const rect = range.getBoundingClientRect();

          return {
            x: targetEdge === 'end' ? rect.right - 1 : rect.left + 1,
            y: rect.top + rect.height / 2,
          };
        }

        consumed += text.length;
        current = walker.nextNode();
      }

      throw new Error(`Text offset ${absoluteOffset} is outside the target.`);
    },
    { absoluteOffset: offset, edge }
  );

const physicallySelectText = async (
  page: Page,
  target: Locator,
  startOffset: number,
  endOffset: number
) => {
  await target.scrollIntoViewIfNeeded();
  const [start, end] = await Promise.all([
    pointAtTextOffset(target, startOffset),
    pointAtTextOffset(target, endOffset - 1, 'end'),
  ]);

  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(end.x, end.y, { steps: 12 });
  await page.mouse.up();
  await expect
    .poll(() =>
      page.evaluate(() => globalThis.getSelection()?.toString() ?? '')
    )
    .not.toBe('');
};

const physicallyPlaceCaret = async (
  page: Page,
  target: Locator,
  offset: number
) => {
  await target.scrollIntoViewIfNeeded();
  const point = await pointAtTextOffset(target, offset);

  await page.mouse.click(point.x, point.y);
  await expect
    .poll(() =>
      target.evaluate((element) => {
        const selection = window.getSelection();
        const anchorNode = selection?.anchorNode;

        if (!anchorNode || !element.contains(anchorNode)) return null;

        const walker = document.createTreeWalker(
          element,
          NodeFilter.SHOW_TEXT,
          {
            acceptNode: (node) =>
              node.parentElement?.closest('[data-plite-node="text"]')
                ? NodeFilter.FILTER_ACCEPT
                : NodeFilter.FILTER_REJECT,
          }
        );
        let consumed = 0;
        let current = walker.nextNode();

        while (current) {
          if (current === anchorNode) {
            return consumed + (selection?.anchorOffset ?? 0);
          }

          consumed += (current as Text).length;
          current = walker.nextNode();
        }

        return null;
      })
    )
    .toBe(offset);
};

const selectCharacterWithKeyboard = async (
  page: Page,
  target: Locator,
  offset: number
) => {
  await physicallyPlaceCaret(page, target, offset);
  await page.keyboard.press('Shift+ArrowRight');

  await expect
    .poll(() =>
      page.evaluate(() => globalThis.getSelection()?.toString() ?? '')
    )
    .toHaveLength(1);
};

const getCommentText = (primary: Locator, id: string) =>
  primary
    .locator(`[data-comment-id="${id}"]`)
    .evaluateAll((elements) =>
      elements.map((element) => element.textContent).join('')
    );

const getEditorText = (node: Locator) =>
  node
    .locator('[data-plite-node="text"]')
    .evaluateAll((elements) =>
      elements.map((element) => element.textContent).join('')
    );

const clickCommentHighlight = async (page: Page, highlight: Locator) => {
  await page.evaluate(() => {
    const trace: string[] = [];
    const record = (event: Event) => {
      if ((event.target as Element).closest('[data-comment-id]')) {
        trace.push(event.type);
      }
    };

    Object.assign(window, { __commentClickTrace: trace });
    for (const type of ['pointerdown', 'mousedown', 'click']) {
      document.addEventListener(type, record, { capture: true, once: true });
    }
  });
  await highlight.click();

  expect(
    await page.evaluate(
      () =>
        (
          window as typeof window & {
            __commentClickTrace: string[];
          }
        ).__commentClickTrace
    )
  ).toEqual(['pointerdown', 'mousedown', 'click']);
};

const getPaint = (locator: Locator) =>
  locator.evaluate((element) => {
    const style = getComputedStyle(element);

    return {
      backgroundColor: style.backgroundColor,
      borderBottomColor: style.borderBottomColor,
    };
  });

const submitComposer = async (composer: Locator) => {
  await composer
    .locator('xpath=ancestor::form')
    .getByRole('button', { name: 'Send comment' })
    .click();
};

test('overlapping comments open together in Floating Discussion', async ({
  page,
}, testInfo) => {
  expect(testInfo.retry).toBe(0);
  const runtimeErrors = recordPliteBrowserRuntimeErrors(page);

  try {
    await openDemo(page);
    const { editor, popover, primary } = getDemo(page);

    await clickCommentHighlight(
      page,
      primary.locator('[data-comment-id="overlap"]').first()
    );
    await expect(popover).toBeVisible();
    await expect(popover.locator('[data-comment-thread]')).toHaveCount(2);
    await expect
      .poll(() =>
        popover
          .locator('[data-comment-thread]')
          .evaluateAll((elements) =>
            elements.map((element) =>
              element.getAttribute('data-comment-thread')
            )
          )
      )
      .toEqual(['ownership', 'overlap']);
    await expect(
      primary.locator('[data-comment-id="ownership"][data-comment-active]')
    ).toHaveCount(2);
    await expect(
      primary.locator('[data-comment-id="overlap"][data-comment-active]')
    ).toHaveCount(2);

    await editor
      .locator('[data-plite-node="element"]')
      .first()
      .click({ position: { x: 4, y: 8 } });
    await expect(popover).toHaveCount(0);
    await expect(primary.locator('[data-comment-active]')).toHaveCount(0);

    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('a fully deleted comment stays reachable and exact through repeated history', async ({
  page,
}, testInfo) => {
  expect(testInfo.retry).toBe(0);
  const runtimeErrors = recordPliteBrowserRuntimeErrors(page);

  try {
    await openDemo(page);
    const { editor, popover, primary } = getDemo(page);
    const firstBlock = editor.locator('[data-plite-node="element"]').first();

    await physicallySelectText(page, firstBlock, 0, 1);
    await editor.press(commentHotkey);
    const composer = popover.getByRole('textbox', { name: 'New comment' });

    await expect(composer).toBeFocused();
    await composer.fill('Last character survives');
    await submitComposer(composer);

    const thread = popover
      .locator('[data-comment-thread]')
      .filter({ hasText: 'Last character survives' });
    const threadId = await thread.getAttribute('data-comment-thread');

    expect(threadId).not.toBeNull();
    await expect(primary.locator(`[data-comment-id="${threadId}"]`)).toHaveText(
      'T'
    );

    await physicallyPlaceCaret(page, firstBlock, 1);
    await page.keyboard.press('Backspace');
    await expect
      .poll(() => getEditorText(firstBlock))
      .toBe(FIRST_BLOCK.slice(1));
    await expect(
      primary.locator(`[data-comment-id="${threadId}"]`)
    ).toHaveCount(0);

    const trigger = primary.locator('[data-discussion-block-trigger]').first();

    await expect(trigger).toHaveAccessibleName(
      'Open 3 discussion items for this block'
    );
    await trigger.click();
    await expect(popover).toBeVisible();
    await expect(thread).toBeVisible();
    await expect(popover.locator('[data-comment-thread]')).toHaveCount(3);

    const assertPopupFollowsTrigger = async () => {
      const [popoverBox, triggerBox] = await Promise.all([
        popover.boundingBox(),
        trigger.boundingBox(),
      ]);

      expect(popoverBox).not.toBeNull();
      expect(triggerBox).not.toBeNull();
      expect(popoverBox!.x).toBeGreaterThan(0);
      expect(popoverBox!.y).toBeGreaterThan(0);
      const triggerCenter = triggerBox!.x + triggerBox!.width / 2;

      expect(triggerCenter).toBeGreaterThanOrEqual(popoverBox!.x - 2);
      expect(triggerCenter).toBeLessThanOrEqual(
        popoverBox!.x + popoverBox!.width + 2
      );
      expect(Math.abs(popoverBox!.y - triggerBox!.y)).toBeLessThan(500);
    };

    await assertPopupFollowsTrigger();

    for (let cycle = 0; cycle < 5; cycle += 1) {
      await editor.press(undo);
      await expect.poll(() => getEditorText(firstBlock)).toBe(FIRST_BLOCK);
      await expect(
        primary.locator(`[data-comment-id="${threadId}"]`)
      ).toHaveText('T');
      await clickCommentHighlight(
        page,
        primary.locator(`[data-comment-id="${threadId}"]`)
      );
      await expect(thread).toBeVisible();

      await editor.press(redo);
      await expect
        .poll(() => getEditorText(firstBlock))
        .toBe(FIRST_BLOCK.slice(1));
      await expect(
        primary.locator(`[data-comment-id="${threadId}"]`)
      ).toHaveCount(0);
      await trigger.click();
      await expect(thread).toBeVisible();
      await assertPopupFollowsTrigger();
    }

    const reply = thread.getByRole('textbox', { name: 'Reply to thread' });

    await reply.fill('Still attached');
    await reply.press(submit);
    await expect(thread.getByText('Still attached')).toBeVisible();

    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('interior insertion and deletion keep overlapping comments exact through history', async ({
  page,
}, testInfo) => {
  expect(testInfo.retry).toBe(0);
  const runtimeErrors = recordPliteBrowserRuntimeErrors(page);

  try {
    await openDemo(page);
    let { editor, popover, primary } = getDemo(page);
    let firstBlock = editor.locator('[data-plite-node="element"]').first();

    await physicallyPlaceCaret(page, firstBlock, 28);
    await page.keyboard.type('X');
    await expect(firstBlock).toContainText(
      `${FIRST_BLOCK.slice(0, 28)}X${FIRST_BLOCK.slice(28)}`
    );
    await expect
      .poll(() => getCommentText(primary, 'ownership'))
      .toBe(`${OWNERSHIP_TEXT.slice(0, 23)}X${OWNERSHIP_TEXT.slice(23)}`);
    await expect
      .poll(() => getCommentText(primary, 'overlap'))
      .toBe(`${OVERLAP_TEXT.slice(0, 4)}X${OVERLAP_TEXT.slice(4)}`);

    await editor.press(undo);
    await expect(firstBlock).toContainText(FIRST_BLOCK);
    await expect
      .poll(() => getCommentText(primary, 'ownership'))
      .toBe(OWNERSHIP_TEXT);
    await expect
      .poll(() => getCommentText(primary, 'overlap'))
      .toBe(OVERLAP_TEXT);

    await editor.press(redo);
    await expect(firstBlock).toContainText(
      `${FIRST_BLOCK.slice(0, 28)}X${FIRST_BLOCK.slice(28)}`
    );
    await clickCommentHighlight(
      page,
      primary.locator('[data-comment-id="overlap"]').first()
    );
    await expect
      .poll(() =>
        popover
          .locator('[data-comment-thread]')
          .evaluateAll((elements) =>
            elements.map((element) =>
              element.getAttribute('data-comment-thread')
            )
          )
      )
      .toEqual(['ownership', 'overlap']);

    await openDemo(page);
    ({ editor, popover, primary } = getDemo(page));
    firstBlock = editor.locator('[data-plite-node="element"]').first();

    await physicallyPlaceCaret(page, firstBlock, 28);
    await page.keyboard.press('Delete');
    await expect(firstBlock).toContainText(
      `${FIRST_BLOCK.slice(0, 28)}${FIRST_BLOCK.slice(29)}`
    );
    await expect
      .poll(() => getCommentText(primary, 'ownership'))
      .toBe(`${OWNERSHIP_TEXT.slice(0, 23)}${OWNERSHIP_TEXT.slice(24)}`);
    await expect
      .poll(() => getCommentText(primary, 'overlap'))
      .toBe(`${OVERLAP_TEXT.slice(0, 4)}${OVERLAP_TEXT.slice(5)}`);

    await editor.press(undo);
    await expect(firstBlock).toContainText(FIRST_BLOCK);
    await expect
      .poll(() => getCommentText(primary, 'ownership'))
      .toBe(OWNERSHIP_TEXT);
    await expect
      .poll(() => getCommentText(primary, 'overlap'))
      .toBe(OVERLAP_TEXT);

    await editor.press(redo);
    await expect(firstBlock).toContainText(
      `${FIRST_BLOCK.slice(0, 28)}${FIRST_BLOCK.slice(29)}`
    );
    await clickCommentHighlight(
      page,
      primary.locator('[data-comment-id="overlap"]').first()
    );
    await expect(popover.locator('[data-comment-thread]')).toHaveCount(2);

    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('inward comment boundaries exclude text inserted on either side', async ({
  page,
}, testInfo) => {
  expect(testInfo.retry).toBe(0);
  const runtimeErrors = recordPliteBrowserRuntimeErrors(page);

  try {
    await openDemo(page);
    const { popover, primary } = getDemo(page);
    const editor = primary.locator(EDITOR).first();
    const firstBlock = editor.locator('[data-plite-node="element"]').first();

    await physicallyPlaceCaret(page, firstBlock, 5);
    await page.keyboard.type('[');
    await physicallyPlaceCaret(page, firstBlock, 35);
    await page.keyboard.type(']');

    await expect(firstBlock).toContainText(
      `${FIRST_BLOCK.slice(0, 5)}[${OWNERSHIP_TEXT}]${FIRST_BLOCK.slice(34)}`
    );
    await expect
      .poll(() => getCommentText(primary, 'ownership'))
      .toBe(OWNERSHIP_TEXT);
    await clickCommentHighlight(
      page,
      primary.locator('[data-comment-id="ownership"]').first()
    );
    await expect(
      popover.locator('[data-comment-thread="ownership"]')
    ).toBeVisible();

    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('replacing an entire comment stays attached through undo and redo', async ({
  page,
}, testInfo) => {
  expect(testInfo.retry).toBe(0);
  const runtimeErrors = recordPliteBrowserRuntimeErrors(page);

  try {
    await openDemo(page);
    const { editor, popover, primary } = getDemo(page);
    const firstBlock = editor.locator('[data-plite-node="element"]').first();

    await physicallySelectText(page, firstBlock, 5, 34);
    await expect
      .poll(() => page.evaluate(() => globalThis.getSelection()?.toString()))
      .toBe(OWNERSHIP_TEXT);
    await page.keyboard.insertText('SWAP');

    await expect(firstBlock).toContainText(
      `${FIRST_BLOCK.slice(0, 5)}SWAP${FIRST_BLOCK.slice(34)}`
    );
    await expect.poll(() => getCommentText(primary, 'ownership')).toBe('SWAP');

    await editor.press(undo);
    await expect(firstBlock).toContainText(FIRST_BLOCK);
    await expect
      .poll(() => getCommentText(primary, 'ownership'))
      .toBe(OWNERSHIP_TEXT);

    await editor.press(redo);
    await expect(firstBlock).toContainText(
      `${FIRST_BLOCK.slice(0, 5)}SWAP${FIRST_BLOCK.slice(34)}`
    );
    await expect.poll(() => getCommentText(primary, 'ownership')).toBe('SWAP');
    await clickCommentHighlight(
      page,
      primary.locator('[data-comment-id="ownership"]')
    );
    await expect(
      popover.locator('[data-comment-thread="ownership"]')
    ).toBeVisible();

    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('annotated blocks open their own combined Floating Discussion', async ({
  page,
}, testInfo) => {
  expect(testInfo.retry).toBe(0);
  const runtimeErrors = recordPliteBrowserRuntimeErrors(page);

  try {
    await openDemo(page);
    const { popover, primary } = getDemo(page);
    const triggers = primary.locator('[data-discussion-block-trigger]');

    await expect(triggers).toHaveCount(2);
    await expect(triggers.nth(0)).toHaveAccessibleName(
      'Open 2 discussion items for this block'
    );
    await triggers.nth(0).click();
    await expect(popover).toBeVisible();
    await expect(popover.locator('[data-comment-thread]')).toHaveCount(2);
    await expect(popover.locator('[data-suggestion-review]')).toHaveCount(0);

    await triggers.nth(1).click();
    await expect(popover).toBeVisible();
    await expect(popover.locator('[data-suggestion-review]')).toHaveCount(2);
    await expect(
      popover.locator('[data-comment-thread="suggestion-thread"]')
    ).toBeVisible();

    await page.setViewportSize({ height: 900, width: 1280 });
    await page.goto('/view/editor-ai', { waitUntil: 'commit' });
    const aiEditor = page.locator('[data-plite-editor="true"]').first();
    const aiPopover = page.locator('[data-discussion-popover]');
    const aiTrigger = aiEditor.locator('[data-discussion-block-trigger]');

    await expect(aiEditor).toBeVisible({ timeout: 20_000 });
    await expect(aiTrigger).toHaveCount(1);
    await expect(aiTrigger).toHaveAccessibleName(
      'Open 5 discussion items for this block'
    );
    await aiTrigger.click();
    await expect(aiPopover.locator('[data-comment-thread]')).toHaveCount(2);
    await expect(aiPopover.locator('[data-suggestion-review]')).toHaveCount(3);

    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('discussion grouping follows block split and merge edits', async ({
  page,
}, testInfo) => {
  expect(testInfo.retry).toBe(0);
  const runtimeErrors = recordPliteBrowserRuntimeErrors(page);

  try {
    await openDemo(page);
    const { editor, popover, primary } = getDemo(page);
    const triggers = primary.locator('[data-discussion-block-trigger]');
    const firstBlock = editor.locator('[data-plite-node="element"]').first();

    await physicallyPlaceCaret(page, firstBlock, 0);
    await editor.press('Enter');
    await expect(triggers).toHaveCount(2);
    await expect(triggers.nth(0)).toHaveAccessibleName(
      'Open 2 discussion items for this block'
    );
    await triggers.nth(0).click();
    await expect(popover.locator('[data-comment-thread]')).toHaveCount(2);
    await expect(popover.locator('[data-suggestion-review]')).toHaveCount(0);
    await triggers.nth(1).click();
    await expect(popover.locator('[data-suggestion-review]')).toHaveCount(2);
    await expect(
      popover.locator('[data-comment-thread="suggestion-thread"]')
    ).toBeVisible();

    const movedBlock = editor
      .locator('[data-plite-node="element"]')
      .filter({ hasText: FIRST_BLOCK })
      .first();

    await physicallyPlaceCaret(page, movedBlock, 0);
    await editor.press('Backspace');
    await expect(triggers).toHaveCount(2);
    await expect(triggers.nth(0)).toHaveAccessibleName(
      'Open 2 discussion items for this block'
    );
    await triggers.nth(0).click();
    await expect(popover.locator('[data-comment-thread]')).toHaveCount(2);

    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('splitting inside overlapping comments keeps both threads reachable on each side', async ({
  page,
}) => {
  await openDemo(page);
  const { editor, popover, primary } = getDemo(page);
  const triggers = primary.locator('[data-discussion-block-trigger]');
  await physicallyPlaceCaret(
    page,
    editor.locator('[data-plite-node="element"]').first(),
    30
  );
  await page.keyboard.press('Enter');
  await expect(triggers).toHaveCount(3);
  for (const index of [0, 1]) {
    await expect(triggers.nth(index)).toHaveAccessibleName(
      'Open 2 discussion items for this block'
    );
    await triggers.nth(index).click();
    await expect(popover.locator('[data-comment-thread]')).toHaveCount(2);
    await page.keyboard.press('Escape');
  }
  await editor.press(undo);
  await expect(triggers).toHaveCount(2);
  await editor.press(redo);
  await expect(triggers).toHaveCount(3);
});

test('discussion actions are reachable and visible with the keyboard', async ({
  page,
}) => {
  await openDemo(page);
  const { popover, primary } = getDemo(page);
  await primary.locator('[data-discussion-block-trigger]').first().click();
  await popover
    .getByRole('textbox', { name: 'Reply to thread' })
    .first()
    .click();
  await page.mouse.move(0, 0);
  await page.keyboard.press('Shift+Tab');
  const more = popover
    .getByRole('button', { name: 'More comment actions' })
    .first();
  await expect(more).toBeFocused();
  await expect
    .poll(() =>
      more.evaluate((button) => getComputedStyle(button.parentElement!).opacity)
    )
    .toBe('1');
  await page.keyboard.press('Enter');
  await expect(
    page.getByRole('menuitem', { name: 'Edit comment' })
  ).toBeVisible();
  await page.keyboard.press('Escape');
  await primary.locator('[data-discussion-block-trigger]').nth(1).click();
  await popover
    .getByRole('textbox', { name: 'Comment on suggestion' })
    .first()
    .click();
  await page.mouse.move(0, 0);
  await page.keyboard.press('Shift+Tab');
  const reject = popover
    .getByRole('button', { name: 'Reject suggestion' })
    .first();
  await expect(reject).toBeFocused();
  await expect
    .poll(() =>
      reject.evaluate(
        (button) => getComputedStyle(button.parentElement!).opacity
      )
    )
    .toBe('1');
});

for (const width of [1280, 390]) {
  test(`public discussion demo preserves mixed review and editing (${width}px)`, async ({
    page,
  }, testInfo) => {
    const errors = recordPliteBrowserRuntimeErrors(page);
    try {
      await page.setViewportSize({ width, height: 844 });
      await page.goto('/blocks/discussion-demo');
      const editor = page.locator(EDITOR).first();
      const trigger = page.getByRole('button', {
        name: 'Open 5 discussion items for this block',
      });
      const popover = page.locator('[data-discussion-popover]');
      await expect(
        editor.getByRole('heading', { name: 'Discussions' })
      ).toBeVisible();
      await expect(
        page
          .getByRole('toolbar')
          .first()
          .getByRole('button', { name: 'Text', exact: true })
      ).toBeVisible();
      await expect(trigger).toBeVisible();
      await testInfo.attach(`candidate-${width}-closed`, {
        body: await page.screenshot({ animations: 'disabled' }),
        contentType: 'image/png',
      });
      await trigger.click();
      await expect(popover.locator('[data-comment-thread]')).toHaveCount(2);
      await expect(popover.locator('[data-suggestion-review]')).toHaveCount(3);
      await expect(
        popover.getByText(
          'Comments are a great way to provide feedback and discuss changes.',
          { exact: true }
        )
      ).toBeVisible();
      const box = await popover.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(width);
      expect(box!.height).toBeLessThanOrEqual(844 / 2 + 1);
      await testInfo.attach(`candidate-${width}-mixed`, {
        body: await page.screenshot({ animations: 'disabled' }),
        contentType: 'image/png',
      });
      await page.keyboard.press('Escape');
      await editor.locator('[data-comment-id="discussion2"]').click();
      await expect(popover.locator('[data-comment-thread]')).toHaveCount(1);
      await expect(popover.locator('[data-suggestion-review]')).toHaveCount(1);
      await expect(
        popover.locator('[data-suggestion-review="playground3"]')
      ).toBeVisible();
      await popover.locator('[data-suggestion-review="playground3"]').hover();
      await popover.getByRole('button', { name: 'Accept suggestion' }).click();
      await expect(editor).toContainText('overlapping');
      await expect(
        popover.locator('[data-comment-thread="discussion2"]')
      ).toBeVisible();
      await expect(popover.locator('[data-suggestion-review]')).toHaveCount(0);
      await editor.press(undo);
      await expect(
        editor.locator('.plite-suggestion').filter({ hasText: 'overlapping' })
      ).toHaveCount(1);
      await page.keyboard.press('Escape');
      await physicallyPlaceCaret(
        page,
        editor.locator('[data-plite-node="element"]').first(),
        3
      );
      await editor.press('x');
      await expect(
        editor.getByRole('heading', { name: 'Disxcussions' })
      ).toBeVisible();
      errors.assertNone();
    } finally {
      errors.stop();
    }
  });

  test(`main discussion baseline at ${width}px`, async ({ page }, testInfo) => {
    const mainURL = process.env.PLATE_MAIN_BASE_URL;
    test.skip(
      !mainURL,
      'Set PLATE_MAIN_BASE_URL to the pinned main deployment for comparison.'
    );
    await page.setViewportSize({ width, height: 844 });
    await page.goto(`${mainURL}/blocks/discussion-demo`);
    await expect(
      page.getByRole('heading', { name: 'Discussions' })
    ).toBeVisible();
    const trigger = page.getByRole('button', { name: '5', exact: true });
    await expect(trigger).toBeVisible();
    await testInfo.attach(`main-${width}-closed`, {
      body: await page.screenshot({ animations: 'disabled' }),
      contentType: 'image/png',
    });
    await trigger.click();
    const popover = page.locator('[data-slot="popover-content"]');
    await expect(
      popover.getByText(
        'Comments are a great way to provide feedback and discuss changes.',
        { exact: true }
      )
    ).toBeVisible();
    await expect(popover.getByText('Add:', { exact: true })).toHaveCount(2);
    await expect(popover.getByText('Delete:', { exact: true })).toHaveCount(1);
    await expect(popover.locator('[contenteditable="true"]')).toHaveCount(5);
    await testInfo.attach(`main-${width}-mixed`, {
      body: await page.screenshot({ animations: 'disabled' }),
      contentType: 'image/png',
    });
  });
}

test.describe('touch discussion actions', () => {
  test.use({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 844 },
  });

  test('comment and suggestion controls stay visible without hover', async ({
    page,
  }) => {
    await openDemo(page);
    const { primary, popover } = getDemo(page);
    await primary.locator('[data-discussion-block-trigger]').first().tap();
    const more = popover
      .getByRole('button', { name: 'More comment actions' })
      .first();
    await expect
      .poll(() =>
        more.evaluate(
          (button) => getComputedStyle(button.parentElement!).opacity
        )
      )
      .toBe('1');
    await more.tap();
    await expect(
      page.getByRole('menuitem', { name: 'Edit comment' })
    ).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(
      page.getByRole('menuitem', { name: 'Edit comment' })
    ).toBeHidden();
    await page.keyboard.press('Escape');
    await expect(popover).toBeHidden();
    await primary.locator('[data-discussion-block-trigger]').nth(1).tap();
    const accept = popover
      .getByRole('button', { name: 'Accept suggestion' })
      .first();
    await expect
      .poll(() =>
        accept.evaluate(
          (button) => getComputedStyle(button.parentElement!).opacity
        )
      )
      .toBe('1');
    await accept.tap();
    await expect(popover.locator('[data-suggestion-review]')).toHaveCount(1);
  });
});

test('Floating Discussion preserves the established unboxed block design', async ({
  page,
}, testInfo) => {
  expect(testInfo.retry).toBe(0);
  const runtimeErrors = recordPliteBrowserRuntimeErrors(page);

  try {
    await openDemo(page);
    const { popover, primary } = getDemo(page);
    const trigger = primary.locator('[data-discussion-block-trigger]').first();

    await trigger.click();
    await expect(popover).toBeVisible();
    await expect(popover.getByText(/^Block 1 ·/)).toHaveCount(0);

    const thread = popover.locator('[data-comment-thread="ownership"]');

    await expect(thread).toBeVisible();
    await expect(thread.locator('[data-comment-excerpt]')).toContainText(
      'paragraph has two overlapping'
    );
    const firstMessage = thread.locator('[data-comment-message]').first();
    const more = firstMessage.getByRole('button', {
      name: 'More comment actions',
    });

    await page.mouse.move(0, 0);
    await expect
      .poll(() =>
        more.evaluate((button) =>
          button.parentElement
            ? getComputedStyle(button.parentElement).opacity
            : null
        )
      )
      .toBe('0');
    await firstMessage.hover();
    await expect
      .poll(() =>
        more.evaluate((button) =>
          button.parentElement
            ? getComputedStyle(button.parentElement).opacity
            : null
        )
      )
      .toBe('1');

    expect(
      await Promise.all([
        popover.evaluate((element) => {
          const style = getComputedStyle(element);

          return {
            padding: style.padding,
            width: Math.round(element.getBoundingClientRect().width),
          };
        }),
        trigger.evaluate((element) => {
          const style = getComputedStyle(element);

          return {
            height: Math.round(element.getBoundingClientRect().height),
            paddingLeft: style.paddingLeft,
            paddingRight: style.paddingRight,
          };
        }),
        thread.evaluate((element) => {
          const style = getComputedStyle(element);

          return {
            borderRadius: style.borderRadius,
            borderWidth: style.borderWidth,
          };
        }),
        thread
          .locator('[data-slot="avatar"]')
          .first()
          .evaluate((element) => {
            const rect = element.getBoundingClientRect();

            return {
              height: Math.round(rect.height),
              width: Math.round(rect.width),
            };
          }),
      ])
    ).toEqual([
      { padding: '0px', width: 380 },
      { height: 24, paddingLeft: '6px', paddingRight: '6px' },
      { borderRadius: '0px', borderWidth: '0px' },
      { height: 20, width: 20 },
    ]);
    await expect(popover.locator('[data-discussion-separator]')).toHaveCount(1);

    await page.setViewportSize({ height: 900, width: 1280 });
    await page.goto('/view/editor-ai', { waitUntil: 'commit' });
    const aiEditor = page.locator('[data-plite-editor="true"]').first();
    const aiPopover = page.locator('[data-discussion-popover]');
    const aiTrigger = aiEditor.locator('[data-discussion-block-trigger]');

    await expect(aiEditor).toBeVisible({ timeout: 20_000 });
    await expect(
      aiEditor.locator('[data-comment-id="discussion1"]')
    ).toHaveText(['comments', ' on many text segments']);
    await aiTrigger.click();
    await expect(aiPopover).toBeVisible();

    const reviews = aiPopover.locator('[data-suggestion-review]');

    await expect(reviews).toHaveCount(3);
    await expect(reviews.first()).toContainText('01/01/2024');
    await expect(aiPopover.locator('[data-discussion-separator]')).toHaveCount(
      4
    );
    await expect(aiPopover).toHaveCSS('gap', '0px');
    expect(
      await reviews.evaluateAll((elements) =>
        elements.map((element) => {
          const item = element.parentElement;
          const composer = element.querySelector('form');
          const separator = item?.nextElementSibling;
          const surface = element.closest('[data-discussion-popover]');
          const separatorColor = separator
            ? getComputedStyle(separator).backgroundColor
            : '';
          const surfaceColor = surface
            ? getComputedStyle(surface).backgroundColor
            : '';

          return {
            composerHeight: Math.round(
              composer?.getBoundingClientRect().height ?? 0
            ),
            rowHeight: Math.round(item?.getBoundingClientRect().height ?? 0),
            separatorContrastsSurface: separatorColor !== surfaceColor,
            separatorHeight: Math.round(
              separator?.getBoundingClientRect().height ?? 0
            ),
          };
        })
      )
    ).toEqual([
      {
        composerHeight: 31,
        rowHeight: 123,
        separatorContrastsSurface: true,
        separatorHeight: 1,
      },
      {
        composerHeight: 31,
        rowHeight: 123,
        separatorContrastsSurface: true,
        separatorHeight: 1,
      },
      {
        composerHeight: 31,
        rowHeight: 123,
        separatorContrastsSurface: true,
        separatorHeight: 1,
      },
    ]);
    const firstDiscussion = aiPopover.locator(
      '[data-comment-thread="discussion1"]'
    );

    await expect(firstDiscussion).toContainText(
      'Agreed! The link to the docs makes it easy to learn more.'
    );
    await expect(
      firstDiscussion.locator('[data-comment-message]').first()
    ).toContainText('10m');
    await expect(
      firstDiscussion.locator('[data-comment-message]').nth(1)
    ).toContainText('8m');
    await expect(firstDiscussion.locator('[data-comment-excerpt]')).toHaveText(
      'comments'
    );
    await expect(
      aiPopover.locator('[data-comment-thread="discussion2"]')
    ).toContainText(
      'This helps users understand how powerful the editor can be.'
    );

    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('comments support block-caret creation, rich bodies, actions, and outside close', async ({
  page,
}, testInfo) => {
  expect(testInfo.retry).toBe(0);
  const runtimeErrors = recordPliteBrowserRuntimeErrors(page);

  try {
    await openDemo(page);
    const { editor, popover, primary, staticView } = getDemo(page);
    const firstBlock = editor.locator('[data-plite-node="element"]').first();

    await physicallyPlaceCaret(page, firstBlock, 2);
    await editor.press(commentHotkey);

    const composer = popover.getByRole('textbox', { name: 'New comment' });

    await expect(composer).toBeFocused();
    await composer.fill('Rich block comment');
    await composer.press(selectAll);
    await composer.press(bold);
    await submitComposer(composer);

    const thread = popover
      .locator('[data-comment-thread]')
      .filter({ hasText: 'Rich block comment' });

    await expect(thread).toBeVisible();
    await expect(thread.locator('strong')).toContainText('Rich block comment');
    const threadId = await thread.getAttribute('data-comment-thread');

    expect(threadId).not.toBeNull();
    await expect
      .poll(() =>
        primary
          .locator(`[data-comment-id="${threadId}"]`)
          .evaluateAll((elements) =>
            elements.map((element) => element.textContent).join('')
          )
      )
      .toBe(FIRST_BLOCK);

    const reply = thread.getByRole('textbox', { name: 'Reply to thread' });

    await reply.fill('Review reply');
    await reply.press(submit);
    await expect(thread.getByText('Review reply')).toBeVisible();

    const replyMessage = thread.locator('[data-comment-message]').last();

    await replyMessage.hover();
    await replyMessage
      .getByRole('button', { name: 'More comment actions' })
      .click();
    await page.getByRole('menuitem', { name: 'Edit comment' }).click();
    const edit = thread.getByRole('textbox', { name: 'Edit comment' });

    await edit.fill('Review reply edited');
    await submitComposer(edit);
    await expect(thread.getByText('Review reply edited')).toBeVisible();
    await replyMessage.hover();
    await replyMessage
      .getByRole('button', { name: 'More comment actions' })
      .click();
    await page.getByRole('menuitem', { name: 'Delete comment' }).click();
    await expect(thread.getByText('Review reply edited')).toHaveCount(0);
    await thread.locator('[data-comment-message]').first().hover();
    await thread.getByRole('button', { name: 'Resolve thread' }).click();
    await expect(thread).toHaveCount(0);
    await expect(
      primary.locator(`[data-comment-id="${threadId}"]`)
    ).toHaveCount(0);

    const markCountBeforeDraft = await primary
      .locator('[data-comment-id]')
      .count();

    await physicallyPlaceCaret(page, firstBlock, 3);
    await editor.press(commentHotkey);
    await expect(
      popover.getByRole('textbox', { name: 'New comment' })
    ).toBeFocused();
    await staticView.click();
    await expect(popover).toHaveCount(0);
    await expect(primary.locator('[data-comment-id]')).toHaveCount(
      markCountBeforeDraft
    );
    await expect
      .poll(() =>
        page.evaluate(() =>
          document.activeElement
            ?.closest('[data-comment-editor]')
            ?.getAttribute('data-comment-editor')
        )
      )
      .toBe('primary');

    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

for (const width of [1280, 390]) {
  test(`comment Enter submits once while Shift+Enter keeps a line break (${width}px)`, async ({
    page,
  }, testInfo) => {
    expect(testInfo.retry).toBe(0);
    await page.setViewportSize({ width, height: 800 });
    const runtimeErrors = recordPliteBrowserRuntimeErrors(page);
    try {
      await openDemo(page);
      const { editor, popover } = getDemo(page);
      await editor
        .getByRole('button', { name: 'Open 2 discussion items for this block' })
        .first()
        .click();
      const thread = popover.locator('[data-comment-thread]').first();
      const composer = thread.getByRole('textbox', { name: 'Reply to thread' });
      const messages = thread.locator('[data-comment-message]');
      const messageCount = await messages.count();
      await composer.click();
      await composer.press('Enter');
      await expect(composer.locator('[data-plite-node="element"]')).toHaveCount(
        1
      );
      await expect(messages).toHaveCount(messageCount);

      await composer.pressSequentially('First line');
      await composer.press('Shift+Enter');
      await composer.pressSequentially('Second line');
      await expect(composer).toContainText('First line\nSecond line');
      await expect(messages).toHaveCount(messageCount);
      await composer.press('Enter');
      await expect(messages).toHaveCount(messageCount + 1);
      await expect(messages.last()).toContainText('First line');
      await expect(messages.last()).toContainText('Second line');
      await expect(composer).not.toContainText('First line');
      await expect(composer).not.toContainText('Second line');
      await expect(composer.locator('[data-plite-node="element"]')).toHaveCount(
        1
      );
      await composer.pressSequentially('Follow-up draft');
      await expect(composer).toContainText('Follow-up draft');
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });
}

test('suggestion cards keep document mutation and attached comments together', async ({
  page,
}, testInfo) => {
  expect(testInfo.retry).toBe(0);
  const runtimeErrors = recordPliteBrowserRuntimeErrors(page);

  try {
    await openDemo(page);
    const { editor, popover, primary } = getDemo(page);

    await editor.getByText('tighten the wording', { exact: true }).click();
    await expect(popover).toBeVisible();

    const suggestionReview = popover.locator(
      '[data-suggestion-review="tighten"]'
    );

    await expect(suggestionReview).toBeVisible();
    await expect(
      suggestionReview.locator('[data-comment-thread="suggestion-thread"]')
    ).toBeVisible();
    await expect(suggestionReview.locator('strong')).toContainText('clearer');

    const suggestion = popover.locator('[data-suggestion-review="tighten"]');
    const suggestionComment = suggestion.getByRole('textbox', {
      name: 'Comment on suggestion',
    });

    await suggestionComment.fill('Keep this suggestion focused');
    await submitComposer(suggestionComment);
    const attachedThread = suggestion
      .locator('[data-comment-thread]')
      .filter({ hasText: 'Keep this suggestion focused' });

    await expect(attachedThread).toBeVisible();
    const attachedId = await attachedThread.getAttribute('data-comment-thread');

    expect(attachedId).not.toBeNull();
    await suggestion.hover();
    await suggestion.getByRole('button', { name: 'Accept suggestion' }).click();
    await expect(editor).toBeFocused();
    await expect(suggestion).toHaveCount(0);
    await expect(editor.getByRole('insertion')).toHaveCount(0);
    await expect(editor).toContainText('tighten the wording');
    await expect(
      primary.locator('[data-comment-id="suggestion-thread"]')
    ).toHaveCount(0);
    await expect(
      primary.locator(`[data-comment-id="${attachedId}"]`)
    ).toHaveCount(0);

    await editor.press(undo);
    await expect(editor.getByRole('insertion')).toContainText(
      'tighten the wording'
    );
    await editor.getByText('tighten the wording', { exact: true }).click();
    await expect(
      suggestion.locator('[data-comment-thread="suggestion-thread"]')
    ).toBeVisible();
    await expect(suggestion.locator('strong')).toContainText('clearer');
    await expect(attachedThread).toBeVisible();

    await editor.press(redo);
    await expect(suggestion).toHaveCount(0);
    await expect(editor.getByRole('insertion')).toHaveCount(0);

    await editor
      .getByText('keep this redundant phrase', { exact: true })
      .click();
    const removal = popover.locator('[data-suggestion-review="remove"]');

    const removalComment = removal.getByRole('textbox', {
      name: 'Comment on suggestion',
    });
    await removalComment.fill('Keep the removal context');
    await submitComposer(removalComment);

    await removal.hover();
    await removal.getByRole('button', { name: 'Reject suggestion' }).click();
    await expect(editor).toBeFocused();
    await expect(removal).toHaveCount(0);
    await expect(editor.getByRole('deletion')).toHaveCount(0);
    await expect(editor).toContainText('keep this redundant phrase');

    await editor.press(undo);
    await expect(editor.getByRole('deletion')).toContainText(
      'keep this redundant phrase'
    );
    await editor
      .getByText('keep this redundant phrase', { exact: true })
      .click();
    await expect(removal).toBeVisible();
    await expect(removal).toContainText('Keep the removal context');
    await editor.press(redo);
    await expect(removal).toHaveCount(0);
    await expect(editor.getByRole('deletion')).toHaveCount(0);

    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('comment paint, independent snapshots, invalid loading, and metadata updates stay bounded', async ({
  page,
}, testInfo) => {
  expect(testInfo.retry).toBe(0);
  const runtimeErrors = recordPliteBrowserRuntimeErrors(page);

  try {
    await installPliteReactRenderProfiler(page);
    await openDemo(page);
    const { popover, primary, reviewer, staticView } = getDemo(page);
    const primaryMarks = primary.locator('[data-comment-id]');
    const reviewerMarks = reviewer.locator('[data-comment-id]');
    const staticMarks = staticView.locator('[data-comment-id]');

    await expect(primaryMarks).toHaveCount(4);
    await expect(reviewerMarks).toHaveCount(4);
    await expect(staticMarks).toHaveCount(4);

    const singleMark = primary
      .locator('[data-comment-id="ownership"]:not(:has([data-comment-id]))')
      .first();
    const nestedMark = primary
      .locator('[data-comment-id] [data-comment-id]')
      .first();
    const staticSingle = staticView
      .locator('[data-comment-id="ownership"]:not(:has([data-comment-id]))')
      .first();
    const staticNested = staticView
      .locator('[data-comment-id] [data-comment-id]')
      .first();
    const basePaint = await getPaint(singleMark);

    expect(await getPaint(nestedMark)).not.toEqual(basePaint);
    expect(await getPaint(staticNested)).not.toEqual(
      await getPaint(staticSingle)
    );
    await singleMark.hover();
    await expect.poll(() => getPaint(singleMark)).not.toEqual(basePaint);

    await clickCommentHighlight(
      page,
      primary.locator('[data-comment-id="overlap"]').first()
    );
    await page.mouse.move(0, 0);
    await expect.poll(() => getPaint(singleMark)).not.toEqual(basePaint);

    await page.getByRole('button', { name: 'Load invalid comments' }).click();
    await expect(
      page.getByText(/Invalid comment records rejected/)
    ).toBeVisible();
    await expect(primaryMarks).toHaveCount(4);
    await expect(reviewerMarks).toHaveCount(4);
    await expect(staticMarks).toHaveCount(4);
    await page.getByRole('button', { name: 'Reload valid comments' }).click();
    await expect(
      page.getByText('Comment records loaded', { exact: true })
    ).toBeVisible();
    await expect(primaryMarks).toHaveCount(4);

    await clickCommentHighlight(
      page,
      primary.locator('[data-comment-id="overlap"]').first()
    );
    const overlapThread = popover.locator('[data-comment-thread="overlap"]');
    const reply = overlapThread.getByRole('textbox', {
      name: 'Reply to thread',
    });

    await page.evaluate(() => {
      const target = window as typeof window & {
        __commentPrimaryTextNodes?: Element[];
      };
      const root = document.querySelector(
        '[data-comment-editor="primary"] [data-plite-root="main"]'
      );

      target.__commentPrimaryTextNodes = root
        ? [...root.querySelectorAll('[data-plite-node="text"]')]
        : [];
    });
    await reply.fill('App-only update');
    await resetPliteReactRenderProfiler(page);
    await reply.press(submit);
    await expect(overlapThread.getByText('App-only update')).toBeVisible();

    const renderSnapshot = await getPliteReactRenderProfilerSnapshot(page);

    expect(renderSnapshot.byKind.editable ?? 0).toBeLessThanOrEqual(6);
    expect(renderSnapshot.byKind['root-plan'] ?? 0).toBeLessThanOrEqual(8);
    expect(renderSnapshot.byKind.text ?? 0).toBe(0);
    expect(renderSnapshot.total).toBeLessThanOrEqual(14);
    expect(
      await page.evaluate(() => {
        const target = window as typeof window & {
          __commentPrimaryTextNodes?: Element[];
        };
        const root = document.querySelector(
          '[data-comment-editor="primary"] [data-plite-root="main"]'
        );
        const current = root
          ? [...root.querySelectorAll('[data-plite-node="text"]')]
          : [];

        return (
          current.length === target.__commentPrimaryTextNodes?.length &&
          current.every(
            (element, index) =>
              element === target.__commentPrimaryTextNodes?.[index]
          )
        );
      })
    ).toBe(true);

    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

const triggerAiComment = async (page: Page, target: Locator) => {
  await selectCharacterWithKeyboard(page, target, 0);
  await page.keyboard.press(aiHotkey);
  await page.getByRole('option', { exact: true, name: 'Comment' }).click();
  await expect(page.locator('[data-ai-comment-review]')).toBeVisible({
    timeout: 15_000,
  });
};

test('AI comments stay provisional until Accept and disappear on Reject', async ({
  page,
}, testInfo) => {
  expect(testInfo.retry).toBe(0);
  const runtimeErrors = recordPliteBrowserRuntimeErrors(page);

  try {
    await openDemo(page);
    const { editor, popover, primary, staticView } = getDemo(page);
    const blocks = editor.locator('[data-plite-node="element"]');
    const documentText = await editor.innerText();

    await triggerAiComment(page, blocks.nth(1));
    const firstDraft = popover.locator(
      '[data-comment-thread][data-status="draft"]'
    );

    await expect(firstDraft).toHaveCount(1);
    await expect(firstDraft).toContainText('AI draft');
    const acceptedId = await firstDraft.getAttribute('data-comment-thread');

    expect(acceptedId).not.toBeNull();
    await page
      .locator('[data-ai-comment-review]')
      .getByRole('button', { name: 'Accept' })
      .click();
    await expect(firstDraft).toHaveCount(0);
    await expect(
      popover.locator(
        `[data-comment-thread="${acceptedId}"][data-status="published"]`
      )
    ).toBeVisible();
    await staticView.click();
    await expect(popover).toHaveCount(0);

    await triggerAiComment(page, blocks.nth(0));
    const rejectedDraft = popover.locator(
      '[data-comment-thread][data-status="draft"]'
    );

    await expect(rejectedDraft).toHaveCount(1);
    const rejectedId = await rejectedDraft.getAttribute('data-comment-thread');

    expect(rejectedId).not.toBeNull();
    await page
      .locator('[data-ai-comment-review]')
      .getByRole('button', { name: 'Reject' })
      .click();
    await expect(rejectedDraft).toHaveCount(0);
    await expect(
      primary.locator(`[data-comment-id="${rejectedId}"]`)
    ).toHaveCount(0);
    expect(await editor.innerText()).toBe(documentText);

    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('AI editor keeps its toolbar above the full-width editor', async ({
  page,
}, testInfo) => {
  expect(testInfo.retry).toBe(0);
  const runtimeErrors = recordPliteBrowserRuntimeErrors(page);

  try {
    await page.goto('/view/editor-ai', { waitUntil: 'commit' });

    const editor = page.locator(EDITOR).first();
    const toolbar = page.getByRole('toolbar').first();

    await expect(
      page.getByRole('button', {
        name: 'Open 5 discussion items for this block',
      })
    ).toBeVisible({ timeout: 20_000 });
    await expect(editor).toBeVisible({ timeout: 20_000 });
    const [containerBox, editorBox, toolbarBox] = await Promise.all([
      toolbar.locator('..').boundingBox(),
      editor.boundingBox(),
      toolbar.boundingBox(),
    ]);

    expect(containerBox).not.toBeNull();
    expect(editorBox).not.toBeNull();
    expect(toolbarBox).not.toBeNull();

    expect(toolbarBox!.height).toBeLessThan(96);
    expect(
      Math.abs(toolbarBox!.width - containerBox!.width)
    ).toBeLessThanOrEqual(1);
    expect(editorBox!.y).toBeGreaterThanOrEqual(
      toolbarBox!.y + toolbarBox!.height - 1
    );
    expect(
      Math.abs(editorBox!.width - containerBox!.width)
    ).toBeLessThanOrEqual(1);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth)
    ).toBeLessThanOrEqual(
      await page.evaluate(() => document.documentElement.clientWidth)
    );

    const firstElement = editor.locator('[data-plite-node="element"]').first();

    await selectCharacterWithKeyboard(page, firstElement, 0);
    const askAI = page.getByRole('button', { name: 'Ask AI' });

    await expect(askAI).toBeVisible();
    await askAI.click();
    await expect(page.getByPlaceholder('Ask AI anything...')).toBeVisible();
    await page.keyboard.type('Focus follow-up');
    await expect(page.getByPlaceholder('Ask AI anything...')).toHaveValue(
      'Focus follow-up'
    );

    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('AI editor keeps Floating Discussion usable on narrow screens', async ({
  page,
}, testInfo) => {
  expect(testInfo.retry).toBe(0);
  const runtimeErrors = recordPliteBrowserRuntimeErrors(page);

  try {
    await page.setViewportSize({ height: 844, width: 390 });
    await page.goto('/view/editor-ai', { waitUntil: 'commit' });

    const editor = page.locator(EDITOR).first();

    await expect(editor).toBeVisible();
    const overlappingComment = editor
      .locator('[data-comment-id="discussion2"]')
      .first();

    await expect(overlappingComment).toBeVisible();
    await clickCommentHighlight(page, overlappingComment);
    await expect(page.locator('[data-discussion-popover]')).toBeVisible();

    const editorBox = await editor.boundingBox();

    expect(editorBox).not.toBeNull();
    expect(editorBox!.width).toBeGreaterThanOrEqual(380);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth)
    ).toBeLessThanOrEqual(
      await page.evaluate(() => document.documentElement.clientWidth)
    );

    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('Plate-to-HTML keeps suggestion review markup', async ({
  page,
}, testInfo) => {
  expect(testInfo.retry).toBe(0);
  const runtimeErrors = recordPliteBrowserRuntimeErrors(page);

  try {
    await page.goto('/blocks/plate-to-html', { waitUntil: 'commit' });

    const preview = page.frameLocator('iframe[title="Preview"]');

    await expect(preview.locator('ins')).toContainText('tighten the wording', {
      timeout: 20_000,
    });
    await expect(preview.locator('del')).toContainText(
      'keep this redundant phrase'
    );

    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('English and Chinese Comment, Suggestion, and Discussion routes render', async ({
  page,
}, testInfo) => {
  test.setTimeout(90_000);
  expect(testInfo.retry).toBe(0);
  const runtimeErrors = recordPliteBrowserRuntimeErrors(page);
  const routes = [
    ['/docs/comment', 'Comments'],
    ['/docs/discussion', 'Discussion'],
    ['/docs/suggestion', 'Suggestion'],
    ['/cn/docs/comment', '评论'],
    ['/cn/docs/discussion', '讨论'],
    ['/cn/docs/suggestion', '建议'],
  ] as const;

  try {
    for (const [route, heading] of routes) {
      await page.goto(route, { waitUntil: 'commit' });
      await expect(
        page.getByRole('heading', { exact: true, level: 1, name: heading })
      ).toBeVisible({ timeout: 20_000 });
    }

    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('independent reviewer and static documents keep their own native comment ranges after primary edits', async ({
  page,
}, testInfo) => {
  expect(testInfo.retry).toBe(0);
  const runtimeErrors = recordPliteBrowserRuntimeErrors(page);
  try {
    await openDemo(page);
    const { editor, primary, reviewer, staticView } = getDemo(page);
    const highlighted = (view: Locator) =>
      view.locator('[data-comment-id="ownership"]').allTextContents();
    const before = await Promise.all([
      highlighted(primary),
      highlighted(reviewer),
      highlighted(staticView),
    ]);
    await physicallySelectText(page, editor, 0, 1);
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.type('XXXX ');
    await expect(editor).toContainText(`XXXX ${FIRST_BLOCK}`);
    await expect.poll(() => highlighted(primary)).toEqual(before[0]);
    await expect.poll(() => highlighted(reviewer)).toEqual(before[1]);
    await expect.poll(() => highlighted(staticView)).toEqual(before[2]);
    await expect(reviewer).not.toContainText('XXXX');
    await expect(staticView).not.toContainText('XXXX');
    await page.keyboard.press(undo);
    await expect.poll(() => highlighted(primary)).toEqual(before[0]);
    await expect.poll(() => highlighted(reviewer)).toEqual(before[1]);
    await expect(editor).toBeFocused();
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});
