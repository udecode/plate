import {
  BROWSER_HANDLE_KEY,
  createBrowserEditorHarness,
  expect,
  recordBrowserRuntimeErrors,
  test,
} from '@platejs/test/playwright';
import type { Locator, Page } from '@playwright/test';

const openViews = async (page: Page) => {
  await page.goto('/blocks/find-demo', { waitUntil: 'commit' });
  const first = page.getByRole('textbox', { name: 'First editor' });
  await createBrowserEditorHarness(page, 'view-carets', first).ready({
    editor: 'visible',
  });
  await page.getByRole('button', { name: 'Show second view' }).click();
  const second = page.getByRole('textbox', { name: 'Second editor' });
  await expect(second).toBeVisible();

  return { first, second };
};

const pointAt = (editor: Locator, text: string, offset: number) =>
  editor.evaluate(
    (root, [needle, at]) => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const node = walker.currentNode as Text;
        const start = node.data.indexOf(needle);
        if (start === -1) continue;
        node.parentElement!.scrollIntoView({ block: 'center' });
        const range = document.createRange();
        range.setStart(node, start + at);
        range.setEnd(node, start + at + 1);
        const rect = range.getBoundingClientRect();
        return { x: rect.left + rect.width / 4, y: rect.top + rect.height / 2 };
      }
      throw new Error(`No text node holds "${needle}"`);
    },
    [text, offset] as const
  );

const clickText = async (
  page: Page,
  editor: Locator,
  text: string,
  offset: number
) => {
  const point = await pointAt(editor, text, offset);
  await page.mouse.click(point.x, point.y);
};

const pressText = async (
  page: Page,
  editor: Locator,
  text: string,
  offset: number
) => {
  const point = await pointAt(editor, text, offset);
  await page.mouse.move(point.x, point.y);
  await page.mouse.down();
};

type ViewStep =
  | {
      focus?: number;
      kind: 'place';
      offset: number;
      skipDOMSelection?: boolean;
    }
  | { kind: 'insert-text'; offset: number; text: string }
  | { kind: 'insert-block'; text: string };

// The browser handle places a caret only by focusing its view. A placement
// that leaves the other view focused runs through the view editor the page's
// own code gets from `useRootEditor`, found above the Editable in React's tree.
// Returns the page time just before the update, or runs it in the page's own
// mouseup handler with `atMouseUp`.
const runInView = (
  page: Page,
  label: string,
  step: ViewStep,
  { atMouseUp = false } = {}
) =>
  page.evaluate(
    ([name, action, deferred]) => {
      type Point = { offset: number; path: number[] };
      type Tx = {
        nodes: { insert: (node: unknown, options: { at: number[] }) => void };
        selection: {
          set: (target: Point | { anchor: Point; focus: Point }) => void;
        };
        text: { insert: (text: string, options: { at: Point }) => void };
      };
      type ViewEditor = {
        update: {
          (edit: (tx: Tx) => void): void;
          (policy: { tags: string }, edit: (tx: Tx) => void): void;
        };
      };
      type Fiber = {
        memoizedProps?: {
          value?: { getMountedViewEditor?: (root: string) => ViewEditor };
        };
        return: Fiber | null;
      };
      const root = document.querySelector(`[aria-label="${name}"]`)!;
      const key = Object.keys(root).find((prop) =>
        prop.startsWith('__reactFiber$')
      )!;
      let fiber = (root as unknown as Record<string, Fiber | null>)[key];
      while (fiber && !fiber.memoizedProps?.value?.getMountedViewEditor) {
        fiber = fiber.return;
      }
      const view = fiber?.memoizedProps?.value?.getMountedViewEditor?.('main');
      if (!view) throw new Error(`No view editor above ${name}`);
      const edit = (tx: Tx) => {
        if (action.kind === 'place') {
          const anchor = { path: [0, 0], offset: action.offset };
          tx.selection.set(
            action.focus === undefined
              ? anchor
              : { anchor, focus: { path: [0, 0], offset: action.focus } }
          );
        } else if (action.kind === 'insert-text') {
          tx.text.insert(action.text, {
            at: { path: [0, 0], offset: action.offset },
          });
        } else {
          tx.nodes.insert(
            { children: [{ text: action.text }], type: 'paragraph' },
            { at: [0] }
          );
        }
      };
      const run = () => {
        if (action.kind === 'place' && action.skipDOMSelection) {
          view.update({ tags: 'skip-dom-selection' }, edit);
        } else {
          view.update(edit);
        }
      };
      const at = performance.now();
      if (deferred) {
        window.addEventListener('mouseup', run, { once: true });
      } else {
        run();
      }
      return at;
    },
    [label, step, atMouseUp] as const
  );

// The offset of the caret the editor itself acts on, whichever view holds it.
// Two views can show the same DOM caret while different views hold it.
const readLiveCaret = (page: Page, label: string) =>
  page.evaluate((name) => {
    type Runtime = {
      read: <T>(
        reader: (state: {
          selection: () => { anchor: { offset: number } } | null;
        }) => T
      ) => T;
    };
    type Fiber = {
      memoizedProps?: { value?: { runtime?: Runtime } };
      return: Fiber | null;
    };
    const root = document.querySelector(`[aria-label="${name}"]`)!;
    const key = Object.keys(root).find((prop) =>
      prop.startsWith('__reactFiber$')
    )!;
    let fiber = (root as unknown as Record<string, Fiber | null>)[key];
    while (fiber && !fiber.memoizedProps?.value?.runtime) fiber = fiber.return;
    const runtime = fiber?.memoizedProps?.value?.runtime;
    if (!runtime) throw new Error(`No editor runtime above ${name}`);

    return runtime.read((state) => state.selection()?.anchor.offset ?? null);
  }, label);

// Opens a new 100 ms window of Plite's throttled import, so the next
// selection event waits for its trailing import.
const queueSelectionImport = (page: Page) =>
  page.evaluate(() => {
    document.dispatchEvent(new Event('selectionchange'));
  });

// The frame first lets the browser deliver a selectionchange it has already
// queued.
const waitForSelectionImports = async (page: Page) => {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      })
  );
  await expect
    .poll(() =>
      page.evaluate(
        (key) =>
          Array.from(
            document.querySelectorAll('[contenteditable="true"]'),
            (element) =>
              (
                element as unknown as Record<
                  string,
                  | {
                      getInputState: () => {
                        pendingDOMSelectionImport: boolean;
                      };
                    }
                  | undefined
                >
              )[key]?.getInputState().pendingDOMSelectionImport
          ).some(Boolean),
        BROWSER_HANDLE_KEY
      )
    )
    .toBe(false);
};

const pressKeys = async (page: Page, keys: string) => {
  for (const key of keys) await page.keyboard.press(key);
};

const readCaret = (page: Page) =>
  page.evaluate(() => {
    const selection = window.getSelection();
    const anchor = selection?.anchorNode;
    if (!selection || !anchor) return null;
    const element =
      anchor.nodeType === Node.ELEMENT_NODE
        ? (anchor as Element)
        : anchor.parentElement!;
    const editable = element.closest('[contenteditable="true"]');
    const block = element.closest('[data-editor-node="element"]')!;
    const offsetOf = (node: Node, offset: number) => {
      const range = document.createRange();
      range.setStart(block, 0);
      range.setEnd(node, offset);
      return range.toString().length;
    };

    return {
      editor: editable?.getAttribute('aria-label'),
      focused: !!editable && document.activeElement === editable,
      text: block.textContent,
      anchor: offsetOf(anchor, selection.anchorOffset),
      focus: offsetOf(selection.focusNode!, selection.focusOffset),
    };
  });

const caretAt = (editor: string, text: unknown, offset: number) => ({
  editor,
  focused: true,
  text,
  anchor: offset,
  focus: offset,
});

test('Tab restores a view caret moved by the other view typing before it', async ({
  page,
}) => {
  const errors = recordBrowserRuntimeErrors(page);

  try {
    const { first, second } = await openViews(page);
    await clickText(page, first, 'This is editable', 8);
    await expect
      .poll(() => readCaret(page))
      .toMatchObject(caretAt('First editor', expect.any(String), 8));
    await clickText(page, second, 'This is editable', 0);
    await expect
      .poll(() => readCaret(page))
      .toMatchObject(caretAt('Second editor', expect.any(String), 0));
    await pressKeys(page, 'XY');
    await expect(second).toContainText('XYThis is editable');
    await page.getByRole('textbox', { name: 'Font size' }).first().focus();
    await page.keyboard.press('Tab');
    await expect
      .poll(() => readCaret(page))
      .toMatchObject(
        caretAt(
          'First editor',
          expect.stringMatching(/^XYThis is editable/),
          10
        )
      );
    await page.keyboard.press('Z');
    await expect
      .poll(() => readCaret(page))
      .toMatchObject(
        caretAt(
          'First editor',
          expect.stringMatching(/^XYThis is Zeditable/),
          11
        )
      );
    errors.assertNone();
  } finally {
    errors.stop();
  }
});

test('collapsing a section in one view keeps the other view caret in its body', async ({
  page,
}) => {
  const errors = recordBrowserRuntimeErrors(page);

  try {
    const { first, second } = await openViews(page);
    await clickText(page, first, 'move between matches.', 0);
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    await pressKeys(page, '/det');
    const option = page.getByRole('option', { name: 'Details', exact: true });
    await expect(option).toBeVisible();
    await page.keyboard.press('Enter');
    await expect(option).toBeHidden();
    await pressKeys(page, 'Tit');
    await page.keyboard.press('Enter');
    await pressKeys(page, 'Bod');
    await expect
      .poll(() => readCaret(page))
      .toMatchObject(caretAt('First editor', 'Bod', 3));

    const secondView = page.getByRole('region', { name: 'Second view' });
    const expand = secondView.getByRole('button', { name: 'Expand details' });
    await expect(expand).toBeVisible();
    await expand.click();
    await expect(
      secondView.getByRole('button', { name: 'Collapse details' })
    ).toBeVisible();
    await clickText(page, second, 'Bod', 2);
    await expect
      .poll(() => readCaret(page))
      .toMatchObject(caretAt('Second editor', 'Bod', 2));

    await page
      .getByRole('region', { name: 'First view' })
      .getByRole('button', { name: 'Collapse details' })
      .click();
    await expect
      .poll(() => readCaret(page))
      .toMatchObject(caretAt('Second editor', 'Bod', 2));
    await page.keyboard.press('Z');
    await expect
      .poll(() => readCaret(page))
      .toMatchObject(caretAt('Second editor', 'BoZd', 3));
    errors.assertNone();
  } finally {
    errors.stop();
  }
});

const EDITABLE = 'This is editable';

const expectCaret = (
  page: Page,
  editor: string,
  text: string | RegExp,
  offset: number
) =>
  expect
    .poll(() => readCaret(page))
    .toMatchObject(
      caretAt(
        editor,
        typeof text === 'string' ? text : expect.stringMatching(text),
        offset
      )
    );

test('a plain click in the view that does not hold the caret claims it there', async ({
  page,
}) => {
  const errors = recordBrowserRuntimeErrors(page);

  try {
    const { first, second } = await openViews(page);
    await clickText(page, first, EDITABLE, 8);
    await expectCaret(page, 'First editor', /^This is editable/, 8);
    await clickText(page, second, EDITABLE, 5);
    await expectCaret(page, 'Second editor', /^This is editable/, 5);
    await page.keyboard.press('Z');
    await expectCaret(page, 'Second editor', /^This Zis editable/, 6);
    errors.assertNone();
  } finally {
    errors.stop();
  }
});

test("echoes of another view's export into the focused view claim nothing", async ({
  page,
}) => {
  const errors = recordBrowserRuntimeErrors(page);

  try {
    const { second } = await openViews(page);
    await clickText(page, second, EDITABLE, 12);
    await expectCaret(page, 'Second editor', /^This is editable/, 12);
    await runInView(page, 'First editor', { kind: 'place', offset: 3 });
    await expectCaret(page, 'Second editor', /^This is editable/, 12);
    for (let echo = 0; echo < 3; echo += 1) {
      await queueSelectionImport(page);
      await waitForSelectionImports(page);
    }
    await expectCaret(page, 'Second editor', /^This is editable/, 12);
    expect(await readLiveCaret(page, 'Second editor')).toBe(3);
    await page.keyboard.press('Z');
    await expectCaret(page, 'Second editor', /^This is editZable/, 13);
    errors.assertNone();
  } finally {
    errors.stop();
  }
});

test("a press whose selection another view's text insert moves before its import does not claim the moved caret", async ({
  page,
}) => {
  const errors = recordBrowserRuntimeErrors(page);

  try {
    const { second } = await openViews(page);
    await clickText(page, second, EDITABLE, 12);
    await expectCaret(page, 'Second editor', /^This is editable/, 12);
    await runInView(page, 'First editor', { kind: 'place', offset: 1 });
    await waitForSelectionImports(page);
    await page.evaluate(() => {
      const events: Array<{
        anchor?: number | null;
        at: number;
        kind: string;
      }> = [];
      const anchorOffset = () => {
        const selection = window.getSelection();
        const anchor = selection?.anchorNode;
        if (!selection || !anchor) return null;
        const element =
          anchor.nodeType === Node.ELEMENT_NODE
            ? (anchor as Element)
            : anchor.parentElement!;
        const block = element.closest('[data-editor-node="element"]');
        if (!block) return null;
        const range = document.createRange();
        range.setStart(block, 0);
        range.setEnd(anchor, selection.anchorOffset);
        return range.toString().length;
      };
      new MutationObserver(() =>
        events.push({ at: performance.now(), kind: 'mutation' })
      ).observe(document.querySelector('[aria-label="Second editor"]')!, {
        characterData: true,
        childList: true,
        subtree: true,
      });
      document.addEventListener('selectionchange', () =>
        events.push({
          anchor: anchorOffset(),
          at: performance.now(),
          kind: 'selectionchange',
        })
      );
      Object.assign(window, { selectionOrder: events });
    });
    const point = await pointAt(second, EDITABLE, 7);
    await page.mouse.move(point.x, point.y);
    await queueSelectionImport(page);
    await page.mouse.down();
    const insertedAt = await runInView(page, 'First editor', {
      kind: 'insert-text',
      offset: 40,
      text: '!',
    });
    const readOrder = () =>
      page.evaluate(
        (since) =>
          (
            window as unknown as {
              selectionOrder: Array<{
                anchor?: number | null;
                at: number;
                kind: string;
              }>;
            }
          ).selectionOrder.filter((event) => event.at >= since),
        insertedAt
      );
    // The press's own selectionchange can arrive in the insert's millisecond,
    // so the order counts from the first one that shows the moved point.
    const findMoved = (order: Awaited<ReturnType<typeof readOrder>>) =>
      order.findIndex(
        (event) => event.kind === 'selectionchange' && event.anchor !== 7
      );
    await expect.poll(async () => findMoved(await readOrder())).not.toBe(-1);
    await waitForSelectionImports(page);
    await page.mouse.up();
    await waitForSelectionImports(page);

    const order = await readOrder();
    const moved = findMoved(order);
    expect({
      event: moved !== -1,
      noteFirst: order
        .slice(0, moved)
        .some((event) => event.kind === 'mutation'),
    }).toEqual({ event: true, noteFirst: true });
    await expectCaret(page, 'Second editor', /^This is editable/, 7);
    await page.keyboard.press('Z');
    await expectCaret(page, 'Second editor', /^This isZ editable/, 8);
    errors.assertNone();
  } finally {
    errors.stop();
  }
});

test('a press on text whose import waits while another view inserts a block before its paragraph keeps the click', async ({
  page,
}) => {
  const errors = recordBrowserRuntimeErrors(page);

  try {
    const { first, second } = await openViews(page);
    await clickText(page, first, EDITABLE, 8);
    await expectCaret(page, 'First editor', /^This is editable/, 8);
    const point = await pointAt(second, EDITABLE, 7);
    await page.mouse.move(point.x, point.y);
    await queueSelectionImport(page);
    await page.mouse.down();
    await runInView(page, 'First editor', {
      kind: 'insert-block',
      text: 'New block',
    });
    await page.mouse.up();
    await waitForSelectionImports(page);
    await expectCaret(page, 'Second editor', /^This is editable/, 7);
    await page.keyboard.press('Z');
    await expectCaret(page, 'Second editor', /^This isZ editable/, 8);
    await expect(second).toContainText('New block');
    errors.assertNone();
  } finally {
    errors.stop();
  }
});

test("a press that claimed keeps its caret, moved by another view's insert before it during the press", async ({
  page,
}) => {
  const errors = recordBrowserRuntimeErrors(page);

  try {
    const { first, second } = await openViews(page);
    await clickText(page, first, EDITABLE, 3);
    await expectCaret(page, 'First editor', /^This is editable/, 3);
    await pressText(page, second, EDITABLE, 7);
    await expectCaret(page, 'Second editor', /^This is editable/, 7);
    await expect.poll(() => readLiveCaret(page, 'Second editor')).toBe(7);
    await runInView(page, 'First editor', {
      kind: 'insert-text',
      offset: 0,
      text: 'xx',
    });
    await expect(second).toContainText('xxThis is editable');
    await waitForSelectionImports(page);
    await page.mouse.up();
    await waitForSelectionImports(page);
    await expectCaret(page, 'Second editor', /^xxThis is editable/, 9);
    await page.keyboard.press('Z');
    await expectCaret(page, 'Second editor', /^xxThis isZ editable/, 10);
    errors.assertNone();
  } finally {
    errors.stop();
  }
});

test("a click inside the view's own selection that another view's placement overtakes types at the click the browser collapses to", async ({
  page,
}) => {
  const errors = recordBrowserRuntimeErrors(page);

  try {
    const { second } = await openViews(page);
    await clickText(page, second, EDITABLE, 2);
    for (let step = 0; step < 7; step += 1) {
      await page.keyboard.press('Shift+ArrowRight');
    }
    await expect
      .poll(() => readCaret(page))
      .toMatchObject({ anchor: 2, editor: 'Second editor', focus: 9 });
    await pressText(page, second, EDITABLE, 5);
    await runInView(page, 'First editor', {
      kind: 'place',
      offset: 1,
      skipDOMSelection: true,
    });
    await page.mouse.up();
    await waitForSelectionImports(page);
    await expectCaret(page, 'Second editor', /^This is editable/, 5);
    expect(await readLiveCaret(page, 'Second editor')).toBe(1);
    await page.keyboard.press('Z');
    await expectCaret(page, 'Second editor', /^This Zis editable/, 6);
    errors.assertNone();
  } finally {
    errors.stop();
  }
});

test("a press on a view's block gutter keeps the caret its mousedown placed after Plite's deferred activation", async ({
  page,
}) => {
  const errors = recordBrowserRuntimeErrors(page);

  try {
    const { first, second } = await openViews(page);
    await clickText(page, second, EDITABLE, 12);
    await expectCaret(page, 'Second editor', /^This is editable/, 12);
    await clickText(page, first, EDITABLE, 8);
    await expectCaret(page, 'First editor', /^This is editable/, 8);
    // Beside a line, the gutter is chrome inside the Editable: its mousedown
    // places the caret at the line's start, and Plite focuses and activates
    // the view a frame later, after the click's release.
    const press = await second.evaluate((root) => {
      const gutter = root.querySelector('.editor-gutterLeft')!;
      gutter.scrollIntoView({ block: 'center' });
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      walker.nextNode();
      const text = walker.currentNode as Text;
      const range = document.createRange();
      const charBox = (offset: number) => {
        range.setStart(text, offset);
        range.setEnd(text, offset + 1);
        return range.getBoundingClientRect();
      };
      const lastChar = charBox(text.length - 1);
      const box = gutter.getBoundingClientRect();
      const point = {
        x: box.left + box.width / 2,
        y: (lastChar.top + lastChar.bottom) / 2,
      };
      if (document.elementFromPoint(point.x, point.y) !== gutter) {
        throw new Error('The gutter is not the target beside its last line');
      }
      let lineStart = text.length - 1;
      while (lineStart > 0 && charBox(lineStart - 1).top === lastChar.top) {
        lineStart -= 1;
      }
      return { ...point, lineStart };
    });
    await page.mouse.click(press.x, press.y);
    await waitForSelectionImports(page);
    await expectCaret(
      page,
      'Second editor',
      /^This is editable/,
      press.lineStart
    );
    await page.keyboard.press('Z');
    await expectCaret(
      page,
      'Second editor',
      /^This is editable/,
      press.lineStart + 1
    );
    const typed = await readCaret(page);
    expect(typed?.text?.[press.lineStart]).toBe('Z');
    errors.assertNone();
  } finally {
    errors.stop();
  }
});

test("Firefox's mouseup redraw of a drag skips after another view's newer equal placement", async ({
  browserName,
  page,
}) => {
  test.skip(browserName !== 'firefox', "Firefox's mouseup drag redraw");
  const errors = recordBrowserRuntimeErrors(page);

  try {
    const { first, second } = await openViews(page);
    await clickText(page, first, EDITABLE, 1);
    await expectCaret(page, 'First editor', /^This is editable/, 1);
    const end = await pointAt(second, EDITABLE, 7);
    await pressText(page, second, EDITABLE, 2);
    await page.mouse.move(end.x, end.y, { steps: 5 });
    await expect
      .poll(() => readCaret(page))
      .toMatchObject({ anchor: 2, editor: 'Second editor', focus: 7 });
    await waitForSelectionImports(page);
    await runInView(
      page,
      'First editor',
      { focus: 7, kind: 'place', offset: 2 },
      { atMouseUp: true }
    );
    // Stands in for Firefox collapsing the drag after mouseup, which this page
    // does not trigger on its own; the redraw exists to undo that collapse.
    await page.evaluate(() => {
      window.addEventListener(
        'mouseup',
        () => window.getSelection()!.collapseToEnd(),
        { once: true }
      );
    });
    await page.mouse.up();
    await waitForSelectionImports(page);
    await expectCaret(page, 'Second editor', /^This is editable/, 7);
    errors.assertNone();
  } finally {
    errors.stop();
  }
});
