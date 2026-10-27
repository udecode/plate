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
  authored?: Array<{ author?: string; ctx?: string; kind: string }>;
  text: string;
};
type Block = { authored?: Array<{ kind: string }>; children: Leaf[] };
type Inline = Omit<Leaf, 'text'> & {
  bold?: boolean;
  children?: Inline[];
  text?: string;
  type?: string;
};
type Contexts = Record<string, { base?: string; member: { author: string } }>;

const MODES: Array<[Intent, string]> = [
  ['edit', 'Editing'],
  ['propose', 'Suggesting'],
];

type Fixture = 'fill' | 'page' | 'title' | 'values';

const READY: Record<Fixture, RegExp> = {
  fill: /First line/,
  page: /First line/,
  title: /Title/,
  values: /Alpha/,
};

const open = async (
  page: Page,
  intent: Intent | 'plain',
  fixture?: Fixture
) => {
  await page.goto(
    `/dev/authored-review?intent=${intent}${fixture ? `&fixture=${fixture}` : ''}`
  );
  const root = page
    .locator('[data-authored-proof="ready"] [contenteditable="true"]')
    .first();
  const editor = createBrowserEditorHarness(page, `authored ${intent}`, root);

  await editor.ready({
    editor: 'visible',
    text: fixture ? READY[fixture] : /Alpha/,
  });
  await page.waitForFunction(() => 'authoredProof' in window);
  await editor.ime.enableKeyEvents();
  await startBrowserNativeEventTrace(root);

  return editor;
};

const readBlocks = async (editor: BrowserEditorHarness) => {
  const value = (await editor.get.modelValue()) as {
    children: Block[];
    records?: { 'authored-contexts'?: Contexts };
  };
  const contexts = value.records?.['authored-contexts'] ?? {};
  const restsOn = (ctx: string): string[] => {
    const { base, member } = contexts[ctx];

    return [...(base ? restsOn(base) : []), `insert:${member.author}`];
  };
  const label = (leaf: Omit<Leaf, 'text'>, text: string) => {
    const authored = leaf.authored ?? [];
    const marks = [
      ...authored.flatMap((mark) => (mark.ctx ? restsOn(mark.ctx) : [])),
      ...authored.flatMap((mark) =>
        mark.ctx ? [] : [`${mark.kind}:${mark.author}`]
      ),
    ];

    return marks.length ? `${text}[${marks.join(',')}]` : text;
  };

  return { children: value.children, label };
};

const leaves = async (editor: BrowserEditorHarness, block: number) => {
  const { children, label } = await readBlocks(editor);

  return children[block].children.map((leaf) => label(leaf, leaf.text));
};

const inlines = async (editor: BrowserEditorHarness, block: number) => {
  const { children, label } = await readBlocks(editor);
  const show = (node: Inline): string =>
    node.type === 'link'
      ? `link(${(node.children ?? []).map(show).join('|')})`
      : label(node, `${node.text}${node.bold ? '*' : ''}`);

  return (children[block].children as Inline[]).map(show);
};

const loadLine = (page: Page, children: readonly unknown[]) =>
  page.evaluate(
    (line) =>
      window.authoredProof?.load([{ type: 'paragraph', children: line }]),
    children
  );

const bobDeletes = (text: string) => ({
  authored: [{ at: 1, author: 'bob', change: 'bob:1', kind: 'delete' }],
  text,
});

const composeWord = (
  editor: BrowserEditorHarness,
  browserName: string,
  steps: readonly string[] = ['す', 'すし']
) =>
  editor.ime.compose({
    steps: [...steps],
    text: steps.at(-1)!,
    transport: browserName === 'chromium' ? 'native' : 'preedit',
  });

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

/** A block's text as the DOM shows it, so a stale or doubled letter shows. */
const renderedLine = (editor: BrowserEditorHarness, block: number) =>
  editor.root.evaluate((root, index) => {
    const elements = root.querySelectorAll(
      ':scope > [data-editor-node="element"]'
    );

    return elements[index]?.textContent?.replace(/[\uFEFF\u00A0]/g, '') ?? null;
  }, block);

const compositionEnds = async (editor: BrowserEditorHarness) => {
  const trace = await takeBrowserNativeEventTrace(editor.root);

  return trace.entries
    .filter((entry) => entry.type === 'compositionend')
    .map((entry) => entry.data);
};

const typed = (intent: Intent, text: string) =>
  intent === 'propose' ? `${text}[insert:alice]` : text;

/** The block texts of the document with every pending change accepted or rejected. */
const projected = (page: Page, projection: 'accepted' | 'proposed') =>
  page.evaluate((which) => {
    const value = window.authoredProof?.project(which) as
      | Array<{ children: Array<{ text: string }> }>
      | undefined;

    if (!value) throw new Error('the proof route is not ready');

    return value.map((block) =>
      block.children.map((leaf) => leaf.text).join('')
    );
  }, projection);

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

// A letter typed or pasted inside struck letters lands where a plain editor
// puts it, after them; in Editing it joins the live text that follows.
const afterStruck = (intent: Intent, text: string) => [
  'Alpha ',
  'gone[delete:bob]',
  ...(intent === 'edit' ? [`${text} beta `] : [typed(intent, text), ' beta ']),
  'theirs[insert:bob]',
  ' gamma',
];

test.describe('authored review tree native input', () => {
  for (const [intent, mode] of MODES) {
    test(`click inside struck text puts a native caret there, and typing lands after the struck letters (${mode})`, async ({
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
        text: intent === 'edit' ? 'X beta ' : 'X',
      });
      await editor.type('Y');

      expect(await leaves(editor, 0)).toEqual(afterStruck(intent, 'XY'));
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

      expect(await leaves(editor, 0)).toEqual(afterStruck(intent, 'Z'));
      expect(await anomalies(editor)).toEqual([]);
      errors.assertNone();
    });

    test(`paste inside struck text lands after the struck letters (${mode})`, async ({
      page,
    }) => {
      const errors = recordBrowserRuntimeErrors(page, { strict: true });
      const editor = await open(page, intent);

      await editor.dom.clickTextOffset({ offset: 2, path: [0, 1] });
      await editor.clipboard.pasteNativeText('P');
      await editor.assert.collapsedModelDOMSelection({
        offset: 1,
        path: [0, 2],
        text: intent === 'edit' ? 'P beta ' : 'P',
      });
      await editor.type('Q');

      expect(await leaves(editor, 0)).toEqual(afterStruck(intent, 'PQ'));
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
      browserName,
      page,
    }) => {
      const errors = recordBrowserRuntimeErrors(page, { strict: true });
      const editor = await open(page, intent);

      await editor.dom.clickTextOffset({ offset: 2, path: [0, 1] });
      await editor.ime.compose({
        steps: ['す', 'すし'],
        text: 'すし',
        transport: browserName === 'chromium' ? 'native' : 'preedit',
      });
      expect(await compositionEnds(editor)).toEqual(['すし']);
      await editor.assert.collapsedModelDOMSelection({
        offset: 2,
        path: [0, 2],
        text: 'すし',
      });
      await expect
        .poll(() => renderedLine(editor, 0))
        .toBe(await editor.get.modelBlockText(0));
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

    for (const [edge, caret, expected] of [
      [
        'start',
        { offset: 'Alpha '.length, path: [0, 0] },
        intent === 'edit'
          ? [
              'Alpha すしX',
              'gone[delete:bob]',
              ' beta ',
              'theirs[insert:bob]',
              ' gamma',
            ]
          : [
              'Alpha ',
              typed(intent, 'すしX'),
              'gone[delete:bob]',
              ' beta ',
              'theirs[insert:bob]',
              ' gamma',
            ],
      ],
      ['end', { offset: 4, path: [0, 1] }, afterStruck(intent, 'すしX')],
    ] as const) {
      test(`IME composition at the ${edge} of struck text leaves the deletion whole (${mode})`, async ({
        browserName,
        page,
      }) => {
        const errors = recordBrowserRuntimeErrors(page, { strict: true });
        const editor = await open(page, intent);

        await editor.dom.clickTextOffset({
          offset: caret.offset,
          path: [...caret.path],
        });
        await composeWord(editor, browserName);
        await expect
          .poll(() => renderedLine(editor, 0))
          .toBe(await editor.get.modelBlockText(0));
        await editor.type('X');

        expect(await leaves(editor, 0)).toEqual(expected);
        expect(await anomalies(editor)).toEqual([]);
        errors.assertNone();
      });
    }

    test(`IME composition inside struck text after toggling bold is bold (${mode})`, async ({
      browserName,
      page,
    }) => {
      const errors = recordBrowserRuntimeErrors(page, { strict: true });
      const editor = await open(page, intent);

      await editor.dom.clickTextOffset({ offset: 2, path: [0, 1] });
      await editor.press('ControlOrMeta+b');
      await composeWord(editor, browserName);
      await expect
        .poll(() => renderedLine(editor, 0))
        .toBe(await editor.get.modelBlockText(0));

      expect(await inlines(editor, 0)).toEqual([
        'Alpha ',
        'go[delete:bob]',
        typed(intent, 'すし*'),
        'ne[delete:bob]',
        ' beta ',
        'theirs[insert:bob]',
        ' gamma',
      ]);
      expect(await anomalies(editor)).toEqual([]);
      errors.assertNone();
    });

    test(`IME composition inside struck text before a bold leaf takes its bold (${mode})`, async ({
      browserName,
      page,
    }) => {
      const errors = recordBrowserRuntimeErrors(page, { strict: true });
      const editor = await open(page, intent);

      await loadLine(page, [
        { text: 'Alpha ' },
        bobDeletes('gone'),
        { bold: true, text: ' bold' },
        { text: ' end' },
      ]);
      await editor.dom.clickTextOffset({ offset: 2, path: [0, 1] });
      await composeWord(editor, browserName);
      await expect
        .poll(() => renderedLine(editor, 0))
        .toBe(await editor.get.modelBlockText(0));
      await editor.type('X');

      expect(await inlines(editor, 0)).toEqual([
        'Alpha ',
        'go[delete:bob]',
        typed(intent, 'すしX*'),
        'ne[delete:bob]',
        ' bold*',
        ' end',
      ]);
      expect(await anomalies(editor)).toEqual([]);
      errors.assertNone();
    });

    test(`IME composition inside struck text at a link's end stays in the link (${mode})`, async ({
      browserName,
      page,
    }) => {
      const errors = recordBrowserRuntimeErrors(page, { strict: true });
      const editor = await open(page, intent);

      await loadLine(page, [
        { text: 'Alpha ' },
        {
          children: [{ text: 'Link ' }, bobDeletes('here')],
          type: 'link',
          url: 'https://plate.test',
        },
        { text: ' end' },
      ]);
      await editor.dom.clickTextOffset({ offset: 2, path: [0, 1, 1] });
      await composeWord(editor, browserName);
      await expect
        .poll(() => renderedLine(editor, 0))
        .toBe(await editor.get.modelBlockText(0));

      expect(await inlines(editor, 0)).toEqual([
        'Alpha ',
        `link(Link |he[delete:bob]|${typed(intent, 'すし')}|re[delete:bob])`,
        ' end',
      ]);
      expect(await anomalies(editor)).toEqual([]);
      errors.assertNone();
    });

    test(`one undo takes back an IME composition inside struck text, and redo splits it again (${mode})`, async ({
      browserName,
      page,
    }) => {
      const errors = recordBrowserRuntimeErrors(page, { strict: true });
      const editor = await open(page, intent);
      const shown = async () => {
        await expect
          .poll(() => renderedLine(editor, 0))
          .toBe(await editor.get.modelBlockText(0));
        return leaves(editor, 0);
      };
      const before = await leaves(editor, 0);

      await editor.dom.clickTextOffset({ offset: 2, path: [0, 1] });
      await composeWord(editor, browserName);
      const composed = await shown();

      await editor.press('ControlOrMeta+z');
      const undone = await shown();

      await editor.press('ControlOrMeta+Shift+z');

      expect({ composed, redone: await shown(), undone }).toEqual({
        composed: [
          'Alpha ',
          'go[delete:bob]',
          typed(intent, 'すし'),
          'ne[delete:bob]',
          ' beta ',
          'theirs[insert:bob]',
          ' gamma',
        ],
        redone: composed,
        undone: before,
      });
      expect(await anomalies(editor)).toEqual([]);
      errors.assertNone();
    });

    test(`two IME compositions in a row inside struck text, the second starting before the first renders, land in order (${mode})`, async ({
      browserName,
      page,
    }) => {
      test.skip(browserName !== 'chromium', 'Chromium composition protocol');
      const errors = recordBrowserRuntimeErrors(page, { strict: true });
      const editor = await open(page, intent);
      const client = await page.context().newCDPSession(page);

      try {
        await editor.dom.clickTextOffset({ offset: 2, path: [0, 1] });
        await client.send('Input.imeSetComposition', {
          selectionEnd: 1,
          selectionStart: 1,
          text: 'か',
        });
        await Promise.all([
          client.send('Input.insertText', { text: 'か' }),
          client.send('Input.imeSetComposition', {
            selectionEnd: 1,
            selectionStart: 1,
            text: 'き',
          }),
        ]);
        await client.send('Input.insertText', { text: 'き' });
        await expect
          .poll(() => renderedLine(editor, 0))
          .toBe(await editor.get.modelBlockText(0));
        await editor.type('X');

        expect(await leaves(editor, 0)).toEqual([
          'Alpha ',
          'go[delete:bob]',
          typed(intent, 'かきX'),
          'ne[delete:bob]',
          ' beta ',
          'theirs[insert:bob]',
          ' gamma',
        ]);
        expect(await anomalies(editor)).toEqual([]);
        errors.assertNone();
      } finally {
        await client.detach();
      }
    });
  }

  test('Backspace and Delete inside struck text remove the nearest live letters in Editing', async ({
    page,
  }) => {
    const errors = recordBrowserRuntimeErrors(page, { strict: true });
    const editor = await open(page, 'edit');

    await editor.dom.clickTextOffset({ offset: 2, path: [0, 1] });
    await editor.press('Backspace');
    await editor.press('Delete');
    await editor.type('X');

    const [proposedLine] = await projected(page, 'proposed');

    expect(proposedLine).toBe('AlphaXbeta theirs gamma');
    expect(await leaves(editor, 0)).toContain('gone[delete:bob]');
    expect(await anomalies(editor)).toEqual([]);
    errors.assertNone();
  });

  test('Backspace and Delete at the end of struck text strike the nearest live letters in Suggesting', async ({
    page,
  }) => {
    const errors = recordBrowserRuntimeErrors(page, { strict: true });
    const editor = await open(page, 'propose');
    const start = await projected(page, 'accepted');

    await editor.selection.collapse({ offset: 4, path: [0, 1] });
    await editor.focus();
    await editor.press('Backspace');
    await editor.press('Delete');
    await editor.type('X');

    const [proposedLine] = await projected(page, 'proposed');

    expect(proposedLine).toBe('AlphaXbeta theirs gamma');
    expect(await projected(page, 'accepted')).toEqual(start);
    expect(await leaves(editor, 0)).toEqual(
      expect.arrayContaining(['gone[delete:bob]', 'X[insert:alice]'])
    );
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

  for (const [intent, mode, caret] of [
    ['edit', 'Editing', { offset: 9, path: [0, 4], text: ' gammaNEW' }],
    ['propose', 'Suggesting', { offset: 3, path: [0, 5], text: 'NEW' }],
  ] as const) {
    test(`text typed inside a struck block lands at the end of the line before it (${mode})`, async ({
      page,
    }) => {
      const errors = recordBrowserRuntimeErrors(page, { strict: true });
      const editor = await open(page, intent);

      await editor.dom.clickTextOffset({ offset: 6, path: [1, 0] });
      await editor.type('NEW');
      await editor.assert.collapsedModelDOMSelection({
        ...caret,
        path: [...caret.path],
      });
      const firstLine = await leaves(editor, 0);

      expect(firstLine.at(-1)).toBe(
        intent === 'edit' ? ' gammaNEW' : typed(intent, 'NEW')
      );
      await page.evaluate(() =>
        window.authoredProof?.decide({ action: 'accept', changes: ['bob:3'] })
      );

      expect(await blocks(editor)).toEqual([
        'Alpha gone beta theirs gammaNEW',
        'Plain line',
      ]);
      expect(await anomalies(editor)).toEqual([]);
      errors.assertNone();
    });

    test(`Enter inside a struck block opens a line after the line before it (${mode})`, async ({
      page,
    }) => {
      const errors = recordBrowserRuntimeErrors(page, { strict: true });
      const editor = await open(page, intent);

      await editor.dom.clickTextOffset({ offset: 6, path: [1, 0] });
      await editor.press('Enter');
      await editor.type('Q');
      await editor.assert.collapsedModelDOMSelection({
        offset: 1,
        path: [1, 0],
        text: 'Q',
      });
      await page.evaluate(() =>
        window.authoredProof?.decide({ action: 'accept', changes: ['bob:3'] })
      );

      const accepted = await blocks(editor);

      expect(accepted.map((block) => block.replace(/\[.*\]$/, ''))).toEqual([
        'Alpha gone beta theirs gamma',
        'Q',
        'Plain line',
      ]);
      expect(await anomalies(editor)).toEqual([]);
      errors.assertNone();
    });
  }

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

// T9 of docs/plans/2026-10-11-authored-fill.md: a suggestion records what
// Editing's completion builds, so accepting it gives Editing's result.

type Tree = {
  authored?: Array<{ change: string }>;
  children?: Tree[];
  [key: string]: unknown;
};

const tree = async (editor: BrowserEditorHarness) =>
  ((await editor.get.modelValue()) as { children: Tree[] }).children;

const changesIn = (nodes: readonly Tree[]): string[] => [
  ...new Set(
    nodes.flatMap((node) => [
      ...(node.authored ?? []).map((mark) => mark.change),
      ...changesIn(node.children ?? []),
    ])
  ),
];

const decideAll = async (
  page: Page,
  editor: BrowserEditorHarness,
  action: 'accept' | 'reject'
) => {
  const changes = changesIn(await tree(editor));

  expect(
    await page.evaluate((decision) => window.authoredProof?.decide(decision), {
      action,
      changes,
    })
  ).toMatchObject({ status: 'applied' });
  expect(changesIn(await tree(editor))).toEqual([]);
};

const PAINT: Readonly<Record<string, readonly [string, RegExp] | null>> = {
  delete: ['text-decoration-line', /line-through/],
  format: ['background-color', /rgb\(254, 249, 195\)/],
  insert: ['text-decoration-line', /underline/],
  unwrap: null,
};

const gesture = (
  page: Page,
  name: 'removeCell' | 'removeTitle' | 'unwrapGroup'
) => page.evaluate((which) => window.authoredProof?.gesture(which), name);

const selectAll = async (editor: BrowserEditorHarness) => {
  await editor.selection.collapse({ offset: 0, path: [0, 0] });
  await editor.focus();
  await editor.press('ControlOrMeta+A');
};

const GESTURES: ReadonlyArray<
  [
    name: string,
    run: (page: Page, editor: BrowserEditorHarness) => Promise<void>,
    painted: readonly string[],
  ]
> = [
  [
    'select all, then Backspace',
    async (_page, editor) => {
      await selectAll(editor);
      await editor.press('Backspace');
    },
    ['delete'],
  ],
  [
    'select all, then typing',
    async (_page, editor) => {
      await selectAll(editor);
      await editor.type('X');
    },
    ['delete', 'insert'],
  ],
  [
    'Backspace across blocks',
    async (_page, editor) => {
      await editor.selection.select({
        anchor: { offset: 3, path: [0, 0] },
        focus: { offset: 4, path: [1, 0] },
      });
      await editor.focus();
      await editor.press('Backspace');
    },
    ['delete'],
  ],
  [
    'a bold toggle',
    async (_page, editor) => {
      await editor.selection.select({
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 5, path: [0, 0] },
      });
      await editor.focus();
      await editor.press('ControlOrMeta+B');
    },
    ['format'],
  ],
  [
    'deleting a grid cell, then unwrapping the grid',
    async (page) => {
      await gesture(page, 'removeCell');
      await gesture(page, 'unwrapGroup');
    },
    ['delete', 'unwrap'],
  ],
  [
    'unwrapping the grid, then deleting a grid cell',
    async (page) => {
      await gesture(page, 'unwrapGroup');
      await gesture(page, 'removeCell');
    },
    ['delete', 'unwrap'],
  ],
];

test.describe('authored review fills as Editing does', () => {
  for (const [name, run, painted] of GESTURES) {
    test(`${name} shows the change while suggesting, and accepting it gives Editing's result`, async ({
      page,
    }) => {
      const errors = recordBrowserRuntimeErrors(page, { strict: true });
      const editing = await open(page, 'edit', 'fill');

      await run(page, editing);
      const expected = await tree(editing);
      const suggesting = await open(page, 'propose', 'fill');

      await run(page, suggesting);
      for (const kind of painted) {
        const shown = suggesting.root
          .locator(`[data-authored~="${kind}"]`)
          .first();
        const style = PAINT[kind];

        await expect(shown).toBeVisible();
        if (style) {
          const styled = suggesting.root.locator(`[data-authored="${kind}"]`);

          await expect(styled.first()).toHaveCSS(...style);
          for (const node of await styled.all()) {
            await expect(node).toHaveCSS(...style);
          }
        }
      }
      await decideAll(page, suggesting, 'accept');

      expect(await tree(suggesting)).toEqual(expected);
      errors.assertNone();
    });
  }

  test('suggesting a required title’s deletion strikes its text, and a title typed into it stays once accepted', async ({
    page,
  }) => {
    const errors = recordBrowserRuntimeErrors(page, { strict: true });
    const retitle = async (editor: BrowserEditorHarness) => {
      await gesture(page, 'removeTitle');
      await editor.selection.collapse({ offset: 0, path: [0, 0] });
      await editor.focus();
      await editor.type('New');
    };
    const editing = await open(page, 'edit', 'title');

    await retitle(editing);
    const expected = await tree(editing);
    const suggesting = await open(page, 'propose', 'title');

    await gesture(page, 'removeTitle');
    expect(await leaves(suggesting, 0)).toEqual(['Title[delete:alice]']);
    await suggesting.selection.collapse({ offset: 0, path: [0, 0] });
    await suggesting.focus();
    await suggesting.type('New');
    await decideAll(page, suggesting, 'accept');
    const [title] = await suggesting.get.modelBlockTexts();

    expect({ accepted: await tree(suggesting), title }).toEqual({
      accepted: expected,
      title: 'New',
    });
    errors.assertNone();
  });

  test('accepting the deletion of every character of a bold line leaves a line that typing keeps plain', async ({
    page,
  }) => {
    const errors = recordBrowserRuntimeErrors(page, { strict: true });
    const editor = await open(page, 'propose', 'fill');

    await editor.selection.select({
      anchor: { offset: 0, path: [1, 0] },
      focus: { offset: 9, path: [1, 0] },
    });
    await editor.focus();
    await editor.press('Backspace');
    expect(await leaves(editor, 1)).toEqual(['Bold line[delete:alice]']);
    await decideAll(page, editor, 'accept');
    await editor.selection.collapse({ offset: 0, path: [1, 0] });
    await editor.focus();
    await editor.type('x');
    const children = await tree(editor);

    expect(children.slice(1, 2)).toEqual([
      {
        type: 'paragraph',
        children: [
          {
            authored: [expect.objectContaining({ kind: 'insert' })],
            text: 'x',
          },
        ],
      },
    ]);
    errors.assertNone();
  });

  test('rejecting typing into an empty line restores the line', async ({
    page,
  }) => {
    const errors = recordBrowserRuntimeErrors(page, { strict: true });
    const editor = await open(page, 'propose', 'fill');

    await editor.selection.collapse({ offset: 0, path: [2, 0] });
    await editor.focus();
    await editor.type('Typed');
    expect(await leaves(editor, 2)).toEqual(['Typed[insert:alice]']);
    await decideAll(page, editor, 'reject');
    const children = await tree(editor);

    expect(children.slice(2, 3)).toEqual([
      { type: 'paragraph', children: [{ text: '' }] },
    ]);
    errors.assertNone();
  });
});

// P1.1 of docs/plans/2026-10-12-suggestions-complete.md: where the caret goes
// and what each key records, beside an editor without the review tree.
test.describe('authored review tree caret', () => {
  type Caret = { offset: number; path: number[]; text: string };
  type Point = { offset: number; path: number[] };
  type State = { caret: Point | undefined; tree: string[] };

  const LINE_DELETE =
    process.platform === 'darwin' ? 'Meta+Backspace' : 'Shift+Home, Backspace';
  const PAGE = ['First line', 'Second line', 'Last line'];

  /** Each block as its leaves, `text[kind:author]` when marked, after the block's own marks. */
  const review = async (editor: BrowserEditorHarness) =>
    ((await editor.get.modelValue()) as { children: Block[] }).children.map(
      (block) =>
        `${block.authored?.length ? `[${block.authored.map((mark) => mark.kind).join(',')}] ` : ''}${block.children
          .map((leaf) =>
            leaf.authored?.length
              ? `${leaf.text}[${leaf.authored.map((mark) => `${mark.kind}:${mark.author}`).join(',')}]`
              : leaf.text
          )
          .join('|')}`
    );

  const press = async (editor: BrowserEditorHarness, key: string) => {
    if (key.startsWith('type ')) {
      await editor.type(key.slice('type '.length));
    } else if (key === 'line delete' && process.platform === 'darwin') {
      await editor.press('Meta+Backspace');
    } else if (key === 'line delete') {
      await editor.page.keyboard.press('Shift+Home');
      await editor.press('Backspace');
    } else {
      await editor.press(key);
    }
  };

  const state = async (editor: BrowserEditorHarness): Promise<State> => {
    const selection = await editor.get.selection();

    return { caret: selection?.anchor, tree: await review(editor) };
  };

  const plainRun = async (
    page: Page,
    start: Point,
    keys: readonly string[]
  ) => {
    const editor = await open(page, 'plain', 'page');
    const states: State[] = [];

    await editor.dom.clickTextOffset(start);
    for (const key of keys) {
      await press(editor, key);
      states.push(await state(editor));
    }

    return states;
  };

  const CASES: ReadonlyArray<{
    /** Also run in Editing, where an unmarked document records the plain steps. */
    editing?: true;
    name: string;
    start: Point;
    steps: ReadonlyArray<{ caret: Caret; key: string; tree: string[] }>;
  }> = [
    {
      editing: true,
      name: 'Enter at a line’s end, then typing',
      start: { offset: 10, path: [0, 0] },
      steps: [
        {
          caret: { offset: 0, path: [1, 0], text: '' },
          key: 'Enter',
          tree: ['First line', '[split] ', 'Second line', 'Last line'],
        },
        {
          caret: { offset: 2, path: [1, 0], text: 'ab' },
          key: 'type ab',
          tree: [
            'First line',
            '[split] ab[insert:alice]',
            'Second line',
            'Last line',
          ],
        },
      ],
    },
    {
      name: `the owner’s sequence, line delete as ${LINE_DELETE}, Enter twice, Backspace three times, then typing`,
      start: { offset: 11, path: [1, 0] },
      steps: [
        {
          caret: { offset: 0, path: [1, 0], text: 'Second line' },
          key: 'line delete',
          tree: ['First line', 'Second line[delete:alice]', 'Last line'],
        },
        {
          caret: { offset: 0, path: [2, 0], text: 'Second line' },
          key: 'Enter',
          tree: [
            'First line',
            '',
            '[split] Second line[delete:alice]',
            'Last line',
          ],
        },
        {
          caret: { offset: 0, path: [3, 0], text: 'Second line' },
          key: 'Enter',
          tree: [
            'First line',
            '',
            '[split] ',
            '[split] Second line[delete:alice]',
            'Last line',
          ],
        },
        {
          caret: { offset: 0, path: [2, 0], text: 'Second line' },
          key: 'Backspace',
          tree: [
            'First line',
            '',
            '[split] Second line[delete:alice]',
            'Last line',
          ],
        },
        {
          caret: { offset: 0, path: [2, 0], text: 'Second line' },
          key: 'Backspace',
          tree: [
            'First line',
            '[delete] [delete:alice]',
            '[split] Second line[delete:alice]',
            'Last line',
          ],
        },
        // A join over alice's own split, not its withdrawal. Withdrawing would
        // merge the struck text into the line her previous key struck, so
        // accepting that line's deletion and rejecting the text's own would
        // still remove the text.
        {
          caret: { offset: 10, path: [0, 0], text: 'First line' },
          key: 'Backspace',
          tree: [
            'First line',
            '[delete] [delete:alice]',
            '[split,join] Second line[delete:alice]',
            'Last line',
          ],
        },
        {
          caret: { offset: 2, path: [0, 1], text: 'ab' },
          key: 'type ab',
          tree: [
            'First line|ab[insert:alice]',
            '[delete] [delete:alice]',
            '[split,join] Second line[delete:alice]',
            'Last line',
          ],
        },
      ],
    },
  ];

  for (const { editing, name, start, steps } of CASES) {
    const keys = steps.map((step) => step.key);

    if (editing) {
      test(`Editing matches the plain editor after every key: ${name}`, async ({
        page,
      }) => {
        const errors = recordBrowserRuntimeErrors(page, { strict: true });
        const plain = await plainRun(page, start, keys);
        const editor = await open(page, 'edit', 'page');

        await editor.dom.clickTextOffset(start);
        for (const [index, key] of keys.entries()) {
          await press(editor, key);
          expect(await state(editor), `after ${key}`).toEqual(plain[index]);
        }
        expect(plain[0].caret).toEqual({ offset: 0, path: [1, 0] });
        errors.assertNone();
      });
    }

    test(`Suggesting records each key and keeps the caret where it was typed: ${name}`, async ({
      page,
    }) => {
      const errors = recordBrowserRuntimeErrors(page, { strict: true });
      const plain = await plainRun(page, start, keys);
      const editor = await open(page, 'propose', 'page');

      await editor.dom.clickTextOffset(start);
      let before = await state(editor);

      for (const [index, step] of steps.entries()) {
        await press(editor, step.key);
        expect(await review(editor), `tree after ${step.key}`).toEqual(
          step.tree
        );
        await editor.assert.collapsedModelDOMSelection(step.caret);
        await editor.assert.focusOwner('editor');

        const after = await state(editor);

        expect(after, `${step.key} changed nothing`).not.toEqual(before);
        before = after;
        expect(
          await projected(page, 'proposed'),
          `accepting everything after ${step.key}`
        ).toEqual(plain[index].tree);
        expect(
          await projected(page, 'accepted'),
          `rejecting everything after ${step.key}`
        ).toEqual(PAGE);
      }
      errors.assertNone();
    });
  }

  for (const [intent, key, caret, afterTyping] of [
    [
      'edit',
      'Backspace',
      { offset: 6, path: [0, 4], text: ' gamma' },
      [
        'Alpha |gone[delete:bob]| beta |theirs[insert:bob]| gammaab',
        '[delete] Struck block[delete:bob]',
        '[join] Plain line',
      ],
    ],
    [
      'edit',
      'Delete',
      { offset: 0, path: [2, 0], text: 'Plain line' },
      [
        'Alpha |gone[delete:bob]| beta |theirs[insert:bob]| gamma',
        '[delete] Struck block[delete:bob]',
        '[join] abPlain line',
      ],
    ],
    [
      'propose',
      'Backspace',
      { offset: 6, path: [0, 4], text: ' gamma' },
      [
        'Alpha |gone[delete:bob]| beta |theirs[insert:bob]| gamma|ab[insert:alice]',
        '[delete] Struck block[delete:bob]',
        '[join] Plain line',
      ],
    ],
    [
      'propose',
      'Delete',
      { offset: 0, path: [2, 0], text: 'Plain line' },
      [
        'Alpha |gone[delete:bob]| beta |theirs[insert:bob]| gamma',
        '[delete] Struck block[delete:bob]',
        '[join] ab[insert:alice]|Plain line',
      ],
    ],
  ] as const) {
    test(`${key} next to another author’s struck block records a join that waits on their deletion (${intent === 'edit' ? 'Editing' : 'Suggesting'})`, async ({
      page,
    }) => {
      const errors = recordBrowserRuntimeErrors(page, { strict: true });
      const editor = await open(page, intent);

      await editor.dom.clickTextOffset(
        key === 'Backspace'
          ? { offset: 0, path: [2, 0] }
          : { offset: 6, path: [0, 4] }
      );
      await editor.press(key);
      await editor.assert.collapsedModelDOMSelection({
        ...caret,
        path: [...caret.path],
      });
      await editor.type('ab');
      expect(await review(editor)).toEqual(afterTyping);
      errors.assertNone();
    });
  }

  // End puts the caret after the struck text, so the typed letters follow it.
  for (const [trigger, block] of [
    [
      '#',
      {
        type: 'heading',
        children: [
          {
            text: 'Second line',
            authored: [expect.objectContaining({ kind: 'delete' })],
          },
          {
            text: 'ab',
            authored: [expect.objectContaining({ kind: 'insert' })],
          },
        ],
      },
    ],
    [
      '>',
      {
        type: 'blockquote',
        children: [
          expect.objectContaining({
            children: [
              {
                text: 'Second line',
                authored: [expect.objectContaining({ kind: 'delete' })],
              },
              {
                text: 'ab',
                authored: [expect.objectContaining({ kind: 'insert' })],
              },
            ],
          }),
        ],
      },
    ],
  ] as const) {
    test(`a \`${trigger} \` input rule typed after a struck line converts the line in Suggesting`, async ({
      page,
    }) => {
      const errors = recordBrowserRuntimeErrors(page, { strict: true });
      const editor = await open(page, 'propose', 'page');

      await editor.dom.clickTextOffset({ offset: 11, path: [1, 0] });
      await press(editor, 'line delete');
      await editor.press('End');
      await editor.assert.collapsedModelDOMSelection({
        offset: 11,
        path: [1, 0],
        text: 'Second line',
      });
      await editor.type(`${trigger} `);
      await editor.type('ab');

      const value = (await editor.get.modelValue()) as {
        children: unknown[];
      };

      expect(value.children[1]).toMatchObject(block);
      errors.assertNone();
    });
  }
});
