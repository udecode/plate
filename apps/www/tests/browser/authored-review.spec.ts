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

const open = async (page: Page, intent: Intent) => {
  await page.goto(`/dev/authored-review?intent=${intent}`);
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
