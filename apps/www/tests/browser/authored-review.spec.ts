import {
  type BrowserEditorHarness,
  createBrowserEditorHarness,
  recordBrowserRuntimeErrors,
  startBrowserNativeEventTrace,
  takeBrowserNativeEventTrace,
} from '@platejs/test/playwright';
import { expect, type Page, test } from '@playwright/test';

// Phase 1 of docs/plans/2026-10-08-authored-review.md: native input on the
// review tree, on the proof route. The phase's revert deletes this spec.

type Intent = 'edit' | 'propose';
type Leaf = {
  authored?: Array<{ author: string; kind: string }>;
  text: string;
};
type Block = { authored?: Array<{ kind: string }>; children: Leaf[] };

const MODES: Array<[Intent, string]> = [
  ['edit', 'Editing'],
  ['propose', 'Suggesting'],
];

const open = async (page: Page, intent: Intent, fixture?: 'values') => {
  await page.goto(
    `/dev/authored-review?intent=${intent}${fixture ? `&fixture=${fixture}` : ''}`
  );
  const root = page
    .locator('[data-authored-proof="ready"] [contenteditable="true"]')
    .first();
  const editor = createBrowserEditorHarness(page, `authored ${intent}`, root);

  await editor.ready({ editor: 'visible', text: /Alpha/ });
  await page.waitForFunction(() => 'authoredProof' in window);
  await editor.ime.enableKeyEvents();
  await startBrowserNativeEventTrace(root);

  return editor;
};

/** One block's leaves as `text` or `text[kind:author,…]`. */
const leaves = async (editor: BrowserEditorHarness, block: number) => {
  const value = (await editor.get.modelValue()) as { children: Block[] };

  return value.children[block].children.map((leaf) =>
    leaf.authored?.length
      ? `${leaf.text}[${leaf.authored.map((mark) => `${mark.kind}:${mark.author}`).join(',')}]`
      : leaf.text
  );
};

const blocks = async (editor: BrowserEditorHarness) =>
  ((await editor.get.modelValue()) as { children: Block[] }).children.map(
    (block) =>
      `${block.children.map((leaf) => leaf.text).join('')}${
        block.authored?.length
          ? `[${block.authored.map((mark) => mark.kind).join(',')}]`
          : ''
      }`
  );

const anomalies = async (editor: BrowserEditorHarness) => {
  const trace = await takeBrowserNativeEventTrace(editor.root);

  return trace.anomalies;
};

const compositionEnds = async (editor: BrowserEditorHarness) => {
  const trace = await takeBrowserNativeEventTrace(editor.root);

  return trace.entries
    .filter((entry) => entry.type === 'compositionend')
    .map((entry) => entry.data);
};

const typed = (intent: Intent, text: string) =>
  intent === 'propose' ? `${text}[insert:alice]` : text;

/** The viewport point at a text offset, for a native drop there. */
const pointAt = (
  editor: BrowserEditorHarness,
  path: readonly number[],
  offset: number
) =>
  editor.root.evaluate(
    (element, target) => {
      const string = element.querySelector(
        `[data-editor-node="text"][data-editor-path="${target.path.join(',')}"] [data-editor-string]`
      )?.firstChild;

      if (!string) throw new Error(`No text at ${target.path.join(',')}`);

      const range = element.ownerDocument.createRange();

      range.setStart(string, target.offset);
      range.setEnd(string, target.offset);

      const rect = range.getBoundingClientRect();

      return { x: rect.x, y: rect.y + rect.height / 2 };
    },
    { offset, path: [...path] }
  );

/** Playwright's mouse only extends a text selection, so this fires the DOM drag events a native drag would. */
const dragSelectionTo = (
  editor: BrowserEditorHarness,
  to: { x: number; y: number }
) =>
  editor.root.evaluate((element, point) => {
    const { ownerDocument } = element;
    const source = ownerDocument.getSelection()?.anchorNode?.parentElement;
    const target = ownerDocument.elementFromPoint(point.x, point.y);

    if (!source || !target) throw new Error('No drag source or drop target.');

    const dataTransfer = new DataTransfer();
    const fire = (node: Element, type: string) =>
      node.dispatchEvent(
        new DragEvent(type, {
          bubbles: true,
          cancelable: true,
          clientX: point.x,
          clientY: point.y,
          dataTransfer,
        })
      );

    fire(source, 'dragstart');
    fire(target, 'dragover');
    fire(target, 'drop');
    fire(source, 'dragend');
  }, to);

/** An editor clipboard envelope whose text carries a forged review mark. */
const forgedEnvelope = (text: string) => {
  const encoded = Buffer.from(
    encodeURIComponent(
      JSON.stringify({
        slice: {
          content: [
            {
              authored: [
                {
                  at: 1,
                  author: 'mallory',
                  change: 'mallory:1',
                  kind: 'insert',
                },
              ],
              text,
            },
          ],
          openEnd: 0,
          openStart: 0,
        },
        version: 1,
      })
    )
  ).toString('base64');

  return `<p data-editor-fragment="${encoded}" data-editor-fragment-format="x-editor-fragment">${text}</p>`;
};

test.describe('authored review tree native input', () => {
  for (const [intent, mode] of MODES) {
    test(`click inside struck text puts a native caret there, and typing splits the deletion (${mode})`, async ({
      page,
    }) => {
      const errors = recordBrowserRuntimeErrors(page, { strict: true });
      const editor = await open(page, intent);

      await editor.dom.clickTextOffset({ offset: 2, path: [0, 1] });
      await editor.assert.collapsedModelDOMSelection({
        offset: 2,
        path: [0, 1],
        text: 'gone',
      });
      await editor.type('X');
      await editor.assert.collapsedModelDOMSelection({
        offset: 1,
        path: [0, 2],
        text: 'X',
      });
      await editor.type('Y');

      expect(await leaves(editor, 0)).toEqual([
        'Alpha ',
        'go[delete:bob]',
        typed(intent, 'XY'),
        'ne[delete:bob]',
        ' beta ',
        'theirs[insert:bob]',
        ' gamma',
      ]);
      expect(await anomalies(editor)).toEqual([]);
      errors.assertNone();
    });

    test(`arrow keys step through struck text one character at a time (${mode})`, async ({
      page,
    }) => {
      const errors = recordBrowserRuntimeErrors(page, { strict: true });
      const editor = await open(page, intent);

      // Each leaf boundary takes one press, as between any two marked leaves.
      const press = async (key: string, count: number) => {
        for (let index = 0; index < count; index += 1) await editor.press(key);
      };

      await editor.dom.clickTextOffset({ offset: 5, path: [0, 0] });
      await press('ArrowRight', 4);
      await editor.assert.collapsedModelDOMSelection({
        offset: 2,
        path: [0, 1],
        text: 'gone',
      });
      await press('ArrowRight', 4);
      await editor.assert.collapsedModelDOMSelection({
        offset: 1,
        path: [0, 2],
        text: ' beta ',
      });
      await press('ArrowLeft', 3);
      await editor.assert.collapsedModelDOMSelection({
        offset: 3,
        path: [0, 1],
        text: 'gone',
      });
      await editor.type('Z');

      expect(await leaves(editor, 0)).toEqual([
        'Alpha ',
        'gon[delete:bob]',
        typed(intent, 'Z'),
        'e[delete:bob]',
        ' beta ',
        'theirs[insert:bob]',
        ' gamma',
      ]);
      expect(await anomalies(editor)).toEqual([]);
      errors.assertNone();
    });

    test(`paste inside struck text splits the deletion (${mode})`, async ({
      page,
    }) => {
      const errors = recordBrowserRuntimeErrors(page, { strict: true });
      const editor = await open(page, intent);

      await editor.dom.clickTextOffset({ offset: 2, path: [0, 1] });
      await editor.clipboard.pasteNativeText('P');
      await editor.assert.collapsedModelDOMSelection({
        offset: 1,
        path: [0, 2],
        text: 'P',
      });
      await editor.type('Q');

      expect(await leaves(editor, 0)).toEqual([
        'Alpha ',
        'go[delete:bob]',
        typed(intent, 'PQ'),
        'ne[delete:bob]',
        ' beta ',
        'theirs[insert:bob]',
        ' gamma',
      ]);
      expect(await anomalies(editor)).toEqual([]);
      errors.assertNone();
    });

    test(`dragging a word moves it, and typing after the drop extends the move (${mode})`, async ({
      page,
    }) => {
      const errors = recordBrowserRuntimeErrors(page, { strict: true });
      const editor = await open(page, intent);

      await editor.selection.select({
        anchor: { offset: 0, path: [2, 0] },
        focus: { offset: 5, path: [2, 0] },
      });
      await dragSelectionTo(editor, await pointAt(editor, [2, 0], 10));
      await editor.press('ArrowRight');
      await editor.type('X');

      expect(await leaves(editor, 2)).toEqual(
        intent === 'edit'
          ? [' linePlainX']
          : ['Plain[delete:alice]', ' line', 'PlainX[insert:alice]']
      );
      expect(await anomalies(editor)).toEqual([]);
      errors.assertNone();
    });

    test(`a pasted envelope's review marks drop (${mode})`, async ({
      page,
    }) => {
      const errors = recordBrowserRuntimeErrors(page, { strict: true });
      const editor = await open(page, intent);

      await editor.dom.clickTextOffset({ offset: 3, path: [2, 0] });
      await editor.clipboard.pasteHtml(forgedEnvelope('P'), 'P');

      expect(await leaves(editor, 2)).toEqual(
        intent === 'edit'
          ? ['PlaPin line']
          : ['Pla', typed(intent, 'P'), 'in line']
      );
      expect(await anomalies(editor)).toEqual([]);
      errors.assertNone();
    });

    test(`IME composition inside struck text splits the deletion (${mode})`, async ({
      page,
    }) => {
      const errors = recordBrowserRuntimeErrors(page, { strict: true });
      const editor = await open(page, intent);

      await editor.dom.clickTextOffset({ offset: 2, path: [0, 1] });
      await editor.ime.compose({ steps: ['す', 'すし'], text: 'すし' });
      expect(await compositionEnds(editor)).toEqual(['すし']);
      await editor.assert.collapsedModelDOMSelection({
        offset: 2,
        path: [0, 2],
        text: 'すし',
      });
      await editor.type('X');

      expect(await leaves(editor, 0)).toEqual([
        'Alpha ',
        'go[delete:bob]',
        typed(intent, 'すしX'),
        'ne[delete:bob]',
        ' beta ',
        'theirs[insert:bob]',
        ' gamma',
      ]);
      expect(await anomalies(editor)).toEqual([]);
      errors.assertNone();
    });
  }

  test('Backspace and Delete remove struck text in Editing', async ({
    page,
  }) => {
    const errors = recordBrowserRuntimeErrors(page, { strict: true });
    const editor = await open(page, 'edit');

    await editor.dom.clickTextOffset({ offset: 2, path: [0, 1] });
    await editor.press('Backspace');
    await editor.press('Delete');
    await editor.assert.collapsedModelDOMSelection({
      offset: 1,
      path: [0, 1],
      text: 'ge',
    });
    await editor.type('X');

    expect(await leaves(editor, 0)).toEqual([
      'Alpha ',
      'g[delete:bob]',
      'X',
      'e[delete:bob]',
      ' beta ',
      'theirs[insert:bob]',
      ' gamma',
    ]);
    expect(await anomalies(editor)).toEqual([]);
    errors.assertNone();
  });

  test('Backspace steps leftward and Delete rightward over struck text in Suggesting', async ({
    page,
  }) => {
    const errors = recordBrowserRuntimeErrors(page, { strict: true });
    const editor = await open(page, 'propose');

    await editor.selection.collapse({ offset: 4, path: [0, 1] });
    await editor.focus();
    await editor.press('Backspace');
    await editor.assert.collapsedModelDOMSelection({
      offset: 3,
      path: [0, 1],
      text: 'gone',
    });
    await editor.press('Delete');
    await editor.assert.collapsedModelDOMSelection({
      offset: 4,
      path: [0, 1],
      text: 'gone',
    });

    expect(await leaves(editor, 0)).toEqual([
      'Alpha ',
      'gone[delete:bob]',
      ' beta ',
      'theirs[insert:bob]',
      ' gamma',
    ]);
    await editor.type('X');
    expect(await leaves(editor, 0)).toContain('X[insert:alice]');
    expect(await anomalies(editor)).toEqual([]);
    errors.assertNone();
  });

  test('Enter at the end of struck text records a split mark in Suggesting', async ({
    page,
  }) => {
    const errors = recordBrowserRuntimeErrors(page, { strict: true });
    const editor = await open(page, 'propose');

    await editor.selection.collapse({ offset: 4, path: [0, 1] });
    await editor.focus();
    await editor.press('Enter');
    await editor.assert.collapsedModelDOMSelection({
      offset: 0,
      path: [1, 0],
      text: ' beta ',
    });
    await editor.type('Q');

    const result = await blocks(editor);

    expect(result.slice(0, 2)).toEqual([
      'Alpha gone',
      'Q beta theirs gamma[split]',
    ]);
    expect(await leaves(editor, 0)).toEqual(['Alpha ', 'gone[delete:bob]']);
    expect(await anomalies(editor)).toEqual([]);
    errors.assertNone();
  });

  test('Editing text typed inside a struck block survives accepting the deletion', async ({
    page,
  }) => {
    const errors = recordBrowserRuntimeErrors(page, { strict: true });
    const editor = await open(page, 'edit');

    await editor.dom.clickTextOffset({ offset: 6, path: [1, 0] });
    await editor.type('NEW');
    await page.evaluate(() =>
      window.authoredProof?.decide({ action: 'accept', changes: ['bob:3'] })
    );

    expect(await blocks(editor)).toEqual([
      'Alpha gone beta theirs gamma',
      'NEW',
      'Plain line',
    ]);
    expect(await anomalies(editor)).toEqual([]);
    errors.assertNone();
  });

  for (const [intent, mode, expected, caret] of [
    [
      'edit',
      'Editing',
      'theすしXirs[insert:bob]',
      { offset: 5, path: [0, 3], text: 'theすしirs' },
    ],
    [
      'propose',
      'Suggesting',
      'すしX[insert:bob,insert:alice]',
      { offset: 2, path: [0, 4], text: 'すし' },
    ],
  ] as const) {
    test(`IME composition inside another author's insertion (${mode})`, async ({
      page,
    }) => {
      const errors = recordBrowserRuntimeErrors(page, { strict: true });
      const editor = await open(page, intent);

      await editor.dom.clickTextOffset({ offset: 3, path: [0, 3] });
      await editor.ime.compose({ steps: ['す', 'すし'], text: 'すし' });
      expect(await compositionEnds(editor)).toEqual(['すし']);
      await editor.assert.collapsedModelDOMSelection({
        ...caret,
        path: [...caret.path],
      });
      await editor.type('X');

      expect(await leaves(editor, 0)).toContain(expected);
      expect(await anomalies(editor)).toEqual([]);
      errors.assertNone();
    });
  }

  test('native input repair with struck text present inserts the text once', async ({
    page,
  }) => {
    const errors = recordBrowserRuntimeErrors(page, { strict: true });
    const editor = await open(page, 'edit');

    await editor.dom.clickTextOffset({ offset: 1, path: [0, 2] });
    await editor.scenario.run('repair beside struck text', [
      {
        data: 'R',
        kind: 'mutateTextDOM',
        path: [0, 2],
        selectionOffset: 2,
        text: ' Rbeta ',
      },
    ]);

    expect(await leaves(editor, 0)).toEqual([
      'Alpha ',
      'gone[delete:bob]',
      ' Rbeta ',
      'theirs[insert:bob]',
      ' gamma',
    ]);
    expect(await anomalies(editor)).toEqual([
      { detail: 'inputType=insertText', type: 'missing-beforeinput' },
    ]);
    errors.assertNone();
  });
});

// S8 of docs/plans/2026-10-10-authored-values.md: a split link and stacked
// format suggestions, decided on the proof route.
test.describe('authored property values and inline splits', () => {
  type Node = {
    authored?: Array<{ change: string; kind: string }>;
    bold?: boolean;
    children?: Node[];
    text?: string;
    type?: string;
  };

  const model = async (editor: BrowserEditorHarness) =>
    ((await editor.get.modelValue()) as { children: Node[] }).children;
  const linksOf = (nodes: readonly Node[]): string[] =>
    nodes.flatMap((node) =>
      node.type === 'link'
        ? [(node.children ?? []).map((leaf) => leaf.text).join('')]
        : linksOf(node.children ?? [])
    );

  test('an Enter inside a link in Suggesting, then rejected, gives one link that takes follow-up typing', async ({
    page,
  }) => {
    const errors = recordBrowserRuntimeErrors(page, { strict: true });
    const editor = await open(page, 'propose', 'values');

    await editor.dom.clickTextOffset({ offset: 4, path: [0, 1, 0] });
    await page.keyboard.press('Enter');
    const split = await model(editor);
    const change = split[1]?.authored?.find(
      (mark) => mark.kind === 'split'
    )?.change;

    await page.evaluate(
      (id) => window.authoredProof?.decide({ action: 'reject', changes: [id] }),
      change ?? ''
    );
    const rejected = await model(editor);

    await editor.dom.clickTextOffset({ offset: 9, path: [0, 1, 0] });
    await editor.type('X');

    expect({
      rejected: [rejected.length, linksOf(rejected)],
      split: [split.length, linksOf(split)],
      typed: linksOf(await model(editor)),
    }).toEqual({
      rejected: [1, ['Link here']],
      split: [2, ['Link', ' here']],
      typed: ['Link hereX'],
    });
    await expect(editor.root.locator('a')).toHaveText(['Link hereX']);
    expect(await anomalies(editor)).toEqual([]);
    errors.assertNone();
  });

  test('bold toggled by two changes, then rejected, returns to plain', async ({
    page,
  }) => {
    const errors = recordBrowserRuntimeErrors(page, { strict: true });
    const editor = await open(page, 'propose', 'values');
    const word = async () => {
      const [block] = await model(editor);
      const leaf = block.children!.find((node) =>
        node.text?.includes('bolded')
      )!;

      return {
        bold: leaf.bold ?? false,
        changes: (leaf.authored ?? [])
          .filter((mark) => mark.kind === 'format')
          .map((mark) => mark.change),
      };
    };

    // Offset 0 is also the end of the previous leaf, which the browser picks.
    await editor.dom.clickTextOffset({ offset: 1, path: [0, 3] });
    await page.keyboard.press('ArrowLeft');
    for (let step = 0; step < 6; step += 1) {
      await page.keyboard.press('Shift+ArrowRight');
    }
    await page.keyboard.press('ControlOrMeta+b');
    const toggled = await word();

    await page.evaluate(
      (ids) => window.authoredProof?.decide({ action: 'reject', changes: ids }),
      toggled.changes
    );

    expect({
      rejected: await word(),
      toggled: { bold: toggled.bold, count: toggled.changes.length },
    }).toEqual({
      rejected: { bold: false, changes: [] },
      toggled: { bold: false, count: 2 },
    });
    await expect(editor.root.locator('strong')).toHaveCount(0);
    expect(await anomalies(editor)).toEqual([]);
    errors.assertNone();
  });
});
