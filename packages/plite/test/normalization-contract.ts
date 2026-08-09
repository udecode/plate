import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  getExtensionRegistry as editorGetExtensionRegistry,
  getSnapshot as editorGetSnapshot,
  isEditor as editorIsEditor,
  replace as editorReplace,
  setEditorChildren,
} from '@platejs/plite/internal';
import {
  createEditor,
  defineExtension,
  type Descendant,
  type Editor,
  ElementApi,
  type Element,
  PathApi,
  schema,
  SelectionApi,
  TextApi,
  type Value,
} from '@platejs/plite';
import { defineTestSchema } from './support/schema';

import {
  getActiveTransactionDocumentChange,
  withTransactionDocumentChangeObserver,
} from '../src/core/public-state';

describe('plite normalization contract', () => {
  it('repairs an invalid initial value through the maintenance API', () => {
    const editor = createEditor({
      initialValue: [{ type: 'block', children: [] } as Element],
    });

    assert.deepEqual(editor.read.children(), [{ type: 'block', children: [] }]);

    editor.update.value.repair();

    assert.deepEqual(editor.read.children(), [
      { type: 'block', children: [{ text: '' }] },
    ]);
  });

  it('repairs every root in stable maintenance scope', () => {
    const editor = createEditor({
      initialValue: {
        children: [{ type: 'block', children: [] } as Element],
        roots: {
          footer: [{ type: 'block', children: [] } as Element],
          header: [{ type: 'block', children: [] } as Element],
        },
      },
    });

    editor.update.value.repair();

    assert.deepEqual(editor.read.children(), [
      { type: 'block', children: [{ text: '' }] },
    ]);
    assert.deepEqual(editor.read.root('footer'), [
      { type: 'block', children: [{ text: '' }] },
    ]);
    assert.deepEqual(editor.read.root('header'), [
      { type: 'block', children: [{ text: '' }] },
    ]);
  });

  it('rejects repair inside an active update', () => {
    const editor = createEditor();

    assert.throws(
      () =>
        editor.update(() => {
          editor.update.value.repair();
        }),
      /editor\.update cannot be nested/
    );
  });

  it('does not publish a commit when repair finds no work', () => {
    const editor = createEditor({
      initialValue: [{ type: 'paragraph', children: [{ text: 'alpha' }] }],
    });
    let commits = 0;

    editor.subscribeCommit(() => {
      commits += 1;
    });
    editor.update.value.repair();

    assert.equal(commits, 0);
    assert.equal(editor.read.lastCommit(), null);
  });

  it('does not classify correction work when no corrections are installed', () => {
    const editor = createEditor({
      initialSelection: SelectionApi.text({
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 1 },
      }),
      initialValue: [{ type: 'paragraph', children: [{ text: 'a' }] }],
    });
    const profiledIds: string[] = [];
    const profilerGlobal = globalThis as typeof globalThis & {
      __PLITE_REACT_RENDER_PROFILER__?: {
        record?: (event: { id: string; kind: string }) => void;
      };
    };
    const previousProfiler = profilerGlobal.__PLITE_REACT_RENDER_PROFILER__;

    try {
      profilerGlobal.__PLITE_REACT_RENDER_PROFILER__ = {
        record(event) {
          if (event.kind === 'core-time') profiledIds.push(event.id);
        },
      };
      editor.update((tx) => tx.text.insert('!'));
    } finally {
      profilerGlobal.__PLITE_REACT_RENDER_PROFILER__ = previousProfiler;
    }

    assert.equal(profiledIds.includes('transaction-active-change'), false);
    assert.equal(profiledIds.includes('transaction-correct'), false);
    assert.equal(editor.read.text.string([]), 'a!');
  });

  it('repairs an empty block with an empty text child', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [{ type: 'block', children: [] } as Descendant],
      selection: null,
    });

    assert.deepEqual(editorGetSnapshot(editor).children, [
      { type: 'block', children: [{ text: '' }] },
    ]);
  });

  it('runs extension corrections in order before the built-in fallback', () => {
    const editor = createEditor();
    const seen: string[] = [];

    editor.install([
      defineExtension('first-correction', {
        corrections: [
          {
            event: 'content',
            correct({ entry }) {
              if (entry[1].join('.') === '0') {
                seen.push('first');
              }
            },
          },
        ],
      }),
      defineExtension('second-correction', {
        corrections: [
          {
            event: 'content',
            correct({ entry }) {
              if (entry[1].join('.') === '0') {
                seen.push('second');
              }
            },
          },
        ],
      }),
    ]);

    assert.equal(editorGetExtensionRegistry(editor).corrections.size, 2);

    editorReplace(editor, {
      children: [{ type: 'block', children: [] } as Descendant],
      selection: null,
    });

    assert.deepEqual(editorGetSnapshot(editor).children, [
      { type: 'block', children: [{ text: '' }] },
    ]);
    assert.deepEqual(seen.slice(0, 2), ['first', 'second']);
  });

  it('runs extension corrections during automatic update closeout', () => {
    const editor = createEditor({
      initialValue: [
        {
          type: 'paragraph',
          invalid: false,
          children: [{ text: 'alpha' }],
        },
      ],
    });

    editor.install(
      defineExtension('automatic-closeout-correction', {
        corrections: [
          {
            event: 'properties',
            correct({ entry, tx }) {
              const [node, path] = entry;

              if ('invalid' in node && node.invalid === true) {
                tx.nodes.set({ invalid: false }, { at: path });
              }
            },
          },
        ],
      })
    );

    editor.update.nodes.set({ invalid: true }, { at: [0] });

    assert.equal(editor.read.children()[0]?.invalid, false);
  });

  it('corrects an edited node after a later structural change shifts its path', () => {
    const editor = createEditor({
      initialValue: ['alpha', 'beta', 'gamma'].map((text) => ({
        type: 'paragraph',
        invalid: false,
        children: [{ text }],
      })),
    });

    editor.install(
      defineExtension('shifted-path-correction', {
        corrections: [
          {
            event: 'properties',
            correct({ entry, tx }) {
              const [node, path] = entry;

              if ('invalid' in node && node.invalid === true) {
                tx.nodes.set({ invalid: false }, { at: path });
              }
            },
          },
        ],
      })
    );

    editor.update((tx) => {
      tx.nodes.set({ invalid: true }, { at: [2] });
      tx.nodes.insert(
        {
          type: 'paragraph',
          invalid: false,
          children: [{ text: 'inserted' }],
        },
        { at: [0] }
      );
    });

    assert.equal(editor.read.children()[3]?.invalid, false);
  });

  it('runs extension corrections for directly applied document changes', () => {
    const initialValue = [
      {
        type: 'paragraph',
        invalid: false,
        children: [{ text: 'alpha' }],
      },
    ];
    const source = createEditor({ initialValue });

    source.update.nodes.set({ invalid: true }, { at: [0] });

    const change = source.read.lastCommit()?.changes;

    assert.ok(change);

    const editor = createEditor({ initialValue });

    editor.install(
      defineExtension('direct-change-correction', {
        corrections: [
          {
            event: 'properties',
            correct({ entry, tx }) {
              const [node, path] = entry;

              if ('invalid' in node && node.invalid === true) {
                tx.nodes.set({ invalid: false }, { at: path });
              }
            },
          },
        ],
      })
    );
    editor.update((tx) => {
      tx.changes.apply(change);
    });

    assert.equal(editor.read.children()[0]?.invalid, false);
  });

  it('constructs adjacent text as one canonical write', () => {
    const editor = createEditor({
      initialValue: [
        {
          type: 'paragraph',
          children: [
            { text: 'al', bold: true },
            { text: 'pha', bold: false },
          ],
        },
      ],
    });

    editor.update.nodes.set({ bold: true }, { at: [0, 1] });

    assert.deepEqual(editor.read.children(), [
      {
        type: 'paragraph',
        children: [{ text: 'alpha', bold: true }],
      },
    ]);
  });

  it('keeps primitive boundaries private and publishes one canonical value', () => {
    const editor = createEditor({
      initialValue: [
        {
          type: 'paragraph',
          children: [
            { bold: true, italic: false, text: 'al' },
            { bold: false, italic: false, text: 'pha' },
          ],
        },
      ],
    });

    editor.update((tx) => {
      tx.nodes.set({ bold: true }, { at: [0, 1] });

      const paragraph = tx.value().children[0];
      assert.ok(paragraph && ElementApi.isElement(paragraph));
      assert.deepEqual(paragraph.children, [
        { bold: true, italic: false, text: 'al' },
        { bold: true, italic: false, text: 'pha' },
      ]);

      tx.nodes.set({ italic: true }, { at: [0, 0] });
      tx.nodes.set({ italic: true }, { at: [0, 1] });
    });

    assert.deepEqual(editor.read.children(), [
      {
        type: 'paragraph',
        children: [{ bold: true, italic: true, text: 'alpha' }],
      },
    ]);
  });

  it('preserves the caret inside text merged during automatic canonicalization', () => {
    const editor = createEditor({
      initialValue: [
        {
          type: 'paragraph',
          children: [{ bold: true, text: 'rich' }],
        },
      ],
    });
    const insertion = {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 2 },
    };

    editor.update((tx) => {
      tx.nodes.insert(
        { bold: true, text: 'すし' },
        { at: insertion, select: true }
      );
    });

    assert.deepEqual(editor.read.children(), [
      {
        type: 'paragraph',
        children: [{ bold: true, text: 'riすしch' }],
      },
    ]);
    assert.deepEqual(editor.read.selection(), {
      kind: 'text',
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 4 },
    });
  });

  it('does not normalize halfway through a multi-node unwrap', () => {
    const editor = createEditor();
    let sawPartiallyUnwrappedTree = false;

    editor.install(
      defineExtension('unwrap-correction-spy', {
        schema: defineTestSchema('unwrap-correction-schema', {
          link: { inline: true },
        }).schema,
        corrections: [
          {
            event: 'children',
            query: 'root',
            correct({ tx }) {
              const paragraph = tx.value().children[0];

              if (paragraph && 'children' in paragraph) {
                const linkCount = paragraph.children.filter(
                  (child) => 'type' in child && child.type === 'link'
                ).length;

                if (linkCount === 1) {
                  sawPartiallyUnwrappedTree = true;
                }
              }
            },
          },
        ],
      })
    );
    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [
            { type: 'link', children: [{ text: 'one' }] },
            { type: 'link', children: [{ text: 'two' }] },
          ],
        },
      ],
      selection: null,
    });
    sawPartiallyUnwrappedTree = false;

    editor.update.nodes.unwrap({
      at: [0],
      match: (node) => 'type' in node && node.type === 'link',
      mode: 'all',
    });

    assert.equal(sawPartiallyUnwrappedTree, false);
    assert.equal(editor.read.text.string([]), 'onetwo');
  });

  it('routes root and node correction queries to their matching entries', () => {
    const editor = createEditor();
    const seen: string[] = [];

    editor.install(
      defineExtension('split-corrections', {
        corrections: [
          {
            event: 'children',
            query: 'root',
            correct() {
              seen.push('editor');
            },
          },
          {
            event: 'content',
            correct({ entry }) {
              seen.push(`node:${entry[1].join('.')}`);
            },
          },
        ],
      })
    );

    editorReplace(editor, {
      children: [{ type: 'block', children: [] } as Descendant],
      selection: null,
    });

    assert.deepEqual(editorGetSnapshot(editor).children, [
      { type: 'block', children: [{ text: '' }] },
    ]);
    assert.equal(seen.includes('editor'), true);
    assert.equal(seen.includes('node:'), false);
    assert.equal(seen.includes('node:0'), true);
  });

  it('classifies composed writes and visits only their event-indexed targets', () => {
    const blockCount = 20_000;
    const last = blockCount - 1;
    const visits = {
      children: [] as string[],
      content: [] as string[],
      properties: [] as string[],
    };
    let classification:
      | {
          paths: readonly (readonly number[])[];
          properties: boolean;
          structure: boolean;
          text: boolean;
        }
      | null
      | undefined;
    const editor = createEditor({
      initialValue: Array.from({ length: blockCount }, (_value, index) => ({
        type: 'paragraph',
        children: [{ text: `line ${index}` }],
      })),
    });

    editor.install(
      defineExtension('composed-sparse-correction-proof', {
        corrections: [
          {
            event: 'children',
            query: { type: 'paragraph' },
            correct({ entry: [, path] }) {
              visits.children.push(path.join('.'));
            },
          },
          {
            event: 'content',
            query: { type: 'paragraph' },
            correct({ entry: [, path] }) {
              visits.content.push(path.join('.'));
            },
          },
          {
            event: 'properties',
            query: { type: 'paragraph' },
            correct({ entry: [, path] }) {
              visits.properties.push(path.join('.'));
              classification ??=
                getActiveTransactionDocumentChange(
                  editor
                ).primaryClassification;
            },
          },
        ],
      })
    );

    editor.update((tx) => {
      tx.nodes.set({ probe: 'first' }, { at: [0] });
      tx.nodes.set({ probe: 'last' }, { at: [last] });
    });

    assert.equal(classification?.properties, true);
    assert.equal(classification?.structure, false);
    assert.equal(classification?.text, false);
    assert.equal(
      classification?.paths.some((path) => PathApi.equals(path, [0])),
      true
    );
    assert.equal(
      classification?.paths.some((path) => PathApi.equals(path, [last])),
      true
    );
    assert.deepEqual(visits.properties.sort(), ['0', String(last)]);
    assert.deepEqual(visits.content.sort(), ['0', String(last)]);
    assert.deepEqual(visits.children, []);
  });

  it('scopes nested transaction change observers and cleans up after throws', () => {
    const editor = createEditor({
      initialValue: [
        { type: 'paragraph', children: [{ text: 'body' }] } as Element,
      ],
    });
    let scopedCalls = 0;
    let throwingCalls = 0;
    const scopedListener = () => {
      scopedCalls++;
    };

    editor.update((tx) => {
      withTransactionDocumentChangeObserver(editor, scopedListener, () => {
        tx.nodes.set({ first: true }, { at: [0] });

        withTransactionDocumentChangeObserver(editor, scopedListener, () =>
          tx.nodes.set({ nested: true }, { at: [0] })
        );

        assert.throws(
          () =>
            withTransactionDocumentChangeObserver(
              editor,
              () => {
                throwingCalls++;
              },
              () => {
                tx.nodes.set({ throwing: true }, { at: [0] });
                throw new Error('observer scope failed');
              }
            ),
          /observer scope failed/
        );

        tx.nodes.set({ afterThrow: true }, { at: [0] });
      });

      tx.nodes.set({ outside: true }, { at: [0] });
    });

    assert.equal(scopedCalls, 5);
    assert.equal(throwingCalls, 1);
  });

  it('uses extension-local correction ids for same-lane registration', () => {
    const editor = createEditor();
    const seen: string[] = [];

    editor.install([
      defineExtension('same-lane-a', {
        corrections: [
          {
            event: 'content',
            correct({ entry }) {
              if (entry[1].join('.') === '0') {
                seen.push('a');
              }
            },
          },
        ],
      }),
      defineExtension('same-lane-b', {
        corrections: [
          {
            event: 'content',
            correct({ entry }) {
              if (entry[1].join('.') === '0') {
                seen.push('b');
              }
            },
          },
        ],
      }),
    ]);

    assert.deepEqual(
      [...editorGetExtensionRegistry(editor).corrections.keys()],
      ['same-lane-a:corrections.0', 'same-lane-b:corrections.0']
    );

    editorReplace(editor, {
      children: [{ type: 'block', children: [] } as Descendant],
      selection: null,
    });

    assert.deepEqual(seen.slice(0, 2), ['a', 'b']);
  });

  it('provides a scoped correction tx for one-repair reruns', () => {
    const editor = createEditor();
    let rootCalls = 0;

    editor.install(
      defineExtension('layout-correction', {
        corrections: [
          {
            event: 'children',
            query: 'root',
            correct({ tx }) {
              rootCalls += 1;
              assert.equal(tx.schema.isInline(tx.nodes.children()[0]), false);

              if (tx.nodes.children().length < 2) {
                tx.nodes.insert(
                  {
                    type: 'paragraph',
                    children: [{ text: '' }],
                  } as Descendant,
                  { at: [1] }
                );
                return;
              }
            },
          },
        ],
      })
    );

    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'alpha' }],
        } as Descendant,
      ],
      selection: null,
    });

    assert.deepEqual(editorGetSnapshot(editor).children, [
      {
        type: 'paragraph',
        children: [{ text: 'alpha' }],
      },
      {
        type: 'paragraph',
        children: [{ text: '' }],
      },
    ]);
    assert.equal(rootCalls >= 2, true);
  });

  it('preserves installed transaction groups in correction tx', () => {
    let correctionCalls = 0;
    const listExtension = defineExtension('list', {
      update({ tx }) {
        return {
          hasInvalid: () =>
            tx.nodes
              .children()
              .some((node) => 'invalid' in node && node.invalid === true),
          repair: () => tx.nodes.set({ invalid: false }, { at: [0] }),
        };
      },
    });
    const correctionExtension = defineExtension('list-correction', {
      corrections: [
        {
          event: 'properties',
          correct({ entry, tx }) {
            const [node, path] = entry;

            if (
              path.length === 1 &&
              'invalid' in node &&
              node.invalid === true
            ) {
              correctionCalls += 1;
              assert.equal(tx.list.hasInvalid(), true);
              tx.list.repair();
            }
          },
        },
      ],
      dependencies: [listExtension] as const,
    });
    const editor = createEditor({
      extensions: [correctionExtension] as const,
      initialValue: [
        {
          type: 'paragraph',
          invalid: false,
          children: [{ text: 'alpha' }],
        },
      ],
    });

    editor.update.nodes.set({ invalid: true }, { at: [0] });

    assert.equal(editor.read.children()[0]?.invalid, false);
    assert.equal(correctionCalls, 1);
  });

  it('cleans up extension corrections', () => {
    const editor = createEditor();
    let calls = 0;

    const unextend = editor.install(
      defineExtension('temporary-correction', {
        corrections: [
          {
            event: 'content',
            correct() {
              calls += 1;
            },
          },
        ],
      })
    );

    editorReplace(editor, {
      children: [
        { type: 'paragraph', children: [{ text: 'value' }] } as Descendant,
      ],
      selection: null,
    });

    assert.equal(calls > 0, true);

    unextend();
    calls = 0;

    editor.update.value.repair();

    assert.equal(editorGetExtensionRegistry(editor).corrections.size, 0);
    assert.equal(calls, 0);
  });

  it('fits stray top-level text through the derived root default', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        { text: 'one' } as Descendant,
        { type: 'block', children: [{ text: 'two' }] } as Descendant,
        { text: 'three' } as Descendant,
        { type: 'block', children: [{ text: 'four' }] } as Descendant,
      ],
      selection: null,
    });

    assert.deepEqual(editorGetSnapshot(editor).children, [
      { type: 'paragraph', children: [{ text: 'one' }] },
      { type: 'block', children: [{ text: 'two' }] },
      { type: 'paragraph', children: [{ text: 'three' }] },
      { type: 'block', children: [{ text: 'four' }] },
    ]);
  });

  it('removes stray top-level text during node-op block-only cleanup', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        {
          type: 'block',
          children: [{ text: 'alpha' }],
        },
        {
          type: 'block',
          children: [{ text: 'beta' }],
        },
      ] as Element[],
      selection: null,
    });

    editor.update((tx) => {
      tx.nodes.insert({ text: 'stray' }, { at: [0] });
    });

    assert.deepEqual(editorGetSnapshot(editor).children, [
      {
        type: 'block',
        children: [{ text: 'alpha' }],
      },
      {
        type: 'block',
        children: [{ text: 'beta' }],
      },
    ]);
  });

  it('explicitly merges adjacent compatible text children in inline-style containers', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [
            { text: 'al', bold: true },
            { text: 'pha', bold: true },
          ],
        },
      ] as Element[],
      selection: null,
    });

    editor.update.value.repair();

    assert.deepEqual(editorGetSnapshot(editor).children, [
      {
        type: 'paragraph',
        children: [{ text: 'alpha', bold: true }],
      },
    ]);
  });

  it('explicitly removes empty adjacent text in inline-style containers', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [
            { text: 'alpha', bold: true },
            { text: '', bold: true },
            { text: 'beta', bold: true },
          ],
        },
      ] as Element[],
      selection: null,
    });

    editor.update.value.repair();

    assert.deepEqual(editorGetSnapshot(editor).children, [
      {
        type: 'paragraph',
        children: [{ text: 'alphabeta', bold: true }],
      },
    ]);
  });

  it('flattens a direct block child inserted into an inline-style container without merging unrelated text runs', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [
            { text: 'alpha', bold: true },
            { text: 'gamma', italic: true },
          ],
        },
      ] as Element[],
      selection: null,
    });

    editor.update((tx) => {
      tx.nodes.insert(
        {
          type: 'paragraph',
          children: [{ text: 'beta' }],
        } as Descendant,
        { at: [0, 1] }
      );
    });

    assert.deepEqual(editorGetSnapshot(editor).children, [
      {
        type: 'paragraph',
        children: [
          { text: 'alpha', bold: true },
          { text: 'beta' },
          { text: 'gamma', italic: true },
        ],
      },
    ]);
  });

  it('fails deterministically when a correction revisits an earlier draft state', () => {
    const editor = createEditor();

    editor.install(
      defineExtension('cycling-correction', {
        corrections: [
          {
            event: 'children',
            query: 'root',
            correct({ tx }) {
              if (tx.nodes.children().length === 1) {
                tx.nodes.insert(
                  {
                    type: 'paragraph',
                    children: [{ text: '' }],
                  },
                  { at: [1] }
                );
                return;
              }

              tx.nodes.remove({ at: [1] });
            },
          },
        ],
      })
    );

    assert.throws(() => {
      editor.update((tx) => {
        tx.value.replace({
          children: [
            {
              type: 'paragraph',
              children: [{ text: 'alpha' }],
            },
          ],
          selection: null,
        });
      });
    }, /Structural correction cycle/);
  });

  it('rechecks a corrected node until it reaches fixpoint', () => {
    const editor = createEditor();

    editor.install(
      defineExtension('multi-pass-correction', {
        corrections: [
          {
            event: 'content',
            correct({ entry: [node, path], tx }) {
              if (
                path.length === 1 &&
                !editorIsEditor(node) &&
                'children' in node &&
                node.type === 'heading'
              ) {
                tx.nodes.set({ type: 'paragraph' }, { at: path });
                return;
              }

              if (
                path.length === 1 &&
                !editorIsEditor(node) &&
                'children' in node &&
                node.type === 'paragraph' &&
                (node as Element & { normalized?: boolean }).normalized !== true
              ) {
                tx.nodes.set({ normalized: true }, { at: path });
              }
            },
          },
        ],
      })
    );

    editor.update((tx) => {
      tx.value.replace({
        children: [
          {
            type: 'heading',
            children: [{ text: 'alpha' }],
          },
        ],
        selection: null,
      });
    });

    assert.deepEqual(editorGetSnapshot(editor).children, [
      {
        type: 'paragraph',
        normalized: true,
        children: [{ text: 'alpha' }],
      },
    ]);
  });

  it('converges to the same fixed point across correction registration order', () => {
    const create = (reverse: boolean) => {
      const contentCorrection = defineExtension('order-independent-content', {
        corrections: [
          {
            event: 'content',
            correct({ entry: [node, path], tx }) {
              if (
                path.length === 1 &&
                ElementApi.isElement(node) &&
                node.type === 'draft'
              ) {
                tx.nodes.set({ type: 'paragraph' }, { at: path });
              }
            },
          },
        ],
      });
      const propertyCorrection = defineExtension(
        'order-independent-properties',
        {
          corrections: [
            {
              event: 'properties',
              correct({ entry: [node, path], tx }) {
                if (
                  path.length === 1 &&
                  ElementApi.isElement(node) &&
                  node.type === 'paragraph' &&
                  node.ready !== true
                ) {
                  tx.nodes.set({ ready: true }, { at: path });
                }
              },
            },
          ],
        }
      );
      const editor = createEditor();

      editor.install(
        reverse
          ? [propertyCorrection, contentCorrection]
          : [contentCorrection, propertyCorrection]
      );
      editor.update((tx) => {
        tx.value.replace({
          children: [
            { type: 'draft', children: [{ text: 'alpha' }] } as Element,
          ],
          selection: null,
        });
      });

      return editor.read.children();
    };

    assert.deepEqual(create(false), create(true));
    assert.deepEqual(create(false), [
      {
        type: 'paragraph',
        ready: true,
        children: [{ text: 'alpha' }],
      },
    ]);
  });

  it('enqueues nodes generated by a correction', () => {
    const editor = createEditor();

    editor.install(
      defineExtension('generated-target-corrections', {
        corrections: [
          {
            event: 'children',
            query: 'root',
            correct({ tx }) {
              if (
                tx.nodes
                  .children()
                  .some(
                    (child) =>
                      ElementApi.isElement(child) && child.type === 'generated'
                  )
              ) {
                return;
              }

              tx.nodes.insert(
                { type: 'generated', children: [{ text: 'new' }] },
                { at: [1] }
              );
            },
          },
          {
            event: 'content',
            correct({ entry: [node, path], tx }) {
              if (
                ElementApi.isElement(node) &&
                node.type === 'generated' &&
                node.ready !== true
              ) {
                tx.nodes.set({ ready: true }, { at: path });
              }
            },
          },
        ],
      })
    );
    editor.update((tx) => {
      tx.value.replace({
        children: [
          { type: 'paragraph', children: [{ text: 'alpha' }] } as Element,
        ],
        selection: null,
      });
    });

    assert.deepEqual(editor.read.children(), [
      { type: 'paragraph', children: [{ text: 'alpha' }] },
      { type: 'generated', ready: true, children: [{ text: 'new' }] },
    ]);
  });

  it('rechecks parent cardinality after a child correction', () => {
    const editor = createEditor();

    editor.install(
      defineExtension('parent-cardinality-corrections', {
        corrections: [
          {
            event: 'properties',
            correct({ entry: [node, path], tx }) {
              if (
                ElementApi.isElement(node) &&
                node.type === 'slot' &&
                node.remove === true
              ) {
                tx.nodes.remove({ at: path });
              }
            },
          },
          {
            event: 'children',
            correct({ entry: [node, path], tx }) {
              if (
                ElementApi.isElement(node) &&
                node.type === 'pair' &&
                node.children.length < 2
              ) {
                tx.nodes.insert(
                  { type: 'slot', children: [{ text: 'replacement' }] },
                  { at: [...path, node.children.length] }
                );
              }
            },
          },
        ],
      })
    );
    editor.update((tx) => {
      tx.value.replace({
        children: [
          {
            type: 'pair',
            children: [
              { type: 'slot', children: [{ text: 'first' }] },
              { type: 'slot', children: [{ text: 'second' }] },
            ],
          } as Element,
        ],
        selection: null,
      });
    });

    editor.update.nodes.set({ remove: true }, { at: [0, 1] });

    assert.deepEqual(editor.read.children(), [
      {
        type: 'pair',
        children: [
          { type: 'slot', children: [{ text: 'first' }] },
          { type: 'slot', children: [{ text: 'replacement' }] },
        ],
      },
    ]);
  });

  it('schedules a created root and skips a deleted root', () => {
    const editor = createEditor();
    let rootCalls = 0;

    editor.install(
      defineExtension('root-lifecycle-correction', {
        corrections: [
          {
            event: 'children',
            query: 'root',
            correct({ tx }) {
              rootCalls += 1;

              if (tx.nodes.children().length === 0) {
                tx.nodes.insert(
                  { type: 'paragraph', children: [{ text: 'default' }] },
                  { at: [0] }
                );
              }
            },
          },
        ],
      })
    );
    editor.update((tx) => {
      tx.roots.create('sidebar', []);
    });

    assert.deepEqual(editor.read.root('sidebar'), [
      { type: 'paragraph', children: [{ text: 'default' }] },
    ]);
    assert.equal(rootCalls > 0, true);

    rootCalls = 0;
    editor.update((tx) => {
      tx.roots.delete('sidebar');
    });

    assert.equal(rootCalls, 0);
  });

  it('reports correction cycles with a deterministic transition fingerprint', () => {
    const cycleMessage = () => {
      const editor = createEditor();

      editor.install(
        defineExtension('deterministic-cycle', {
          corrections: [
            {
              event: 'children',
              query: 'root',
              correct({ tx }) {
                if (tx.nodes.children().length === 1) {
                  tx.nodes.insert(
                    { type: 'paragraph', children: [{ text: '' }] },
                    { at: [1] }
                  );
                  return;
                }

                tx.nodes.remove({ at: [1] });
              },
            },
          ],
        })
      );

      try {
        editor.update((tx) => {
          tx.value.replace({
            children: [
              { type: 'paragraph', children: [{ text: 'alpha' }] } as Element,
            ],
            selection: null,
          });
        });
      } catch (error) {
        assert.ok(error instanceof Error);
        return error.message;
      }

      assert.fail('expected structural correction cycle');
    };

    const first = cycleMessage();

    assert.match(first, /Structural correction cycle/);
    assert.equal(cycleMessage(), first);
  });

  it('runs one fixed-point worklist per document root', () => {
    const editor = createEditor({
      initialValue: {
        children: [
          {
            type: 'paragraph',
            invalid: true,
            children: [{ text: 'main' }],
          },
        ],
        roots: {
          footer: [
            {
              type: 'paragraph',
              invalid: true,
              children: [{ text: 'footer' }],
            },
          ],
        },
      },
    });

    editor.install(
      defineExtension('multi-root-correction', {
        corrections: [
          {
            event: 'properties',
            correct({ entry: [node, path], tx }) {
              if (ElementApi.isElement(node) && node.invalid === true) {
                tx.nodes.set({ invalid: false }, { at: path });
              }
            },
          },
        ],
      })
    );
    editor.update.value.repair();

    assert.equal(editor.read.children()[0]?.invalid, false);
    assert.equal(editor.read.root('footer')[0]?.invalid, false);
  });

  it('targets changed ancestry in a 10k-block document', () => {
    const target = 5000;
    const visits: number[] = [];
    const editor = createEditor({
      initialValue: Array.from({ length: 10_000 }, (_value, index) => ({
        type: 'paragraph',
        children: [{ text: `line ${index}` }],
      })),
    });

    editor.install(
      defineExtension('large-document-target-probe', {
        corrections: [
          {
            event: 'properties',
            correct({ entry: [node, path] }) {
              if (path.length === 1 && ElementApi.isElement(node)) {
                visits.push(path[0]!);
              }
            },
          },
        ],
      })
    );
    editor.update.nodes.set({ inspected: true }, { at: [target] });

    assert.deepEqual(visits, [target]);
  });

  it('keeps the transaction snapshot index sparse during content correction', () => {
    const createCorrectingEditor = (name: string) => {
      const visits: string[] = [];
      const editor = createEditor({
        initialSelection: SelectionApi.text({
          anchor: { path: [50, 0], offset: 2 },
          focus: { path: [50, 0], offset: 2 },
        }),
        initialValue: Array.from({ length: 100 }, (_value, index) => ({
          type: 'paragraph',
          children: [{ text: `line ${index}` }],
        })),
      });

      editor.install(
        defineExtension(name, {
          corrections: [
            {
              event: 'content',
              correct({ entry: [, path] }) {
                visits.push(path.join('.'));
              },
            },
          ],
        })
      );

      return { editor, visits };
    };
    const cold = createCorrectingEditor('cold-runtime-index-probe');
    const warm = createCorrectingEditor('warm-runtime-index-probe');
    const profiledIds: string[] = [];
    const profilerGlobal = globalThis as typeof globalThis & {
      __PLITE_REACT_RENDER_PROFILER__?: {
        record?: (event: { id: string; kind: string }) => void;
      };
    };
    const previousProfiler = profilerGlobal.__PLITE_REACT_RENDER_PROFILER__;

    void warm.editor.read.runtime.snapshot().index.keyAt([0]);

    try {
      profilerGlobal.__PLITE_REACT_RENDER_PROFILER__ = {
        record(event) {
          if (event.kind === 'core-time') profiledIds.push(event.id);
        },
      };

      cold.editor.update((tx) => tx.text.insert('x'));

      assert.equal(
        profiledIds.filter((id) => id === 'runtime-index-full-build').length,
        0
      );
      assert.equal(
        profiledIds.filter((id) => id === 'transaction-node-keys').length,
        1
      );
      assert.deepEqual(cold.visits, ['50', '50.0']);

      profiledIds.length = 0;
      warm.editor.update((tx) => tx.text.insert('x'));

      assert.equal(
        profiledIds.filter((id) => id === 'runtime-index-full-build').length,
        0
      );
      assert.equal(
        profiledIds.filter((id) => id === 'transaction-node-keys').length,
        1
      );
      assert.deepEqual(warm.visits, ['50', '50.0']);

      profiledIds.length = 0;
      const nodeKey = warm.editor.key([50]);

      assert.ok(nodeKey);
      assert.deepEqual(warm.editor.read.nodes.path(nodeKey), [50]);
      assert.equal(
        profiledIds.filter((id) => id === 'runtime-index-full-build').length,
        0
      );
    } finally {
      profilerGlobal.__PLITE_REACT_RENDER_PROFILER__ = previousProfiler;
    }
  });

  it('converges malformed inline-content trees to structural invariants', () => {
    const random = (seed: number) => {
      let state = seed;

      return () => {
        state = (state * 1_664_525 + 1_013_904_223) >>> 0;

        return state / 0x1_00_00_00_00;
      };
    };
    const assertCorrected = <
      V extends Value,
      TExtensions extends readonly unknown[],
    >(
      editor: Editor<V, TExtensions>,
      node: Element,
      path: readonly number[]
    ) => {
      assert.ok(node.children.length > 0, `empty element at [${path}]`);

      const inlineContent =
        editor.read.schema.isInline(node) ||
        TextApi.isText(node.children[0]) ||
        (ElementApi.isElement(node.children[0]) &&
          editor.read.schema.isInline(node.children[0]));

      node.children.forEach((child, index) => {
        if (inlineContent) {
          assert.ok(
            TextApi.isText(child) ||
              (ElementApi.isElement(child) &&
                editor.read.schema.isInline(child)),
            `block child in inline content at [${[...path, index]}]`
          );
        } else {
          assert.ok(
            ElementApi.isElement(child) && !editor.read.schema.isInline(child),
            `inline child in block content at [${[...path, index]}]`
          );
        }

        if (ElementApi.isElement(child)) {
          assertCorrected(editor, child, [...path, index]);
        }
      });

      if (!inlineContent) return;

      node.children.forEach((child, index) => {
        if (
          !ElementApi.isElement(child) ||
          !editor.read.schema.isInline(child)
        ) {
          return;
        }

        assert.ok(TextApi.isText(node.children[index - 1]));
        assert.ok(TextApi.isText(node.children[index + 1]));
      });

      for (let index = 1; index < node.children.length; index++) {
        const previous = node.children[index - 1]!;
        const child = node.children[index]!;

        assert.equal(
          TextApi.isText(previous) &&
            TextApi.isText(child) &&
            TextApi.equals(previous, child, { loose: true }),
          false,
          `joinable text siblings at [${path}]`
        );
      }
    };

    for (let seed = 1; seed <= 64; seed++) {
      const next = random(seed);
      const text = (value: string) => ({
        ...(next() > 0.5 ? { bold: true } : {}),
        text: value,
      });
      const inline = (value: string): Element => ({
        type: 'inline',
        children: [{ text: value }],
      });
      const editor = createEditor({
        extensions: [
          defineTestSchema(`malformed-fuzz-schema-${seed}`, {
            empty: {
              content: schema.content.text({ default: 'text', min: 1 }),
            },
            inline: { inline: true },
            nested: {},
          }),
        ],
      });
      const children: Descendant[] = [
        {
          type: 'block',
          children:
            next() > 0.5
              ? [
                  text(next() > 0.5 ? '' : 'a'),
                  { type: 'nested', children: [] },
                  inline('i'),
                  text('b'),
                  text('c'),
                ]
              : [
                  text(''),
                  { type: 'nested', children: [] },
                  text('a'),
                  inline('i'),
                  { type: 'nested', children: [text('b')] },
                ],
        },
        { type: 'empty', children: [] },
      ];

      editor.update(() => {
        setEditorChildren(editor, children);
      });

      editor.read.children().forEach((node, index) => {
        assert.ok(ElementApi.isElement(node));
        assert.equal(editor.read.schema.isInline(node), false);
        assertCorrected(editor, node, [index]);
      });
    }
  });
});
