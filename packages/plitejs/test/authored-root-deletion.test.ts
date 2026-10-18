import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  authoredVeto,
  ContentSlice,
  createEditor,
  createEditorView,
  defineCommand,
  defineEditorSchema,
  defineEffect,
  definePlugin,
  definePluginSlot,
  DocumentChange,
  editorCommands,
  schema,
  SelectionApi,
  txLocate,
} from 'plitejs';
import { dataTransferFormats, dom } from 'plitejs/dom';
import { History, history } from 'plitejs/history';

import { createAuthoredPlugin } from '../src/authored/authored';
import { putVerdicts } from '../src/authored/facts/records';
import { projectAuthoredDocument } from '../src/authored/format';
import { getCompiledEditorSchema } from '../src/core/plugin-registry';
import { recordOpsToJson } from '../src/core/record-store';
import { getEditorAuthoredDocumentCapability } from '../src/create-editor';
import { reviewRecords } from './support/authored';

class FakeDataTransfer {
  private readonly store = new Map<string, string>();

  get types() {
    return [...this.store.keys()];
  }

  getData(type: string) {
    return this.store.get(type) ?? '';
  }

  setData(type: string, value: string) {
    this.store.set(type, value);
  }
}

type Unknown = 'preserve' | 'reject';

const p = (text: string) => ({
  type: 'paragraph' as const,
  children: [{ text }],
});
const card = (root: string, text = 'C') => ({
  type: 'card',
  childRoots: { body: root },
  children: [{ text }],
});
const text = () => schema.content.text({ default: 'text', min: 1 });
const paragraphs = () =>
  schema.content.type('paragraph', { default: { type: 'paragraph' }, min: 1 });

const SCHEMAS = new Map<string, unknown>();
const defineOnce = (name: string, define: () => unknown) => {
  let defined = SCHEMAS.get(name);

  if (!defined) {
    defined = define();
    SCHEMAS.set(name, defined);
  }

  return defined;
};
const cards = (
  unknown: Unknown,
  ownership: 'exclusive' | 'shared' = 'exclusive'
) => {
  const name = `authored-root-deletion:${unknown}:${ownership}`;
  return defineOnce(name, () =>
    defineEditorSchema(name, {
      elements: {
        card: {
          content: text(),
          contentRoots: { body: { content: paragraphs(), ownership } },
        },
        paragraph: { content: text() },
      },
      root: schema.content.types(['paragraph', 'card'], {
        default: { type: 'paragraph' },
        min: 1,
      }),
      unknown,
    })
  );
};

const quoted = () =>
  defineOnce('authored-root-deletion:quoted', () =>
    defineEditorSchema('authored-root-deletion:quoted', {
      elements: {
        card: {
          content: text(),
          contentRoots: {
            body: {
              content: schema.content.types(['paragraph', 'quote'], {
                default: { type: 'paragraph' },
                min: 1,
              }),
              ownership: 'exclusive',
            },
          },
        },
        paragraph: { content: text() },
        quote: { content: text() },
      },
      root: schema.content.types(['paragraph', 'card'], {
        default: { type: 'paragraph' },
        min: 1,
      }),
      unknown: 'reject',
    })
  );

const decks = () =>
  defineOnce('authored-root-deletion:decks', () =>
    defineEditorSchema('authored-root-deletion:decks', {
      elements: {
        card: {
          content: text(),
          contentRoots: {
            body: { content: paragraphs(), ownership: 'exclusive' },
          },
        },
        deck: {
          content: text(),
          contentRoots: {
            body: { content: paragraphs(), ownership: 'shared' },
          },
        },
        paragraph: { content: text() },
      },
      root: schema.content.types(['paragraph', 'card', 'deck'], {
        default: { type: 'paragraph' },
        min: 1,
      }),
      unknown: 'preserve',
    })
  );

const chip = (root: string) => ({
  type: 'chip',
  childRoots: { note: root },
  children: [{ text: 'k' }],
});

const owners = (unknown: Unknown) => {
  const name = `authored-root-deletion:owners:${unknown}`;
  return defineOnce(name, () => {
    const area = () => ({
      content: paragraphs(),
      ownership: 'exclusive' as const,
    });
    const inline = () =>
      schema.content.any([schema.content.text(), schema.content.type('chip')]);
    const blocks = () =>
      schema.content.types(['card', 'paragraph'], {
        default: { type: 'paragraph' },
        min: 1,
      });

    return defineEditorSchema(name, {
      elements: {
        card: { content: inline(), contentRoots: { body: area() } },
        chip: { content: text(), contentRoots: { note: area() }, inline: true },
        group: { content: blocks() },
        note: { content: text(), contentRoots: { body: area() } },
        panel: { content: blocks(), contentRoots: { body: area() } },
        paragraph: { content: inline() },
        wide: {
          content: text(),
          contentRoots: { aside: area(), body: area() },
        },
      },
      root: schema.content.types(
        ['paragraph', 'card', 'wide', 'note', 'panel', 'group'],
        { default: { type: 'paragraph' }, min: 1 }
      ),
      unknown,
    });
  });
};

const nesting = () => {
  const name = 'authored-root-deletion:nesting';
  return defineOnce(name, () => {
    const blocks = () =>
      schema.content.types(['paragraph', 'card', 'tile'], {
        default: { type: 'paragraph' },
        min: 1,
      });

    return defineEditorSchema(name, {
      elements: {
        card: {
          content: text(),
          contentRoots: { body: { content: blocks(), ownership: 'exclusive' } },
        },
        paragraph: { content: text() },
        tile: {
          content: text(),
          contentRoots: { body: { content: blocks(), ownership: 'shared' } },
        },
      },
      root: blocks(),
      unknown: 'reject',
    });
  });
};
const tile = (root: string) => ({
  type: 'tile',
  childRoots: { body: root },
  children: [{ text: 'T' }],
});

const carried = () =>
  ContentSlice.fromJSON({
    content: [card('b2')],
    openEnd: 0,
    openStart: 0,
    roots: { b2: [p('X')] },
  });

type Options = Readonly<{
  authorId?: string;
  usedChangeIds?: number;
  intent?: 'edit' | 'propose';
  plugins?: readonly unknown[];
  schema?: unknown;
  selection?: unknown;
  unknown: Unknown;
  value: unknown;
}>;

const make = ({
  authorId = 'bob',
  usedChangeIds = 0,
  intent = 'propose',
  plugins = [],
  schema: editorSchema,
  selection,
  unknown,
  value,
}: Options) => {
  let ids = usedChangeIds;
  const editor = createEditor({
    initialSelection: selection as never,
    initialValue: value as never,
    plugins: [
      editorSchema ?? cards(unknown),
      ...plugins,
      dom(),
      dataTransferFormats('authored-root-deletion-formats', [
        {
          decode: carried,
          key: 'carried',
          mimeType: 'application/x-carried',
        },
      ]),
      createAuthoredPlugin({
        authorId,
        createChangeId: () => `${authorId}:${(ids += 1)}`,
        intent,
        now: () => 1,
      }),
    ] as never,
  }) as any;
  const refusals: string[] = [];

  editor.api.authored.subscribeRefusals((refusal: { code: string }) => {
    refusals.push(refusal.code);
  });

  return { editor, refusals };
};

const plain = () => ({
  children: [card('b1'), p('aa')],
  roots: { b1: [p('Body')] },
});

const withPending = (unknown: Unknown, value: unknown = plain()) => {
  const { editor } = make({ authorId: 'alice', unknown, value });

  editor.update((tx) =>
    tx.text.insert('Z', { at: { offset: 2, path: [1, 0] } })
  );

  return editor.read.value();
};

const valueOf = (editor: any) => {
  const { records: _records, ...value } = editor.read.value();

  return value;
};

const marked = (editor: any) => {
  const value = editor.read.value();
  const marksOf = (node: any) =>
    (node.authored ?? [])
      .filter((mark: any) => mark.kind !== 'held')
      .map((mark: any) => `${mark.kind}:${mark.change}`);

  return {
    main: value.children.map((node: any) => [
      node.type,
      ...marksOf(node),
      ...(node.childRoots ? [node.childRoots] : []),
    ]),
    roots: Object.keys(value.roots ?? {}).sort(),
  };
};

const decideAll = (
  editor: any,
  action: 'accept' | 'reject',
  change?: string
) => {
  const changes = editor.read.authored
    .changes()
    .items.filter((item: any) => !change || item.id === change);

  return editor.update.authored.decide({ action, changes });
};

const blockSelected = SelectionApi.nodes([[0]], { mode: 'block' });
const overCard = SelectionApi.text({
  anchor: { offset: 0, path: [0, 0] },
  focus: { offset: 0, path: [1, 0] },
});

const removals = {
  'nodes.remove': (editor: any) =>
    editor.update((tx) => tx.nodes.remove({ at: [0] })),
  'removeNodes command': (editor: any) =>
    editor.update((tx) => tx.command(editorCommands.removeNodes, {})),
  'deleteFragment command': (editor: any) =>
    editor.update((tx) =>
      tx.command(editorCommands.deleteFragment, { direction: 'backward' })
    ),
  'delete command': (editor: any) =>
    editor.update((tx) =>
      tx.command(editorCommands.delete, {
        direction: 'backward',
        unit: 'character',
      })
    ),
  'replaceSlice command': (editor: any) =>
    editor.update((tx) =>
      tx.command(editorCommands.replaceSlice, {
        slice: ContentSlice.closed([p('x')]),
      })
    ),
  'slice.replace': (editor: any) =>
    editor.update.slice.replace(ContentSlice.closed([p('x')])),
};

const retypes = {
  'nodes.set': (editor: any) =>
    editor.update((tx) => {
      tx.nodes.set({ type: 'paragraph' }, { at: [0] });
      tx.nodes.unset('childRoots', { at: [0] });
    }),
  'toggleBlock command': (editor: any) =>
    editor.update((tx) =>
      tx.command(editorCommands.toggleBlock, {
        options: { at: [0] },
        props: { type: 'paragraph' },
      })
    ),
};

const MODES = ['reject', 'preserve'] as const;
const FRAMES = [
  ['unframed', (_unknown: Unknown, value: unknown = plain()) => value],
  [
    'framed',
    (unknown: Unknown, value: unknown = plain()) => withPending(unknown, value),
  ],
] as const;

describe('Suggesting deletes a block that owns a content root', () => {
  for (const unknown of MODES) {
    for (const [frame, initial] of FRAMES) {
      describe(`${unknown}, ${frame}`, () => {
        for (const [name, remove] of Object.entries(removals)) {
          it(`${name} records a struck card that keeps its root`, () => {
            const { editor, refusals } = make({
              selection: blockSelected,
              unknown,
              value: initial(unknown),
            });

            remove(editor);

            assert.deepEqual(refusals, []);
            const { main, roots } = marked(editor);

            assert.deepEqual(main[0], ['card', 'delete:bob:1', { body: 'b1' }]);
            assert.deepEqual(roots, ['b1']);
            assert.deepEqual(editor.read.value().roots.b1, [p('Body')]);

            const rejecting = make({
              unknown,
              value: editor.read.value(),
            }).editor;

            decideAll(rejecting, 'reject', 'bob:1');
            assert.deepEqual(marked(rejecting).main[0], [
              'card',
              { body: 'b1' },
            ]);
            assert.deepEqual(rejecting.read.value().roots.b1, [p('Body')]);

            decideAll(editor, 'accept', 'bob:1');
            assert.equal(
              marked(editor).main.some(([type]: [string]) => type === 'card'),
              false
            );
            assert.deepEqual(marked(editor).roots, []);
          });
        }

        for (const [name, retype] of Object.entries(retypes)) {
          it(`${name} that retypes the card records it struck beside its new form`, () => {
            const { editor, refusals } = make({
              unknown,
              value: initial(unknown),
            });

            retype(editor);

            assert.deepEqual(refusals, []);
            const { main, roots } = marked(editor);

            assert.deepEqual(main[0], ['card', 'delete:bob:1', { body: 'b1' }]);
            assert.deepEqual(main[1].slice(0, 2), [
              'paragraph',
              'insert:bob:1',
            ]);
            assert.deepEqual(roots, ['b1']);

            const rejecting = make({
              unknown,
              value: editor.read.value(),
            }).editor;

            decideAll(rejecting, 'reject', 'bob:1');
            assert.deepEqual(marked(rejecting).main.slice(0, 2), [
              ['card', { body: 'b1' }],
              ['paragraph'],
            ]);
            assert.deepEqual(rejecting.read.value().roots.b1, [p('Body')]);
          });
        }

        it('fragment.replace over a range crossing the card records a struck card', () => {
          const { editor, refusals } = make({
            selection: overCard,
            unknown,
            value: initial(unknown),
          });

          editor.update.fragment.replace([p('x')]);

          assert.deepEqual(refusals, []);
          assert.equal(
            marked(editor).main.some(
              (node: unknown[]) =>
                node[0] === 'card' && node[1] === 'delete:bob:1'
            ),
            true
          );
          assert.deepEqual(marked(editor).roots, ['b1']);
        });

        it('a rich paste over the card records it struck, with no plain-text fallback', () => {
          const { editor, refusals } = make({
            selection: overCard,
            unknown,
            value: initial(unknown),
          });
          const data = new FakeDataTransfer();

          data.setData('application/x-carried', 'carried');
          data.setData('text/plain', 'plain');

          assert.equal(
            editor.api.dom.clipboard.insertData(
              data as unknown as DataTransfer
            ),
            true
          );
          assert.deepEqual(refusals, []);
          const { main, roots } = marked(editor);
          const pasted = main.find(
            (node: any[]) => node[0] === 'card' && node[1] === 'insert:bob:1'
          )?.[2].body;

          assert.deepEqual(
            main.filter((node: unknown[]) => node[0] === 'card'),
            [
              ['card', 'delete:bob:1', { body: 'b1' }],
              ['card', 'insert:bob:1', { body: pasted }],
            ]
          );
          assert.notEqual(pasted, 'b1');
          assert.deepEqual(
            roots,
            ['b1', pasted].sort((left, right) => left.localeCompare(right))
          );
          assert.equal(
            JSON.stringify(valueOf(editor)).includes('plain'),
            false
          );
        });

        it('one update that pastes a card and then deletes it leaves no root behind', () => {
          const { editor, refusals } = make({
            selection: overCard,
            unknown,
            value: initial(unknown),
          });

          editor.update((tx) => {
            tx.slice.replace(carried());
            const at = tx.nodes
              .children()
              .findIndex(
                (node: any) =>
                  node.type === 'card' && node.childRoots.body !== 'b1'
              );

            tx.nodes.remove({ at: [at] });
          });

          assert.deepEqual(refusals, []);
          assert.deepEqual(marked(editor).roots, ['b1']);
        });
      });
    }
  }

  it('refuses deleting a root no element owns', () => {
    const { editor, refusals } = make({
      unknown: 'preserve',
      value: { ...plain(), roots: { aux: [p('side')], b1: [p('Body')] } },
    });
    const before = editor.read.value();

    editor.update((tx) =>
      tx.changes.apply(
        DocumentChange.fromJSON({ deleteRoots: ['aux'], version: 3 })
      )
    );

    assert.deepEqual(refusals, ['unrepresentable']);
    assert.deepEqual(editor.read.value(), before);
  });

  it('lets Editing delete a root no element owns, as a plain editor does', () => {
    const value = { ...plain(), roots: { aux: [p('side')], b1: [p('Body')] } };
    const remove = (tx: any) =>
      tx.changes.apply(
        DocumentChange.fromJSON({ deleteRoots: ['aux'], version: 3 })
      );
    const plainEditor = createEditor({
      initialValue: value as never,
      plugins: [cards('preserve')] as never,
    }) as any;
    const { editor, refusals } = make({
      intent: 'edit',
      unknown: 'preserve',
      value,
    });

    plainEditor.update(remove);
    editor.update(remove);

    assert.deepEqual(refusals, []);
    assert.deepEqual(valueOf(editor), plainEditor.read.value());
  });

  it('records a struck card whose root holds a block a veto keeps Suggesting out of', () => {
    const { editor, refusals } = make({
      plugins: [
        definePlugin('quote-veto', {
          contributions: [
            authoredVeto.of((element: any) =>
              element.type === 'quote' ? 'quote' : null
            ),
          ],
        }),
      ],
      schema: quoted(),
      unknown: 'reject',
      value: {
        children: [card('b1'), p('aa')],
        roots: { b1: [{ type: 'quote', children: [{ text: 'Q' }] }] },
      },
    });

    editor.update((tx) => tx.nodes.remove({ at: [0] }));

    assert.deepEqual(refusals, []);
    assert.deepEqual(marked(editor).main[0], [
      'card',
      'delete:bob:1',
      { body: 'b1' },
    ]);
  });
});

describe('a card whose deletion is pending', () => {
  it("Editing leaves another author's deletion of it pending, and its root", () => {
    const { editor: alice } = make({
      authorId: 'alice',
      unknown: 'reject',
      value: plain(),
    });

    alice.update((tx) => tx.nodes.remove({ at: [0] }));
    const { editor, refusals } = make({
      intent: 'edit',
      unknown: 'reject',
      value: alice.read.value(),
    });

    editor.update((tx) => tx.nodes.remove({ at: [0] }));

    assert.deepEqual(refusals, []);
    assert.deepEqual(marked(editor), {
      main: [['card', 'delete:alice:1', { body: 'b1' }], ['paragraph']],
      roots: ['b1'],
    });
  });
});

const toggleFirst = (tx: any) =>
  tx.command(editorCommands.toggleBlock, {
    options: { at: [0] },
    props: { type: 'paragraph' },
  });

const doubled = {
  'a two-area card that keeps one area': {
    retype: (tx: any) =>
      tx.nodes.set({ type: 'note', childRoots: { body: 'b1' } }, { at: [0] }),
    value: () => ({
      children: [
        {
          type: 'wide',
          childRoots: { aside: 'a1', body: 'b1' },
          children: [{ text: 'W' }],
        },
        p('aa'),
      ],
      roots: { a1: [p('A')], b1: [p('B')] },
    }),
  },
  'an outer block that keeps a nested card': {
    retype: (tx: any) => {
      tx.nodes.set({ type: 'group' }, { at: [0] });
      tx.nodes.unset('childRoots', { at: [0] });
    },
    value: () => ({
      children: [
        { type: 'panel', childRoots: { body: 'p1' }, children: [card('c1')] },
        p('aa'),
      ],
      roots: { c1: [p('C')], p1: [p('P')] },
    }),
  },
  'a card whose own text holds an inline owner': {
    retype: toggleFirst,
    value: () => ({
      children: [
        {
          type: 'card',
          childRoots: { body: 'b1' },
          children: [{ text: 'C' }, chip('n1'), { text: '' }],
        },
        p('aa'),
      ],
      roots: { b1: [p('B')], n1: [p('N')] },
    }),
  },
};

describe('Suggesting retypes a block that owns a content root', () => {
  for (const [name, { retype, value }] of Object.entries(doubled)) {
    it(`lets Editing apply ${name} as a plain editor does`, () => {
      const plainEditor = createEditor({
        initialValue: value() as never,
        plugins: [owners('reject')] as never,
      }) as any;
      const { editor, refusals } = make({
        intent: 'edit',
        schema: owners('reject'),
        unknown: 'reject',
        value: value(),
      });

      plainEditor.update(retype);
      editor.update(retype);

      assert.deepEqual(refusals, []);
      assert.deepEqual(valueOf(editor), plainEditor.read.value());
    });
  }

  for (const unknown of MODES) {
    for (const [name, { retype, value }] of Object.entries(doubled)) {
      it(`${unknown}: refuses ${name}, which would leave a root two owners`, () => {
        const { editor, refusals } = make({
          schema: owners(unknown),
          unknown,
          value: value(),
        });
        const before = valueOf(editor);

        editor.update(retype);

        assert.deepEqual(refusals, ['unrepresentable']);
        assert.deepEqual(valueOf(editor), before);
      });
    }

    it(`${unknown}: keeps a format claim when another card still owns the shared root`, () => {
      const { editor, refusals } = make({
        schema: cards(unknown, 'shared'),
        unknown,
        value: {
          children: [card('s1'), card('s1', 'D')],
          roots: { s1: [p('S')] },
        },
      });

      editor.update(toggleFirst);

      assert.deepEqual(refusals, []);
      const { main, roots } = marked(editor);

      assert.deepEqual(
        main.map(([type]: [string]) => type),
        ['paragraph', 'card']
      );
      assert.ok(main[0].includes('format:bob:1'));
      assert.deepEqual(roots, ['s1']);
    });
  }
});

const textOf = (nodes: readonly any[]): string =>
  nodes.map((node) => node.text ?? textOf(node.children)).join('');

const pendingCard = (unknown: Unknown) => {
  const { editor } = make({ unknown, value: { children: [p('aa')] } });

  editor.update((tx) => {
    tx.roots.create('b9', [p('B')]);
    tx.nodes.insert(card('b9'), { at: [0] });
  });

  return editor.read.value();
};

describe("withdrawing one's own pending card", () => {
  for (const unknown of MODES) {
    it(`${unknown}: leaves it struck, and the text Editing wrote in its root`, () => {
      const { editor: alice } = make({
        authorId: 'alice',
        intent: 'edit',
        unknown,
        value: pendingCard(unknown),
      });

      alice.update((tx) =>
        tx.text.insert('Q', { at: { offset: 0, path: [0, 0], root: 'b9' } })
      );
      const { editor, refusals } = make({
        usedChangeIds: 1,
        unknown,
        value: alice.read.value(),
      });

      editor.update((tx) => tx.nodes.remove({ at: [0] }));

      assert.deepEqual(refusals, []);
      assert.ok(marked(editor).main[0].includes('delete:bob:2'));
      assert.equal(textOf(editor.read.value().roots.b9), 'QB');
    });
  }

  it('removes it over a shared root another card keeps', () => {
    const { editor, refusals } = make({
      schema: cards('preserve', 'shared'),
      unknown: 'preserve',
      value: { children: [card('s1'), p('aa')], roots: { s1: [p('D')] } },
    });

    editor.update((tx) => tx.nodes.insert(card('s1'), { at: [1] }));
    editor.update((tx) => tx.nodes.remove({ at: [1] }));

    assert.deepEqual(refusals, []);
    assert.deepEqual(marked(editor), {
      main: [['card', { body: 's1' }], ['paragraph']],
      roots: ['s1'],
    });
  });
});

describe('one decision over a card deletion and a move in another root', () => {
  it("keeps a caret after another author's pending join, and after its undo", () => {
    const at = (path: number[], offset: number) =>
      SelectionApi.text({
        anchor: { offset, path },
        focus: { offset, path },
      });
    const { editor: alice } = make({
      authorId: 'alice',
      unknown: 'reject',
      value: {
        children: [card('b1'), card('b2'), p('hel'), p('lo world')],
        roots: { b1: [p('Body')], b2: [p('x'), p('y')] },
      },
    });

    createEditorView(alice, { root: 'b2' }).update((tx) =>
      tx.nodes.move({ at: [1], to: [0] })
    );
    alice.update((tx) => {
      tx.selection.set(at([3, 0], 0));
      tx.command(editorCommands.delete, {
        direction: 'backward',
        unit: 'character',
      });
    });
    const { editor } = make({
      plugins: [history()],
      selection: at([3, 0], 2),
      unknown: 'reject',
      value: alice.read.value(),
    });

    editor.update((tx) => tx.nodes.remove({ at: [0] }));
    const pending = valueOf(editor);

    decideAll(editor, 'accept');

    assert.deepEqual(marked(editor), {
      main: [['card', { body: 'b2' }], ['paragraph']],
      roots: ['b2'],
    });
    assert.equal(textOf(editor.read.children()), 'Chello world');
    assert.equal(textOf(editor.read.value().roots.b2), 'yx');
    assert.deepEqual(editor.read.selection().anchor, {
      offset: 5,
      path: [1, 0],
    });

    editor.api.history.undo();

    assert.deepEqual(valueOf(editor), pending);
    assert.deepEqual(editor.read.selection().anchor, {
      offset: 2,
      path: [3, 0],
    });
  });
});

const unmarked = (nodes: readonly any[]): any[] =>
  nodes.map(({ authored: _authored, ...node }) =>
    node.children ? { ...node, children: unmarked(node.children) } : node
  );

type Preview = 'accepted' | 'proposed';

const previewOf = (editor: any, preview: Preview) => {
  const read = (root?: string) =>
    unmarked(
      createEditorView(editor, {
        authored: { preview },
        ...(root ? { root } : {}),
      } as never).read.children()
    );

  return {
    children: read(),
    roots: Object.fromEntries(
      Object.keys(editor.read.value().roots ?? {}).flatMap((root) => {
        const children = read(root);

        return children.length > 0 ? [[root, children]] : [];
      })
    ),
  };
};

const resolvedOf = (editor: any, preview: Preview) => {
  const { document } = projectAuthoredDocument(editor.read.value(), {
    editor,
    projection: preview,
  }) as any;

  return {
    children: unmarked(document.children),
    roots: Object.fromEntries(
      Object.entries(document.roots ?? {}).map(([root, children]) => [
        root,
        unmarked(children as any[]),
      ])
    ),
  };
};

const agreed = (editor: any, preview: Preview, options: Partial<Options>) => {
  const resolved = resolvedOf(editor, preview);

  assert.deepEqual(previewOf(editor, preview), resolved);
  assert.deepEqual(
    previewOf(
      make({ unknown: 'reject', ...options, value: editor.read.value() })
        .editor,
      preview
    ),
    resolved
  );

  return Object.keys(resolved.roots).sort();
};

describe('the review previews of a suggested card deletion', () => {
  it('drop the root from the proposed preview until the deletion is decided', () => {
    const { editor } = make({
      plugins: [history()],
      unknown: 'reject',
      value: plain(),
    });

    editor.update((tx) => tx.nodes.remove({ at: [0] }));

    assert.deepEqual(previewOf(editor, 'proposed'), {
      children: [p('aa')],
      roots: {},
    });
    assert.deepEqual(previewOf(editor, 'accepted'), plain());

    const rejecting = make({
      unknown: 'reject',
      value: editor.read.value(),
    }).editor;

    decideAll(rejecting, 'reject');
    assert.deepEqual(previewOf(rejecting, 'proposed'), plain());

    const pending = valueOf(editor);

    decideAll(editor, 'accept');
    assert.deepEqual(valueOf(editor), { children: [p('aa')] });
    editor.api.history.undo();
    assert.deepEqual(valueOf(editor), pending);
  });

  it("wait on another author's insertion inside the root, and take their deletion there with it", () => {
    const { editor: alice } = make({
      authorId: 'alice',
      unknown: 'reject',
      value: plain(),
    });

    alice.update((tx) =>
      tx.text.insert('Q', { at: { offset: 0, path: [0, 0], root: 'b1' } })
    );
    alice.update((tx) =>
      tx.text.delete({
        at: {
          anchor: { offset: 0, path: [0, 1], root: 'b1' },
          focus: { offset: 1, path: [0, 1], root: 'b1' },
        },
      })
    );
    const { editor } = make({ unknown: 'reject', value: alice.read.value() });

    editor.update((tx) => tx.nodes.remove({ at: [0] }));

    assert.deepEqual(decideAll(editor, 'accept', 'bob:1'), {
      ids: ['bob:1'],
      status: 'blocked',
      with: ['alice:1'],
    });
    assert.equal(decideAll(editor, 'accept').status, 'applied');
    assert.deepEqual(valueOf(editor), { children: [p('aa')] });
  });

  it("drop a nested card's root with the outer card's", () => {
    const { editor } = make({
      schema: nesting(),
      unknown: 'reject',
      value: {
        children: [card('b1'), p('aa')],
        roots: { b1: [p('Body'), card('c1')], c1: [p('Deep')] },
      },
    });

    editor.update((tx) => tx.nodes.remove({ at: [0] }));

    assert.deepEqual(agreed(editor, 'proposed', { schema: nesting() }), []);
    assert.deepEqual(agreed(editor, 'accepted', { schema: nesting() }), [
      'b1',
      'c1',
    ]);
  });

  it('agree with the resolver over shared roots that own each other', () => {
    const { editor } = make({
      plugins: [history()],
      schema: nesting(),
      unknown: 'reject',
      value: {
        children: [tile('A'), p('aa')],
        roots: { A: [p('a'), tile('B')], B: [p('b'), tile('A')] },
      },
    });
    const roots = () => agreed(editor, 'proposed', { schema: nesting() });

    createEditorView(editor, { root: 'A' }).update((tx) =>
      tx.nodes.remove({ at: [1] })
    );
    assert.deepEqual(roots(), ['A']);
    editor.update((tx) => tx.nodes.remove({ at: [0] }));
    assert.deepEqual(roots(), []);
    decideAll(editor, 'reject', 'bob:1');
    assert.deepEqual(roots(), ['A', 'B']);
    editor.api.history.undo();
    assert.deepEqual(roots(), []);
    editor.api.history.redo();
    assert.deepEqual(roots(), ['A', 'B']);

    const { editor: remote } = make({
      authorId: 'alice',
      intent: 'edit',
      schema: nesting(),
      unknown: 'reject',
      value: editor.read.value(),
    });
    let change: unknown;

    remote.subscribeCommit((commit: any) => {
      change = commit.changes;
    });
    remote.update((tx) => tx.nodes.insert(tile('A'), { at: [2] }));
    editor.update({ tags: ['collaboration'] }, (tx) =>
      tx.changes.apply(change)
    );
    assert.deepEqual(roots(), ['A', 'B']);
  });

  it('drop a shared root from the proposed preview once Editing deletes the card whose root held its last live owner', () => {
    const { editor: alice } = make({
      authorId: 'alice',
      schema: nesting(),
      unknown: 'reject',
      value: {
        children: [tile('r'), card('c1'), p('aa')],
        roots: { c1: [tile('r')], r: [p('R')] },
      },
    });

    alice.update((tx) => tx.nodes.remove({ at: [0] }));
    const { editor } = make({
      intent: 'edit',
      schema: nesting(),
      unknown: 'reject',
      value: alice.read.value(),
    });

    editor.update((tx) => tx.nodes.remove({ at: [1] }));

    assert.deepEqual(Object.keys(editor.read.value().roots), ['r']);
    assert.deepEqual(agreed(editor, 'proposed', { schema: nesting() }), []);
  });

  it('drop from the accepted preview an unowned root a suggested card binds', () => {
    const { editor } = make({
      unknown: 'preserve',
      value: { children: [p('aa')], roots: { n: [p('N')] } },
    });

    editor.update((tx) => tx.nodes.insert(card('n'), { at: [0] }));

    assert.deepEqual(agreed(editor, 'accepted', { unknown: 'preserve' }), []);
    assert.deepEqual(agreed(editor, 'proposed', { unknown: 'preserve' }), [
      'n',
    ]);
  });
});

describe('a root the proposed preview drops keeps its name', () => {
  const struck = (plugins: readonly unknown[] = []) => {
    const made = make({
      plugins,
      unknown: 'reject',
      value: {
        children: [card('b1'), card('b1:copy'), p('aa'), p('bb')],
        roots: { b1: [p('Body')], 'b1:copy': [p('Copy')] },
      },
    });

    made.editor.update((tx) => tx.nodes.remove({ at: [1] }));

    return made;
  };

  it('so pasting the same source again takes the next name', () => {
    const { editor, refusals } = struck();

    editor.update((tx) =>
      tx.selection.set(SelectionApi.nodes([[3]], { mode: 'block' }))
    );
    editor.update.slice.replace(
      ContentSlice.fromJSON({
        content: [card('b1')],
        openEnd: 0,
        openStart: 0,
        roots: { b1: [p('X')] },
      })
    );

    assert.deepEqual(refusals, []);
    assert.deepEqual(marked(editor).roots, ['b1', 'b1:copy', 'b1:copy:2']);
    assert.deepEqual(editor.read.value().roots['b1:copy'], [p('Copy')]);
  });

  it('so a command cannot create a root under it', () => {
    const Maker = definePlugin('maker', {
      update: ({ tx }: any) => ({
        make: () => tx.roots.create('b1:copy', [p('Z')]),
      }),
    });
    const { editor } = struck([Maker]);

    assert.throws(
      () => editor.update.maker.make(),
      /Cannot create existing editor root "b1:copy"/
    );
    assert.deepEqual(editor.read.value().roots['b1:copy'], [p('Copy')]);
  });
});

describe('with the caret in the root of a struck card', () => {
  const caretInStruck = (
    intent: 'edit' | 'propose' = 'propose',
    plugins: readonly unknown[] = []
  ) => {
    const made = make({ plugins, unknown: 'reject', value: plain() });

    made.editor.update((tx) => tx.nodes.remove({ at: [0] }));

    const body = createEditorView(made.editor, {
      authored: { intent },
      root: 'b1',
    } as never) as any;
    const caret = { offset: 2, path: [0, 0] };

    body.update((tx) =>
      tx.selection.set(SelectionApi.text({ anchor: caret, focus: caret }))
    );
    if (intent === 'edit') made.editor.api.authored.setView({ intent });

    return { ...made, before: valueOf(made.editor), body };
  };
  type Struck = ReturnType<typeof caretInStruck>;

  const writes: Record<string, (struck: Struck) => unknown> = {
    'tx.text.insert': ({ editor }) =>
      editor.update((tx) => tx.text.insert('W')),
    'the insertText command': ({ editor }) =>
      editor.update((tx) =>
        tx.command(editorCommands.insertText, { text: 'W' })
      ),
    'an insertData paste': ({ editor }) => {
      const data = new FakeDataTransfer();

      data.setData('text/plain', 'W');

      return editor.api.dom.clipboard.insertData(data);
    },
    'tx.nodes.insert': ({ editor }) =>
      editor.update((tx) => tx.nodes.insert(p('W'))),
    'a replaceSlice fragment': ({ editor }) =>
      editor.update((tx) =>
        tx.command(editorCommands.replaceSlice, {
          slice: ContentSlice.closed([p('W'), p('X')]),
        })
      ),
    'typing through a view on b1': ({ body }) =>
      body.update((tx) => tx.text.insert('W')),
    'an explicit at inside b1': ({ editor }) =>
      editor.update((tx) =>
        tx.text.insert('W', { at: { offset: 0, path: [0, 0], root: 'b1' } })
      ),
  };
  const editing = ['the insertText command', 'typing through a view on b1'];

  for (const [intent, names] of [
    ['propose', Object.keys(writes)],
    ['edit', editing],
  ] as const) {
    for (const name of names) {
      it(`${name} writes nothing in ${intent === 'edit' ? 'Editing' : 'Suggesting'}`, () => {
        const struck = caretInStruck(intent);

        writes[name](struck);

        assert.deepEqual(struck.refusals, ['unrepresentable']);
        assert.deepEqual(valueOf(struck.editor), struck.before);
      });
    }
  }

  it('a plugin update method with no target writes nothing in Suggesting', () => {
    const Writer = definePlugin('writer', {
      update: ({ tx }: any) => ({
        write: () => tx.nodes.insert(p('W'), { at: [tx.children().length] }),
      }),
    });
    const struck = caretInStruck('propose', [Writer]);

    struck.editor.update.writer.write();

    assert.deepEqual(struck.refusals, ['unrepresentable']);
    assert.deepEqual(valueOf(struck.editor), struck.before);
  });

  it('a plugin update method another method calls writes nothing in Suggesting', () => {
    const Writer = definePlugin('writer', {
      update: ({ tx }: any) => ({
        outer: txLocate(false, (done: () => void) => {
          done();
          tx.writer.write();
        }),
        write: () => tx.nodes.insert(p('W'), { at: [tx.children().length] }),
      }),
    });
    const struck = caretInStruck('propose', [Writer]);

    struck.editor.update.writer.outer(() => {});

    assert.deepEqual(struck.refusals, ['unrepresentable']);
    assert.deepEqual(valueOf(struck.editor), struck.before);
  });

  it('a plugin update method that writes b1 by path writes nothing in Suggesting', () => {
    const Writer = definePlugin('writer', {
      update: ({ tx }: any) => ({
        insertAtPath: () =>
          tx.text.insert('W', { at: { offset: 0, path: [0, 0] } }),
        outer: txLocate(false, (done: () => void) => {
          done();
          tx.writer.remove();
        }),
        remove: () => tx.nodes.remove({ at: [0] }),
        replace: () => tx.nodes.replace(p('W'), { at: [0] }),
        select: () => {
          const at = { offset: 0, path: [0, 0] };

          tx.selection.set(SelectionApi.text({ anchor: at, focus: at }));
        },
      }),
    });
    const struck = caretInStruck('propose', [Writer]);

    struck.editor.update.writer.insertAtPath();
    struck.editor.update.writer.replace();
    struck.editor.update.writer.remove();
    struck.editor.update.writer.select();
    struck.editor.update.writer.outer(() => {});

    assert.deepEqual(struck.refusals, [
      'unrepresentable',
      'unrepresentable',
      'unrepresentable',
      'unrepresentable',
      'unrepresentable',
    ]);
    assert.deepEqual(valueOf(struck.editor), struck.before);
  });

  it('a plugin update method with no target runs when it writes outside b1', () => {
    const main: { key?: string } = {};
    const ran: string[] = [];
    const Writer = definePlugin('writer', {
      update: ({ tx }: any) => ({
        replaceMain: () => tx.nodes.replace(p('RIGHT'), { at: main.key }),
        tag: () => {
          ran.push('tag');
          tx.tags.add('test.tag');
        },
      }),
    });
    const struck = caretInStruck('propose', [Writer, history()]);
    const undoBefore = struck.editor.read.history.hasUndo();

    main.key = struck.editor.key([1]);
    struck.editor.update.writer.tag();
    struck.editor.update((tx) => {
      tx.history.restore(
        History.fromJSON(struck.editor, {
          redos: [],
          schema: struck.editor.read.history().schema,
          undos: [],
          version: 4,
        })
      );
      tx.writer.replaceMain();
    });

    assert.deepEqual(struck.refusals, []);
    assert.deepEqual(ran, ['tag']);
    assert.deepEqual(
      [undoBefore, struck.editor.read.history.hasUndo()],
      [true, false]
    );
    assert.deepEqual(previewOf(struck.editor, 'proposed').children, [
      p('RIGHT'),
    ]);
  });

  it('drops an effect a command emits inside b1', () => {
    const inBody = defineEffect<number>({
      key: 'test.in-body',
      map: (position, changes) =>
        changes.mapPosition(position, { association: 'forward', root: 'b1' }) ??
        undefined,
    });
    const { editor } = caretInStruck('propose', [
      definePlugin('in-body', { effectTypes: [inBody] }),
    ]);
    const emitted: unknown[] = [];

    editor.subscribeCommit((commit: any) => {
      for (const effect of commit.effects) emitted.push(effect.value);
    });
    editor.update.command(
      defineCommand('test.emit-in-body', {
        build: ({ state }: any) =>
          state.transaction((tx) => {
            tx.effects.emit(inBody, 1);
          }),
      })
    );

    assert.deepEqual(emitted, []);
  });

  it('a command that selects main and then inserts writes there', () => {
    const { editor, refusals } = caretInStruck();
    const at = { offset: 1, path: [0, 0] };

    editor.update.command(
      defineCommand('test.select-and-type', {
        build: ({ state }: any) =>
          state.transaction((tx) => {
            tx.selection.set(SelectionApi.text({ anchor: at, focus: at }));
            tx.text.insert('W');
          }),
      })
    );

    assert.deepEqual(refusals, []);
    assert.equal(textOf(editor.read.value().children[1].children), 'aWa');
    assert.deepEqual(editor.read.value().roots.b1, [p('Body')]);
  });

  it('a block selection on a struck paragraph lands a framed insert at the end of main', () => {
    const flat = defineOnce('authored-root-deletion:flat', () =>
      defineEditorSchema('authored-root-deletion:flat', {
        elements: { paragraph: { content: text() } },
        root: paragraphs(),
        unknown: 'reject',
      })
    );
    const { editor: alice } = make({
      authorId: 'alice',
      schema: flat,
      unknown: 'reject',
      value: { children: [p('A'), p('B')] },
    });

    alice.update((tx) => tx.nodes.remove({ at: [0] }));
    const { editor, refusals } = make({
      schema: flat,
      selection: blockSelected,
      unknown: 'reject',
      value: alice.read.value(),
    });

    editor.update((tx) => tx.command(editorCommands.insertText, { text: 'W' }));

    assert.deepEqual(refusals, []);
    assert.equal(textOf(editor.read.value().children[1].children), 'BW');
  });

  it('a framed insert with no selection still lands at the end of main', () => {
    const { editor, refusals } = make({ unknown: 'reject', value: plain() });

    editor.update((tx) => tx.nodes.remove({ at: [0] }));
    editor.update((tx) => tx.selection.set(null));
    editor.update((tx) => tx.command(editorCommands.insertText, { text: 'W' }));

    assert.deepEqual(refusals, []);
    assert.equal(textOf(editor.read.value().children[1].children), 'aaW');
    assert.deepEqual(editor.read.value().roots.b1, [p('Body')]);
  });
});

const pastedCard = (unknown: Unknown) => {
  const made = make({
    selection: SelectionApi.text({
      anchor: { offset: 0, path: [1, 0] },
      focus: { offset: 0, path: [1, 0] },
    }),
    unknown,
    value: { children: [p('aa'), p('')] },
  });

  made.editor.update.slice.replace(carried());

  return made;
};
const rejection = {
  decision: 'd:1',
  member: { at: 1, change: 'bob:1' },
  verdict: 'reject',
} as const;
const retyped = (unknown: Unknown) => {
  const { editor } = make({ unknown, value: { children: [p('C'), p('aa')] } });

  editor.update((tx) => {
    tx.roots.create('b9', [p('B')]);
    tx.nodes.set({ type: 'card', childRoots: { body: 'b9' } }, { at: [0] });
  });

  return valueOf(editor);
};

describe('a pasted card that a decision or a verdict settles away', () => {
  for (const unknown of MODES) {
    it(`${unknown}: leaves the accepted preview and a rejection without its root`, () => {
      const { editor } = pastedCard(unknown);
      const { document } = projectAuthoredDocument(editor.read.value(), {
        editor,
        projection: 'accepted',
      }) as any;

      assert.equal(document.roots, undefined);
      editor.read.schema.assertDocument(document);
      assert.equal(decideAll(editor, 'reject').status, 'applied');
      assert.deepEqual(marked(editor).roots, []);
    });
  }

  it('leaves a serializer export without its root', () => {
    const { editor } = pastedCard('reject');
    const project = (value: unknown) =>
      getEditorAuthoredDocumentCapability(editor)!.project(
        value as never,
        'accepted',
        getCompiledEditorSchema(editor)
      ) as any;
    const noRoots = withPending('reject', { children: [p('a'), p('aa')] });

    assert.equal(project(editor.read.value()).document.roots, undefined);
    assert.deepEqual(
      project(noRoots),
      projectAuthoredDocument(noRoots as never, { projection: 'accepted' })
    );
  });
});

describe("a card's deletion over another author's insertion", () => {
  it('waits on an insertion with text in the root and in main', () => {
    const { editor: alice } = make({
      authorId: 'alice',
      unknown: 'reject',
      value: plain(),
    });

    alice.update((tx) => {
      tx.text.insert('Q', { at: { offset: 0, path: [0, 0], root: 'b1' } });
      tx.text.insert('R', { at: { offset: 0, path: [1, 0] } });
    });
    const { editor } = make({ unknown: 'reject', value: alice.read.value() });

    editor.update((tx) => tx.nodes.remove({ at: [0] }));

    assert.deepEqual(decideAll(editor, 'accept', 'bob:1'), {
      ids: ['bob:1'],
      status: 'blocked',
      with: ['alice:1'],
    });
  });
});

describe('a schema change that gives a card a content root', () => {
  it('drops the root from a cached proposed preview of the struck card', () => {
    const slot = definePluginSlot('authored-root-deletion:ownership');
    const revision = (version: number) =>
      defineEditorSchema('authored-root-deletion:ownership', {
        elements: {
          card: {
            content: text(),
            ...(version === 2
              ? {
                  contentRoots: {
                    body: { content: paragraphs(), ownership: 'exclusive' },
                  },
                }
              : {}),
          },
          paragraph: { content: text() },
        },
        id: 'authored-root-deletion:ownership',
        root: schema.content.types(['paragraph', 'card'], {
          default: { type: 'paragraph' },
          min: 1,
        }),
        unknown: 'preserve',
        version,
      });
    const { editor } = make({
      schema: slot.of(revision(1)),
      unknown: 'preserve',
      value: plain(),
    });

    editor.update((tx) => tx.nodes.remove({ at: [0] }));
    assert.deepEqual(Object.keys(previewOf(editor, 'proposed').roots), ['b1']);

    editor.update((tx) => tx.plugins.reconfigure(slot, revision(2)));

    assert.deepEqual(Object.keys(previewOf(editor, 'proposed').roots), []);
  });
});

describe('a suggested card that a verdict rejects', () => {
  for (const unknown of MODES) {
    it(`${unknown}: loads without its root`, () => {
      const { editor } = make({
        unknown,
        value: {
          ...retyped(unknown),
          records: reviewRecords({ verdicts: [rejection] }),
        },
      });

      assert.deepEqual(marked(editor), {
        main: [['paragraph'], ['paragraph']],
        roots: [],
      });
    });

    it(`${unknown}: keeps no root when one transaction brings the card, its root and the verdict`, () => {
      const start = { children: [p('C'), p('aa')] };
      const { editor } = make({ intent: 'edit', unknown, value: start });
      const change = DocumentChange.fromJSON({
        ...(DocumentChange.between(
          start,
          retyped(unknown) as never
        ).toJSON() as object),
        records: recordOpsToJson(putVerdicts([rejection])),
      } as never);

      editor.update({ tags: ['collaboration'] }, (tx) =>
        tx.changes.apply(change)
      );

      assert.deepEqual(marked(editor), {
        main: [['paragraph'], ['paragraph']],
        roots: [],
      });
    });
  }
});

describe('a remote write under a suggested card deletion', () => {
  const remote = (
    editorSchema: unknown,
    unknown: Unknown,
    write: (tx: any) => void
  ) => {
    const { editor } = make({
      authorId: 'alice',
      intent: 'edit',
      schema: editorSchema,
      unknown,
      value: plain(),
    });
    let change: unknown;

    editor.subscribeCommit((commit: any) => {
      change = commit.changes;
    });
    editor.update(write);

    return change;
  };

  it('keeps the root in the proposed preview once it rebinds the card as a shared-root deck', () => {
    const change = remote(decks(), 'preserve', (tx) =>
      tx.nodes.set({ type: 'deck' }, { at: [0] })
    );
    const { editor } = make({
      schema: decks(),
      unknown: 'preserve',
      value: plain(),
    });

    editor.update((tx) => tx.nodes.remove({ at: [0] }));
    editor.update({ tags: ['collaboration'] }, (tx) =>
      tx.changes.apply(change)
    );

    assert.deepEqual(
      agreed(editor, 'proposed', { schema: decks(), unknown: 'preserve' }),
      ['b1']
    );
  });

  it('leaves the dropped root out of the proposed preview commit', () => {
    const change = remote(cards('reject'), 'reject', (tx) => {
      tx.text.insert('X', { at: { offset: 0, path: [1, 0] } });
      tx.text.insert('Y', { at: { offset: 0, path: [0, 0], root: 'b1' } });
    });
    const { editor } = make({ unknown: 'reject', value: plain() });

    editor.update((tx) => tx.nodes.remove({ at: [0] }));
    const proposed: any = createEditorView(editor, {
      authored: { preview: 'proposed' },
    } as never);
    const commits: any[] = [];

    proposed.read.children();
    proposed.subscribeCommit((commit: any) => commits.push(commit));
    editor.update({ tags: ['collaboration'] }, (tx) =>
      tx.changes.apply(change)
    );

    assert.equal(commits.length, 1);
    assert.deepEqual(Object.keys(commits[0].changes.toJSON().roots ?? {}), []);
    assert.deepEqual(
      Object.keys(commits[0].inverseChanges.toJSON().roots ?? {}),
      []
    );
  });
});
