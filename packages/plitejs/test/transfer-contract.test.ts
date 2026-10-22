import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  ContentSlice,
  createEditor,
  createEditorView,
  defineEditorSchema,
  definePlugin,
  type Descendant,
  editorReads,
  type Element,
  ElementApi,
  NodeApi,
  property,
  schema,
  screenReaderAnnouncementEffect,
  type SliceLanding,
  type SliceLandingInput,
  target,
  transfer,
  type TransferAdoptInput,
  type TransferPatch,
  transferVeto,
} from 'plitejs';
import { authored, projectAuthoredDocument } from 'plitejs/authored';
import { history } from 'plitejs/history';

import { landingMetrics } from '../src/core/landing';
import { checkTransfer } from '../src/core/transfer';

const paragraph = (text: string): Element => ({
  type: 'paragraph',
  children: [{ text }],
});
const texts = (editor: { read: { children: () => readonly Descendant[] } }) =>
  editor.read.children().map((node) => NodeApi.string(node));

const cardSchema = defineEditorSchema('schema:transfer-contract-card', {
  elements: {
    card: {
      content: schema.content.text({ default: 'text', min: 1 }),
      contentRoots: {
        body: {
          content: schema.content.types(['card', 'paragraph'], {
            default: { type: 'paragraph' },
            min: 1,
          }),
          ownership: 'exclusive',
        },
      },
    },
    paragraph: { content: schema.content.text({ default: 'text', min: 1 }) },
  },
  id: 'transfer-contract-card',
  properties: [
    schema.elementProperty('id', property.string(), {
      copy: 'drop',
      split: 'drop',
      target: target.type('paragraph'),
    }),
  ],
  root: schema.content.types(['card', 'paragraph'], {
    default: { type: 'paragraph' },
    min: 1,
  }),
  unknown: 'reject',
  version: 1,
});

const nestSchema = defineEditorSchema('schema:transfer-contract-nest', {
  elements: {
    heading: { content: schema.content.text({ default: 'text', min: 1 }) },
    pair: {
      content: schema.content.types(['paragraph'], {
        default: { type: 'paragraph' },
        max: 2,
        min: 1,
      }),
    },
    paragraph: { content: schema.content.text({ default: 'text', min: 1 }) },
    quote: {
      content: schema.content.types(['paragraph', 'quote'], {
        default: { type: 'paragraph' },
        min: 1,
      }),
    },
    titled: {
      content: schema.content.prefix(
        [{ element: 'heading' }],
        schema.content.types(['paragraph'], {
          default: { type: 'paragraph' },
          min: 0,
        })
      ),
    },
  },
  id: 'transfer-contract-nest',
  root: schema.content.types(
    ['heading', 'pair', 'paragraph', 'quote', 'titled'],
    { default: { type: 'paragraph' }, min: 1 }
  ),
  unknown: 'reject',
  version: 1,
});

const block = (type: string, ...children: Descendant[]): Element => ({
  type,
  children,
});

const chipSchema = defineEditorSchema('schema:transfer-contract-chip', {
  elements: {
    chip: { properties: { label: property.string() }, void: 'inline' },
    paragraph: {
      content: schema.content.any(
        [schema.content.text(), schema.content.type('chip')],
        { default: 'text', min: 1 }
      ),
    },
  },
  id: 'transfer-contract-chip',
  root: schema.content.type('paragraph', {
    default: { type: 'paragraph' },
    min: 1,
  }),
  unknown: 'reject',
  version: 1,
});

const chips = (...labels: string[]): Descendant[] => [
  {
    type: 'paragraph',
    children: [
      ...labels.flatMap((label) => [
        { text: '' },
        { type: 'chip', label, children: [{ text: '' }] },
      ]),
      { text: '' },
    ],
  },
];

describe('transfer', () => {
  it('revalidates a retargeted edge against every veto', () => {
    const retarget = definePlugin('retarget', {
      readMiddleware: ({ around }) => [
        around(editorReads.transfer.landing, ({ input, next, state }) =>
          input.edge === 'before'
            ? { edge: 'after' as const, key: state.key([2])! }
            : next()
        ),
      ],
    });
    const blockEnd = definePlugin('block-end', {
      contributions: [
        transferVeto.of(
          ({ edge, target: [, path] }) => edge === 'after' && path[0] === 2
        ),
      ],
    });
    const editor = createEditor({
      initialValue: [paragraph('a'), paragraph('b'), paragraph('c')],
      plugins: [transfer(), retarget, blockEnd],
    });

    const outcome = editor.api.transfer.move({
      nodes: [editor.key([0])!],
      to: { edge: 'before', key: editor.key([2])! },
    });

    assert.deepEqual(outcome, { reason: 'policy', status: 'refused' });
    assert.deepEqual(texts(editor), ['a', 'b', 'c']);
  });

  for (const intent of ['edit', 'propose'] as const) {
    it(`refuses a ${intent} move whose landing a correction alters, and publishes nothing`, () => {
      const truncate = definePlugin('truncate', {
        corrections: [
          {
            event: 'children',
            query: 'root',
            correct({ tx }) {
              tx.nodes.children().forEach((node, index) => {
                if (!ElementApi.isElement(node) || node.type !== 'quote') {
                  return;
                }
                node.children.forEach((child, childIndex) => {
                  const text = NodeApi.string(child);

                  if (text.length > 3) {
                    tx.text.delete({
                      at: {
                        anchor: { offset: 3, path: [index, childIndex, 0] },
                        focus: {
                          offset: text.length,
                          path: [index, childIndex, 0],
                        },
                      },
                    });
                  }
                });
              });
            },
          },
        ],
      });
      const editor = createEditor({
        initialValue: [
          paragraph('alphabet'),
          { type: 'quote', children: [paragraph('abc')] },
        ],
        plugins: [
          transfer(),
          truncate,
          history(),
          authored({ authorId: 'alice' }),
          nestSchema,
        ],
      });
      const view = createEditorView(editor, { authored: { intent } });
      let commits = 0;
      const unsubscribe = editor.subscribeCommit(() => {
        commits += 1;
      });

      const outcome = view.api.transfer.move({
        nodes: [view.key([0])!],
        to: { edge: 'after', key: view.key([1, 0])! },
      });

      unsubscribe();
      assert.deepEqual(outcome, { reason: 'lossy', status: 'refused' });
      assert.equal(commits, 0);
      assert.equal(view.read.authored.changes().items.length, 0);
      assert.deepEqual(texts(view), ['alphabet', 'abc']);
      assert.deepEqual(texts(editor), ['alphabet', 'abc']);
    });
  }

  it('lands what fits on a copy and reports the loss', () => {
    const source = createEditor({
      initialValue: [paragraph('Alpha')],
      plugins: [transfer()],
    });
    const destination = createEditor({
      initialValue: [paragraph('Bee')],
      maxLength: 5,
      plugins: [transfer()],
    });

    const outcome = destination.api.transfer.move({
      from: source,
      nodes: [source.key([0])!],
      to: { edge: 'after', key: destination.key([0])! },
    });

    assert.equal(outcome.status, 'copied');
    assert.equal(outcome.status === 'copied' && outcome.reason, 'independent');
    assert.deepEqual(
      outcome.status === 'copied' &&
        outcome.diagnostics.map(({ impact }) => impact),
      ['lossy']
    );
    assert.deepEqual(texts(source), ['Alpha']);
    assert.deepEqual(texts(destination), ['Bee', 'Al']);
  });

  it('lands what fits on a text copy at a point and reports the loss', () => {
    const source = createEditor({
      initialValue: [paragraph('Alpha')],
      plugins: [transfer()],
    });
    const destination = createEditor({
      initialValue: [paragraph('Bee')],
      maxLength: 5,
      plugins: [transfer()],
    });

    const outcome = destination.api.transfer.copy({
      from: source,
      range: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 5, path: [0, 0] },
      },
      to: { point: { offset: 3, path: [0, 0] } },
    });

    assert.deepEqual(
      outcome.status === 'copied' &&
        outcome.diagnostics.map(({ impact }) => impact),
      ['lossy']
    );
    assert.deepEqual(texts(destination), ['BeeAl']);
  });

  it('lands a text copy at a point as the slice landing read shapes it, with no loss', () => {
    const tagged = definePlugin('tagged-landing', {
      readMiddleware: ({ around }) => [
        around(editorReads.slice.landing, ({ next }) => {
          const { slice } = next();

          return {
            slice: ContentSlice.withContent(
              slice,
              slice.content.map((node) => ({ ...node, landed: true })),
              { open: 'preserve' }
            ),
          };
        }),
      ],
    });
    const source = createEditor({
      initialValue: [paragraph('Alpha'), paragraph('Bravo'), paragraph('Echo')],
      plugins: [transfer()],
    });
    const destination = createEditor({
      initialValue: [paragraph('Delta')],
      plugins: [transfer(), tagged],
    });

    const outcome = destination.api.transfer.copy({
      from: source,
      range: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [2, 0] },
      },
      to: { point: { offset: 5, path: [0, 0] } },
    });

    assert.deepEqual(
      {
        children: destination.read.children(),
        diagnostics: outcome.status === 'copied' && outcome.diagnostics,
      },
      {
        children: [
          paragraph('DeltaAlpha'),
          { ...paragraph('Bravo'), landed: true },
          { ...paragraph('Echo'), landed: true },
        ],
        diagnostics: [],
      }
    );
  });

  it('reports the loss when a slice landing read grows a text copy past the limit', () => {
    const growing = definePlugin('growing-landing', {
      readMiddleware: ({ around }) => [
        around(editorReads.slice.landing, ({ next }) => {
          const { slice } = next();

          return {
            slice: ContentSlice.withContent(
              slice,
              slice.content.map((node) => ({
                ...node,
                children: [{ text: 'Alpha' }],
              })),
              { open: 'preserve' }
            ),
          };
        }),
      ],
    });
    const source = createEditor({
      initialValue: [paragraph('Alpha')],
      plugins: [transfer()],
    });
    const destination = createEditor({
      initialValue: [paragraph('Delta')],
      maxLength: 9,
      plugins: [transfer(), growing],
    });

    const outcome = destination.api.transfer.copy({
      from: source,
      range: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 2, path: [0, 0] },
      },
      to: { point: { offset: 5, path: [0, 0] } },
    });

    assert.deepEqual(
      {
        diagnostics:
          outcome.status === 'copied' &&
          outcome.diagnostics.map(({ impact }) => impact),
        texts: texts(destination),
      },
      { diagnostics: ['lossy'], texts: ['DeltaAlph'] }
    );
  });

  it('replaces an empty block with the whole blocks a text copy lands, keeping its properties as a paste does', () => {
    const replacing = definePlugin('replacing-landing', {
      readMiddleware: ({ around }) => [
        around(editorReads.slice.landing, ({ input, next }) => {
          const landed = next();

          return input.target.kind === 'empty'
            ? {
                ...landed,
                replaceEmpty: {
                  slice: ContentSlice.closed(landed.slice.content),
                },
              }
            : landed;
        }),
      ],
    });
    const loud = (text: string) => ({ ...paragraph(text), tone: 'loud' });
    const source = createEditor({
      initialValue: [loud('Alpha'), loud('Bravo')],
      plugins: [transfer()],
    });
    const destination = createEditor({
      initialValue: [
        paragraph('Before'),
        { ...paragraph(''), align: 'center' },
        paragraph('After'),
      ],
      plugins: [transfer(), replacing],
    });

    const outcome = destination.api.transfer.copy({
      from: source,
      range: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 5, path: [1, 0] },
      },
      to: { point: { offset: 0, path: [1, 0] } },
    });

    assert.deepEqual(
      {
        children: destination.read.children(),
        diagnostics: outcome.status === 'copied' && outcome.diagnostics,
      },
      {
        children: [
          paragraph('Before'),
          { ...loud('Alpha'), align: 'center' },
          loud('Bravo'),
          paragraph('After'),
        ],
        diagnostics: [],
      }
    );
  });

  it('keeps a persisted id when a block moves across roots of one document', () => {
    const editor = createEditor({
      initialValue: {
        children: [
          paragraph('top'),
          {
            type: 'card',
            childRoots: { body: 'card:1' },
            children: [{ text: '' }],
          },
        ] as Descendant[],
        roots: {
          'card:1': [
            { ...paragraph('inside'), id: 'persisted' },
            paragraph('stays'),
          ],
        },
      },
      plugins: [transfer(), cardSchema],
    });
    const body = createEditorView(editor, { root: 'card:1' });

    const outcome = editor.api.transfer.move({
      from: body,
      nodes: [body.key([0])!],
      to: { edge: 'after', key: editor.key([0])! },
    });

    assert.equal(outcome.status, 'moved');
    assert.deepEqual(editor.read.children()[1], {
      ...paragraph('inside'),
      id: 'persisted',
    });
  });

  it('moves a block from the main root into a content-root view', () => {
    const editor = createEditor({
      initialValue: {
        children: [
          paragraph('top'),
          {
            type: 'card',
            childRoots: { body: 'card:1' },
            children: [{ text: '' }],
          },
        ] as Descendant[],
        roots: { 'card:1': [paragraph('inside')] },
      },
      plugins: [transfer(), cardSchema],
    });
    const body = createEditorView(editor, { root: 'card:1' });

    const outcome = body.api.transfer.move({
      from: editor,
      nodes: [editor.key([0])!],
      to: { edge: 'after', key: body.key([0])! },
    });

    assert.equal(outcome.status, 'moved');
    assert.deepEqual(texts(body), ['inside', 'top']);
    assert.deepEqual(
      editor.read.children().map((node) => node.type),
      ['card']
    );
  });

  it('copies text across a card with its content root', () => {
    const editor = createEditor({
      initialValue: {
        children: [
          paragraph('ab'),
          {
            type: 'card',
            childRoots: { body: 'card:1' },
            children: [{ text: 'cd' }],
          },
          paragraph('ef'),
          paragraph('gh'),
        ] as Descendant[],
        roots: { 'card:1': [paragraph('inside')] },
      },
      plugins: [transfer(), cardSchema],
    });

    const outcome = editor.api.transfer.copy({
      range: textRange([0, 1], [2, 1]),
      to: { point: { offset: 1, path: [3, 0] } },
    });
    const copied = editor.read.children()[4] as Element & {
      childRoots: { body: string };
    };

    assert.equal(outcome.status, 'copied');
    assert.deepEqual(texts(editor), ['ab', 'cd', 'ef', 'gb', 'cd', 'eh']);
    assert.notEqual(copied.childRoots.body, 'card:1');
    assert.deepEqual(
      texts({
        read: { children: () => editor.read.root(copied.childRoots.body) },
      }),
      ['inside']
    );
  });

  it('copies a card into another editor without touching its same-named root', () => {
    const cardEditor = (body: string) =>
      createEditor({
        initialValue: {
          children: [
            {
              type: 'card',
              childRoots: { body: 'card:1' },
              children: [{ text: '' }],
            },
          ] as Descendant[],
          roots: { 'card:1': [paragraph(body)] },
        },
        plugins: [transfer(), cardSchema],
      });
    const source = cardEditor('source body');
    const destination = cardEditor('target body');

    const outcome = destination.api.transfer.move({
      from: source,
      nodes: [source.key([0])!],
      to: { edge: 'after', key: destination.key([0])! },
    });

    assert.equal(outcome.status, 'copied');
    assert.deepEqual(
      texts({ read: { children: () => destination.read.root('card:1') } }),
      ['target body']
    );

    const copiedRoot = (
      destination.read.children()[1] as { childRoots: { body: string } }
    ).childRoots.body;

    assert.notEqual(copiedRoot, 'card:1');
    assert.deepEqual(
      texts({ read: { children: () => destination.read.root(copiedRoot) } }),
      ['source body']
    );
    assert.deepEqual(
      texts({ read: { children: () => source.read.root('card:1') } }),
      ['source body']
    );
  });

  it('moves text between roots whose points share coordinates', () => {
    const editor = createEditor({
      initialValue: {
        children: [
          paragraph('0123456789'),
          {
            type: 'card',
            childRoots: { body: 'card:1' },
            children: [{ text: '' }],
          },
        ] as Descendant[],
        roots: { 'card:1': [paragraph('abcdefghij')] },
      },
      plugins: [transfer(), cardSchema],
    });
    const body = createEditorView(editor, { root: 'card:1' });

    const outcome = editor.api.transfer.move({
      from: body,
      range: {
        anchor: { offset: 2, path: [0, 0] },
        focus: { offset: 6, path: [0, 0] },
      },
      to: { point: { offset: 4, path: [0, 0] } },
    });

    assert.equal(outcome.status, 'moved');
    assert.deepEqual(texts(editor)[0], '0123cdef456789');
    assert.deepEqual(texts(body), ['abghij']);
  });

  it('moves an inline void into the empty text between two inline voids', () => {
    const editor = createEditor({
      initialValue: chips('a', 'b', 'c'),
      plugins: [transfer(), chipSchema],
    });

    const outcome = editor.api.transfer.move({
      range: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 2] },
      },
      to: { point: { offset: 0, path: [0, 4] } },
    });

    assert.deepEqual(outcome, {
      at: {
        anchor: { offset: 0, path: [0, 2] },
        focus: { offset: 0, path: [0, 4] },
      },
      status: 'moved',
    });
    assert.deepEqual(editor.read.children(), chips('b', 'a', 'c'));
  });

  it('refuses a block payload aimed at a text point', () => {
    const editor = createEditor({
      initialValue: [paragraph('aaa'), paragraph('bbb'), paragraph('ccc')],
      plugins: [transfer()],
    });

    assert.deepEqual(
      editor.api.transfer.move({
        nodes: [editor.key([1])!],
        to: { point: { offset: 1, path: [1, 0] } },
      }),
      { reason: 'schema', status: 'refused' }
    );
    assert.deepEqual(texts(editor), ['aaa', 'bbb', 'ccc']);
  });

  it('refuses to move a card into a root it owns', () => {
    const editor = createEditor({
      initialValue: {
        children: [
          paragraph('top'),
          {
            type: 'card',
            childRoots: { body: 'card:1' },
            children: [{ text: '' }],
          },
        ] as Descendant[],
        roots: { 'card:1': [paragraph('inside')] },
      },
      plugins: [transfer(), cardSchema],
    });
    const body = createEditorView(editor, { root: 'card:1' });

    const outcome = body.api.transfer.move({
      from: editor,
      nodes: [editor.key([1])!],
      to: { edge: 'after', key: body.key([0])! },
    });

    assert.deepEqual(outcome, { reason: 'inside-source', status: 'refused' });
    assert.equal(editor.read.children().length, 2);
  });

  it('copies from a read-only view of the same document', () => {
    const editor = createEditor({
      initialValue: [paragraph('a'), paragraph('b')],
      plugins: [transfer()],
    });
    const locked = createEditorView(editor, { readOnly: true });
    const open = createEditorView(editor);

    const outcome = open.api.transfer.move({
      from: locked,
      nodes: [locked.key([0])!],
      to: { edge: 'after', key: open.key([1])! },
    });

    assert.equal(outcome.status, 'copied');
    assert.equal(
      outcome.status === 'copied' && outcome.reason,
      'read-only-source'
    );
    assert.deepEqual(texts(editor), ['a', 'b', 'a']);
  });

  it('rechecks a hovered edge when the source view leaves proposal mode', () => {
    const editor = createEditor({
      initialValue: [paragraph('a'), paragraph('b')],
      plugins: [transfer(), authored({ authorId: 'alice' })],
    });
    const proposed = createEditorView(editor, {
      authored: { intent: 'propose' },
    });

    proposed.update((tx) => tx.nodes.insert(paragraph('c'), { at: [2] }));

    const input = {
      from: proposed,
      nodes: [proposed.key([2])!],
      to: { edge: 'after' as const, key: editor.key([0])! },
    };

    assert.equal(checkTransfer(editor, input, 'move').admitted, true);

    proposed.api.authored.setView({ preview: 'accepted' });

    assert.deepEqual(checkTransfer(editor, input, 'move'), {
      admitted: false,
      reason: 'source-missing',
    });
  });

  it('moves a block in a proposing view as a proposal', () => {
    const editor = createEditor({
      initialValue: [paragraph('a'), paragraph('b'), paragraph('c')],
      plugins: [transfer(), history(), authored({ authorId: 'alice' })],
    });
    const view = createEditorView(editor, {
      authored: { intent: 'propose' },
    });

    const outcome = view.api.transfer.move({
      nodes: [view.key([0])!],
      to: { edge: 'after', key: view.key([2])! },
    });
    const projected = (projection: 'accepted' | 'proposed') =>
      projectAuthoredDocument(editor.read.value(), {
        projection,
      }).document.children.map((node) => NodeApi.string(node));

    assert.equal(outcome.status, 'moved');
    assert.deepEqual(projected('proposed'), ['b', 'c', 'a']);
    assert.deepEqual(projected('accepted'), ['a', 'b', 'c']);
  });

  it('moves the block around the caret past the next sibling as one undo entry, keeping the caret', () => {
    const editor = createEditor({
      initialValue: [paragraph('a1'), paragraph('b'), paragraph('c')],
      plugins: [transfer(), history()],
    });
    const caret = { offset: 1, path: [0, 0] };

    editor.update.selection.set({ anchor: caret, focus: caret });

    let commits = 0;
    const unsubscribe = editor.subscribeCommit(() => {
      commits += 1;
    });
    const outcome = editor.api.transfer.move({ to: 'next' });

    unsubscribe();
    assert.equal(outcome.status, 'moved');
    assert.deepEqual(texts(editor), ['b', 'a1', 'c']);
    assert.deepEqual(editor.read.selection(), {
      anchor: { offset: 1, path: [1, 0] },
      focus: { offset: 1, path: [1, 0] },
    });
    assert.equal(commits, 1);

    editor.api.history.undo();

    assert.deepEqual(texts(editor), ['a1', 'b', 'c']);
  });

  it('refuses a step past the first block', () => {
    const editor = createEditor({
      initialValue: [paragraph('a'), paragraph('b')],
      plugins: [transfer()],
    });

    editor.update.selection.set({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    });

    assert.deepEqual(editor.api.transfer.move({ to: 'previous' }), {
      reason: 'no-op',
      status: 'refused',
    });
    assert.deepEqual(texts(editor), ['a', 'b']);
  });

  it('carries the caller announcement on the commit of a landed move', () => {
    const editor = createEditor({
      initialValue: [paragraph('a'), paragraph('b')],
      plugins: [transfer()],
    });
    const announcements: string[] = [];
    const unsubscribe = editor.subscribeCommit((commit) => {
      for (const effect of commit.effects) {
        if (effect.type.key === screenReaderAnnouncementEffect.key) {
          announcements.push(effect.value as string);
        }
      }
    });

    editor.api.transfer.move({
      announce: 'Moved down',
      nodes: [editor.key([0])!],
      to: 'next',
    });
    unsubscribe();

    assert.deepEqual(announcements, ['Moved down']);
  });

  it("lands a commit listener's own update during a move", () => {
    const editor = createEditor({
      initialValue: [paragraph('a'), paragraph('b'), paragraph('c')],
      plugins: [transfer(), history(), authored({ authorId: 'alice' })],
    });
    const view = createEditorView(editor, {
      authored: { intent: 'propose' },
    });
    const unsubscribe = editor.subscribeCommit(() => {
      unsubscribe();
      view.update.text.insert('!', { at: { offset: 1, path: [1, 0] } });
    });

    const outcome = editor.api.transfer.move({
      nodes: [editor.key([0])!],
      to: 'next',
    });

    assert.deepEqual(
      { status: outcome.status, texts: texts(view) },
      { status: 'moved', texts: ['b', 'a!', 'c'] }
    );
  });
});

describe('schema-derived landing', () => {
  it('lands a block inside a container whose content accepts it', () => {
    const editor = createEditor({
      initialValue: [block('quote', paragraph('inside')), paragraph('moved')],
      plugins: [transfer(), nestSchema],
    });

    const outcome = editor.api.transfer.move({
      nodes: [editor.key([1])!],
      to: { edge: 'after', key: editor.key([0, 0])! },
    });

    assert.equal(outcome.status, 'moved');
    assert.deepEqual(
      editor.read
        .children()
        .map((node) => [(node as Element).type, NodeApi.string(node)]),
      [['quote', 'insidemoved']]
    );
  });

  it('refuses an edge inside the payload even when a redirect moves it out', () => {
    const outward = definePlugin('outward', {
      readMiddleware: ({ around }) => [
        around(editorReads.transfer.landing, ({ input, next, state }) =>
          input.target[1].length > 1
            ? { edge: 'after' as const, key: state.key([1])! }
            : next()
        ),
      ],
    });
    const editor = createEditor({
      initialValue: [block('quote', paragraph('own')), paragraph('end')],
      plugins: [transfer(), nestSchema, outward],
    });

    const outcome = editor.api.transfer.move({
      nodes: [editor.key([0])!],
      to: { edge: 'after', key: editor.key([0, 0])! },
    });

    assert.deepEqual(outcome, { reason: 'inside-source', status: 'refused' });
  });

  it('refuses a copy into a parent already at its maximum, at hover', () => {
    const editor = createEditor({
      initialValue: [
        block('pair', paragraph('a'), paragraph('b')),
        paragraph('extra'),
      ],
      plugins: [transfer(), nestSchema],
    });

    const check = checkTransfer(
      editor,
      {
        nodes: [editor.key([1])!],
        to: { edge: 'after', key: editor.key([0, 0])! },
      },
      'copy'
    );

    assert.deepEqual(check, { admitted: false, reason: 'schema' });
  });

  it('admits a move inside a parent already at its maximum', () => {
    const editor = createEditor({
      initialValue: [block('pair', paragraph('a'), paragraph('b'))],
      plugins: [transfer(), nestSchema],
    });

    const outcome = editor.api.transfer.move({
      nodes: [editor.key([0, 0])!],
      to: { edge: 'after', key: editor.key([0, 1])! },
    });

    assert.equal(outcome.status, 'moved');
    assert.deepEqual(texts(editor), ['ba']);
  });

  it('refuses a landing that shifts a prefix sibling out of its slot', () => {
    const editor = createEditor({
      initialValue: [
        block('titled', block('heading', { text: 'title' }), paragraph('p')),
        block('heading', { text: 'loose' }),
      ],
      plugins: [transfer(), nestSchema],
    });

    const check = checkTransfer(
      editor,
      {
        nodes: [editor.key([1])!],
        to: { edge: 'before', key: editor.key([0, 0])! },
      },
      'move'
    );

    assert.deepEqual(check, { admitted: false, reason: 'schema' });
  });

  it('refuses, at hover, a copied block of a type the target container never allows', () => {
    const source = createEditor({
      initialValue: [block('card', { text: 'card' })],
      plugins: [transfer()],
    });
    const destination = createEditor({
      initialValue: [block('box', paragraph('here'))],
      plugins: [
        transfer(),
        definePlugin('derived-box', {
          schema: {
            elements: {
              box: {
                content: schema.content.types(['paragraph'], {
                  default: { type: 'paragraph' },
                  min: 1,
                }),
              },
            },
          },
        }),
      ],
    });

    const check = checkTransfer(
      destination,
      {
        from: source,
        nodes: [source.key([0])!],
        to: { edge: 'after', key: destination.key([0, 0])! },
      },
      'move'
    );

    assert.deepEqual(check, { admitted: false, reason: 'schema' });
  });

  it('checks a copy at hover with the nodes the copy lands', () => {
    const source = createEditor({
      initialValue: [
        {
          type: 'heading',
          role: 'title',
          children: [{ text: 'T' }],
        },
      ],
      plugins: [
        transfer(),
        defineEditorSchema('schema:transfer-contract-drop-role', {
          elements: {
            heading: {
              content: schema.content.text({ default: 'text', min: 1 }),
            },
          },
          id: 'transfer-contract-drop-role',
          properties: [
            schema.elementProperty('role', property.string(), {
              copy: 'drop',
              target: target.type('heading'),
            }),
          ],
          root: schema.content.types(['heading'], {
            default: { type: 'heading' },
            min: 1,
          }),
          unknown: 'reject',
          version: 1,
        }),
      ],
    });
    const editor = createEditor({
      initialValue: [
        block('titled', {
          type: 'heading',
          role: 'title',
          children: [{ text: 'Kept' }],
        }),
      ],
      plugins: [
        transfer(),
        defineEditorSchema('schema:transfer-contract-keep-role', {
          elements: {
            heading: {
              content: schema.content.text({ default: 'text', min: 1 }),
              properties: { role: property.string() },
            },
            titled: {
              content: schema.content.prefix(
                [{ element: 'heading', properties: { role: 'title' } }],
                schema.content.types(['heading'], { min: 0 })
              ),
            },
          },
          id: 'transfer-contract-keep-role',
          root: schema.content.types(['titled'], { min: 1 }),
          unknown: 'reject',
          version: 1,
        }),
      ],
    });
    const input = {
      from: source,
      nodes: [source.key([0])!],
      to: { edge: 'before' as const, key: editor.key([0, 0])! },
    };

    assert.deepEqual(checkTransfer(editor, input, 'copy'), {
      admitted: false,
      reason: 'schema',
    });
    assert.deepEqual(editor.api.transfer.copy(input), {
      reason: 'schema',
      status: 'refused',
    });
  });

  it('admits a text range whose open ancestors the target merges', () => {
    const quotes = defineEditorSchema('schema:transfer-contract-quotes', {
      elements: {
        paragraph: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
        quote: {
          content: schema.content.types(['paragraph'], {
            default: { type: 'paragraph' },
            min: 1,
          }),
        },
      },
      id: 'transfer-contract-quotes',
      root: schema.content.types(['paragraph', 'quote'], {
        default: { type: 'paragraph' },
        min: 1,
      }),
      unknown: 'reject',
      version: 1,
    });
    const editor = createEditor({
      initialValue: [
        block('quote', paragraph('abcd')),
        block('quote', paragraph('x')),
      ],
      plugins: [transfer(), quotes],
    });
    const outcome = editor.api.transfer.copy({
      range: {
        anchor: { offset: 1, path: [0, 0, 0] },
        focus: { offset: 3, path: [0, 0, 0] },
      },
      to: { edge: 'after', key: editor.key([1, 0])! },
    });

    assert.equal(outcome.status, 'copied');
    assert.deepEqual(
      (editor.read.children()[1] as Element).children.map((node) =>
        NodeApi.string(node)
      ),
      ['x', 'bc']
    );
  });

  it('moves an empty container, holding its landing by node paths', () => {
    const Empty = defineEditorSchema('transfer-empty-quote', {
      elements: {
        paragraph: { content: schema.content.text() },
        quote: { content: schema.content.types(['paragraph']) },
      },
      id: 'transfer-empty-quote',
      root: schema.content.types(['paragraph', 'quote'], {
        default: { type: 'paragraph' },
        min: 1,
      }),
      unknown: 'reject',
      version: 1,
    });
    const editor = createEditor({
      initialValue: [
        { type: 'quote', children: [] },
        { type: 'paragraph', children: [{ text: 'x' }] },
      ] as never,
      plugins: [Empty, transfer()],
    });

    const outcome = editor.api.transfer.move({
      nodes: [editor.key([0])!],
      to: { edge: 'after', key: editor.key([1])! },
    });

    assert.deepEqual(outcome, {
      at: {
        anchorPath: [1],
        focusPath: [1],
        kind: 'node',
        mode: 'block',
        paths: [[1]],
      },
      status: 'moved',
    });
    assert.deepEqual(editor.read.children(), [
      { type: 'paragraph', children: [{ text: 'x' }] },
      { type: 'quote', children: [] },
    ]);
  });

  it('keeps a schemaless editor to root edges', () => {
    const editor = createEditor({
      initialValue: [block('quote', paragraph('inside')), paragraph('moved')],
      plugins: [transfer()],
    });

    const outcome = editor.api.transfer.move({
      nodes: [editor.key([1])!],
      to: { edge: 'after', key: editor.key([0, 0])! },
    });

    assert.deepEqual(outcome, { reason: 'schema', status: 'refused' });
    assert.deepEqual(texts(editor), ['inside', 'moved']);
  });
});

describe('transfer nodes read', () => {
  it("names a handle's blocks: the node selection when it holds the node, else the node alone", () => {
    const editor = createEditor({
      initialValue: [paragraph('a'), paragraph('b'), paragraph('c')],
      plugins: [transfer()],
    });
    const [a, b, c] = [0, 1, 2].map((index) => editor.key([index])!);

    editor.update.selection.setNodes([a, b]);

    assert.deepEqual(editor.read.transfer.nodes({ node: b }), [a, b]);
    assert.deepEqual(editor.read.transfer.nodes({ node: c }), [c]);
  });

  it("names a keyboard move's blocks: the selected blocks, else the blocks holding the selection", () => {
    const editor = createEditor({
      initialValue: [paragraph('a'), paragraph('b'), paragraph('c')],
      plugins: [transfer()],
    });
    const [a, b, c] = [0, 1, 2].map((index) => editor.key([index])!);
    const caret = { offset: 0, path: [1, 0] };

    editor.update.selection.set({ anchor: caret, focus: caret });
    assert.deepEqual(editor.read.transfer.nodes(), [b]);

    editor.update.selection.setNodes([a, c]);
    assert.deepEqual(editor.read.transfer.nodes(), [a, c]);
  });

  it('refuses a move that names no blocks', () => {
    const editor = createEditor({
      initialValue: [paragraph('a'), paragraph('b')],
      plugins: [transfer()],
    });
    const input = {
      nodes: [],
      to: { edge: 'after' as const, key: editor.key([1])! },
    };

    assert.deepEqual(checkTransfer(editor, input, 'move'), {
      admitted: false,
      reason: 'source-missing',
    });
    assert.deepEqual(editor.api.transfer.move(input), {
      reason: 'source-missing',
      status: 'refused',
    });
  });

  it('expands the named blocks through the transfer source middleware', () => {
    const pairs = definePlugin('pairs', {
      readMiddleware: ({ around }) => [
        around(editorReads.transfer.source, ({ next }) => {
          const selection = next();

          return selection.paths.some((path) => path[0] === 0)
            ? { ...selection, paths: [[0], [1]] }
            : selection;
        }),
      ],
    });
    const editor = createEditor({
      initialValue: [paragraph('a'), paragraph('b'), paragraph('c')],
      plugins: [transfer(), pairs],
    });

    assert.deepEqual(editor.read.transfer.nodes({ node: editor.key([0])! }), [
      editor.key([0]),
      editor.key([1]),
    ]);
  });

  it('refuses a keyboard step that a landing redirect moves to another parent', () => {
    const escape = definePlugin('escape', {
      readMiddleware: ({ around }) => [
        around(editorReads.transfer.landing, ({ input, next, state }) =>
          input.target[1].length > 1
            ? { edge: 'after' as const, key: state.key([1])! }
            : next()
        ),
      ],
    });
    const editor = createEditor({
      initialValue: [
        block('quote', paragraph('a'), paragraph('b')),
        paragraph('end'),
      ],
      plugins: [transfer(), nestSchema, escape],
    });

    const outcome = editor.api.transfer.move({
      nodes: [editor.key([0, 0])!],
      to: 'next',
    });

    assert.equal(outcome.status, 'refused');
    assert.deepEqual(texts(editor), ['ab', 'end']);
  });

  it('refuses a keyboard step whose blocks span parents', () => {
    const editor = createEditor({
      initialValue: [
        block('quote', paragraph('inside'), paragraph('tail')),
        paragraph('outside'),
        paragraph('last'),
      ],
      plugins: [transfer(), nestSchema],
    });

    const outcome = editor.api.transfer.move({
      nodes: [editor.key([0, 1])!, editor.key([1])!],
      to: 'next',
    });

    assert.deepEqual(outcome, { reason: 'policy', status: 'refused' });
    assert.deepEqual(texts(editor), ['insidetail', 'outside', 'last']);
  });
});

describe('side landing', () => {
  const rowSchema = defineEditorSchema('schema:transfer-contract-row', {
    elements: {
      heading: { content: schema.content.text({ default: 'text', min: 1 }) },
      paragraph: { content: schema.content.text({ default: 'text', min: 1 }) },
      quote: {
        content: schema.content.types(['paragraph'], {
          default: { type: 'paragraph' },
          min: 1,
        }),
      },
      row: {
        content: schema.content.types(['slot'], {
          default: { type: 'slot' },
          min: 2,
        }),
      },
      slot: {
        content: schema.content.types(['paragraph', 'quote'], {
          default: { type: 'paragraph' },
          min: 1,
        }),
      },
    },
    id: 'transfer-contract-row',
    root: schema.content.types(['heading', 'paragraph', 'quote', 'row'], {
      default: { type: 'paragraph' },
      min: 1,
    }),
    unknown: 'reject',
    version: 1,
  });
  const beside = definePlugin('beside', {
    readMiddleware: ({ around }) => [
      around(editorReads.transfer.side, ({ input, next }) =>
        input.target[1].length === 1
          ? {
              payload: [input.side === 'end' ? 1 : 0],
              shell: {
                children: [
                  { children: [], type: 'slot' },
                  { children: [], type: 'slot' },
                ],
                type: 'row',
              },
              target: [input.side === 'end' ? 0 : 1],
            }
          : next()
      ),
    ],
  });
  const shape = (editor: { read: { children: () => readonly Descendant[] } }) =>
    editor.read
      .children()
      .map((node) =>
        (node as Element).type === 'row'
          ? (node as Element).children.map((slot) =>
              (slot as Element).children.map((child) => NodeApi.string(child))
            )
          : NodeApi.string(node)
      );

  it('refuses a side drop when no feature builds one', () => {
    const editor = createEditor({
      initialValue: [paragraph('target'), paragraph('dragged')],
      plugins: [transfer(), rowSchema],
    });

    const outcome = editor.api.transfer.move({
      nodes: [editor.key([1])!],
      to: { key: editor.key([0])!, side: 'end' },
    });

    assert.deepEqual(outcome, { reason: 'policy', status: 'refused' });
  });

  it('wraps an adjacent sibling beside its target, keeping both keys', () => {
    const editor = createEditor({
      initialValue: [paragraph('target'), paragraph('dragged')],
      plugins: [transfer(), rowSchema, beside],
    });
    const targetKey = editor.key([0]);
    const draggedKey = editor.key([1]);

    const outcome = editor.api.transfer.move({
      nodes: [draggedKey!],
      to: { key: targetKey!, side: 'end' },
    });

    assert.equal(outcome.status, 'moved');
    assert.deepEqual(shape(editor), [[['target'], ['dragged']]]);
    assert.deepEqual(
      [editor.key([0, 0, 0]), editor.key([0, 1, 0])],
      [targetKey, draggedKey]
    );
  });

  it('lands several blocks dropped before their target beside it, selected', () => {
    const editor = createEditor({
      initialValue: [paragraph('one'), paragraph('two'), paragraph('target')],
      plugins: [transfer(), rowSchema, beside],
    });

    const outcome = editor.api.transfer.move({
      nodes: [editor.key([0])!, editor.key([1])!],
      to: { key: editor.key([2])!, side: 'start' },
    });

    assert.deepEqual(
      [outcome.status === 'moved' && outcome.at, shape(editor)],
      [
        {
          anchorPath: [0, 0, 0],
          focusPath: [0, 0, 1],
          kind: 'node',
          mode: 'block',
          paths: [
            [0, 0, 0],
            [0, 0, 1],
          ],
        },
        [[['one', 'two'], ['target']]],
      ]
    );
  });

  it('refuses a wrap whose slots are missing, filled or shared', () => {
    const build = (shell: Element, payload: number[], slot: number[]) =>
      definePlugin('bad-beside', {
        readMiddleware: ({ around }) => [
          around(editorReads.transfer.side, () => ({
            payload,
            shell,
            target: slot,
          })),
        ],
      });
    const slots = (...children: Element[]) => ({ children, type: 'row' });
    const refusals = [
      build(slots({ children: [], type: 'slot' }), [0], [3]),
      build(
        slots(
          { children: [paragraph('x')], type: 'slot' },
          { children: [], type: 'slot' }
        ),
        [0],
        [1]
      ),
      build(
        slots({ children: [], type: 'slot' }, { children: [], type: 'slot' }),
        [1],
        [1]
      ),
    ].map((plugin) => {
      const editor = createEditor({
        initialValue: [paragraph('target'), paragraph('dragged')],
        plugins: [transfer(), rowSchema, plugin],
      });

      return editor.api.transfer.move({
        nodes: [editor.key([1])!],
        to: { key: editor.key([0])!, side: 'end' },
      });
    });

    assert.deepEqual(refusals, [
      { reason: 'policy', status: 'refused' },
      { reason: 'policy', status: 'refused' },
      { reason: 'policy', status: 'refused' },
    ]);
  });

  it('undoes a side drop in one step', () => {
    const editor = createEditor({
      initialValue: [paragraph('target'), paragraph('dragged')],
      plugins: [transfer(), history(), rowSchema, beside],
    });

    editor.api.transfer.move({
      nodes: [editor.key([1])!],
      to: { key: editor.key([0])!, side: 'start' },
    });
    editor.api.history.undo();

    assert.deepEqual(shape(editor), ['target', 'dragged']);
  });

  it('refuses a copy at a side', () => {
    const editor = createEditor({
      initialValue: [paragraph('target'), paragraph('dragged')],
      plugins: [transfer(), rowSchema, beside],
    });

    const outcome = editor.api.transfer.copy({
      nodes: [editor.key([1])!],
      to: { key: editor.key([0])!, side: 'end' },
    });

    assert.deepEqual(outcome, { reason: 'policy', status: 'refused' });
  });

  it('refuses, at hover, a side drop whose target its slot does not allow', () => {
    const editor = createEditor({
      initialValue: [
        block('heading', { text: 'target' }),
        paragraph('dragged'),
      ],
      plugins: [transfer(), rowSchema, beside],
    });

    assert.deepEqual(
      editor.read.transfer.check({
        nodes: [editor.key([1])!],
        to: { key: editor.key([0])!, side: 'end' },
      }),
      { admitted: false, reason: 'schema' }
    );
  });

  it('refuses, at hover, a side drop whose payload its slot does not allow', () => {
    const editor = createEditor({
      initialValue: [
        paragraph('target'),
        block('heading', { text: 'dragged' }),
      ],
      plugins: [transfer(), rowSchema, beside],
    });

    assert.deepEqual(
      editor.read.transfer.check({
        nodes: [editor.key([1])!],
        to: { key: editor.key([0])!, side: 'end' },
      }),
      { admitted: false, reason: 'schema' }
    );
  });

  it('lets a veto refuse the target that a wrap moves', () => {
    const pinned = definePlugin('pinned', {
      contributions: [
        transferVeto.of(
          ({ payload, wrap }) =>
            wrap !== undefined &&
            payload.kind === 'nodes' &&
            payload.nodes.some((node) => NodeApi.string(node) === 'pinned')
        ),
      ],
    });
    const editor = createEditor({
      initialValue: [paragraph('pinned'), paragraph('dragged')],
      plugins: [transfer(), rowSchema, beside, pinned],
    });

    const outcome = editor.api.transfer.move({
      nodes: [editor.key([1])!],
      to: { key: editor.key([0])!, side: 'end' },
    });

    assert.deepEqual(outcome, { reason: 'policy', status: 'refused' });
  });

  it('refuses a target whose feature family reaches past it', () => {
    const families = definePlugin('families', {
      readMiddleware: ({ around }) => [
        around(editorReads.transfer.source, ({ next }) => {
          const selection = next();

          return selection.paths.some((path) => path[0] === 0)
            ? { ...selection, paths: [[0], [1]] }
            : selection;
        }),
      ],
    });
    const editor = createEditor({
      initialValue: [paragraph('parent'), paragraph('child')],
      plugins: [transfer(), rowSchema, beside, families],
    });

    const outcome = editor.api.transfer.move({
      nodes: [editor.key([1])!],
      to: { key: editor.key([0])!, side: 'end' },
    });

    assert.deepEqual(outcome, { reason: 'policy', status: 'refused' });
  });

  it('refuses a target that holds the payload', () => {
    const editor = createEditor({
      initialValue: [block('quote', paragraph('inside'))],
      plugins: [transfer(), rowSchema, beside],
    });

    const outcome = editor.api.transfer.move({
      nodes: [editor.key([0, 0])!],
      to: { key: editor.key([0])!, side: 'end' },
    });

    assert.deepEqual(outcome, { reason: 'inside-source', status: 'refused' });
  });

  it('checks a transfer against the vetoes its move obeys', () => {
    const blockEnd = definePlugin('block-end', {
      contributions: [
        transferVeto.of(
          ({ edge, target: [, path] }) => edge === 'after' && path[0] === 0
        ),
      ],
    });
    const editor = createEditor({
      initialValue: [paragraph('a'), paragraph('b'), paragraph('c')],
      plugins: [transfer(), blockEnd],
    });

    assert.deepEqual(
      editor.read.transfer.check({
        nodes: [editor.key([2])!],
        to: { edge: 'after', key: editor.key([0])! },
      }),
      { admitted: false, reason: 'policy' }
    );
  });
});

const moveText = () =>
  schema.content.any([schema.content.text(), schema.content.type('link')], {
    default: 'text',
    min: 1,
  });
const moveBlocks = ['heading', 'paragraph', 'title'];
const moveSchema = defineEditorSchema('schema:transfer-contract-move', {
  elements: {
    heading: { content: moveText(), properties: { level: property.number() } },
    link: {
      content: schema.content.text({ default: 'text', min: 1 }),
      inline: true,
      properties: { url: property.string() },
    },
    paragraph: { content: moveText() },
    title: { content: moveText(), slice: { preserveContext: true } },
  },
  id: 'transfer-contract-move',
  properties: [
    schema.elementProperty('align', property.string(), {
      target: target.types(moveBlocks),
      typeChange: 'preserve-if-allowed',
    }),
    schema.elementProperty('checked', property.boolean(), {
      target: target.types(moveBlocks),
    }),
  ],
  root: schema.content.types(moveBlocks, {
    default: { type: 'paragraph' },
    min: 1,
  }),
  unknown: 'reject',
  version: 1,
});

/** A landing read that rewrites what a text move lands. */
const onMove = (
  name: string,
  land: (landed: SliceLanding, input: SliceLandingInput) => SliceLanding
) =>
  definePlugin(name, {
    readMiddleware: ({ around }) => [
      around(editorReads.slice.landing, ({ input, next }) =>
        input.intent === 'move' ? land(next(), input) : next()
      ),
    ],
  });
const mapLanded = (
  name: string,
  map: (node: Descendant, index: number) => Descendant
) =>
  onMove(name, (landed) => ({
    ...landed,
    slice: ContentSlice.withContent(
      landed.slice,
      landed.slice.content.map(map),
      { open: 'preserve' }
    ),
  }));
const textRange = (
  [anchorBlock, anchorOffset]: [number, number],
  [focusBlock, focusOffset]: [number, number]
) => ({
  anchor: { offset: anchorOffset, path: [anchorBlock, 0] },
  focus: { offset: focusOffset, path: [focusBlock, 0] },
});

describe('text moves', () => {
  it('lands a property a landing read declares as following the drop, and undoes in one step', () => {
    const before = [
      paragraph('ab'),
      { ...paragraph('cd'), depth: 1, group: 'x' },
      paragraph('ef'),
      paragraph('gh'),
    ];
    const declaredSchema = defineEditorSchema('schema:transfer-move-declared', {
      ...moveSchema.schema,
      properties: [
        ...(moveSchema.schema.properties ?? []),
        schema.elementProperty('depth', property.number(), {
          landing: 'rebase',
          target: target.types(moveBlocks),
        }),
        schema.elementProperty('group', property.string(), {
          landing: 'adopt',
          target: target.types(moveBlocks),
        }),
      ],
    });
    const editor = createEditor({
      initialValue: before,
      plugins: [
        transfer(),
        history(),
        declaredSchema,
        mapLanded('rebase-moved', (node) =>
          ElementApi.isElement(node) && 'depth' in node
            ? { ...node, depth: 3, group: 'y' }
            : node
        ),
      ],
    });

    const outcome = editor.api.transfer.move({
      range: textRange([0, 1], [2, 1]),
      to: { point: { offset: 1, path: [3, 0] } },
    });

    assert.deepEqual(
      { children: editor.read.children(), status: outcome.status },
      {
        children: [
          paragraph('af'),
          paragraph('gb'),
          { ...paragraph('cd'), depth: 3, group: 'y' },
          paragraph('eh'),
        ],
        status: 'moved',
      }
    );

    editor.api.history.undo();

    assert.deepEqual(editor.read.children(), before);
  });

  it('refuses a move whose landing read drops moved text, and publishes nothing', () => {
    const editor = createEditor({
      initialValue: [paragraph('ab'), paragraph('cd'), paragraph('ef')],
      plugins: [
        transfer(),
        moveSchema,
        mapLanded('drop-text', (node) =>
          ElementApi.isElement(node)
            ? { ...node, children: [{ text: '' }] }
            : node
        ),
      ],
    });
    let commits = 0;
    const unsubscribe = editor.subscribeCommit(() => {
      commits += 1;
    });

    const outcome = editor.api.transfer.move({
      range: textRange([0, 0], [1, 2]),
      to: { point: { offset: 1, path: [2, 0] } },
    });

    unsubscribe();
    assert.deepEqual(
      { commits, outcome, texts: texts(editor) },
      {
        commits: 0,
        outcome: { reason: 'lossy', status: 'refused' },
        texts: ['ab', 'cd', 'ef'],
      }
    );
  });

  for (const [name, change] of [
    ['a heading level', { level: 2 }],
    ['a checked state', { checked: true }],
  ] as const) {
    it(`refuses a move whose landing read changes ${name}, which no plugin declares as following the drop`, () => {
      const editor = createEditor({
        initialValue: [
          paragraph('ab'),
          { ...block('heading', { text: 'cd' }), level: 1 },
          paragraph('ef'),
          paragraph('gh'),
        ],
        plugins: [
          transfer(),
          moveSchema,
          mapLanded('change-undeclared', (node) =>
            ElementApi.isElement(node) && node.type === 'heading'
              ? { ...node, ...change }
              : node
          ),
        ],
      });

      const outcome = editor.api.transfer.move({
        range: textRange([0, 1], [2, 1]),
        to: { point: { offset: 1, path: [3, 0] } },
      });

      assert.deepEqual(
        { outcome, texts: texts(editor) },
        {
          outcome: { reason: 'lossy', status: 'refused' },
          texts: ['ab', 'cd', 'ef', 'gh'],
        }
      );
    });
  }

  it('refuses a move whose landing read opens a closed title into a paragraph', () => {
    const title = { ...block('title', { text: 'Head' }), align: 'left' };
    const editor = createEditor({
      initialValue: [title, paragraph('ab')],
      plugins: [
        transfer(),
        moveSchema,
        onMove('open-title', (landed) => ({
          ...landed,
          slice: ContentSlice.fromJSON({
            content: [paragraph('Head')],
            openEnd: 1,
            openStart: 1,
          }),
        })),
      ],
    });

    const outcome = editor.api.transfer.move({
      range: textRange([0, 0], [0, 4]),
      to: { point: { offset: 1, path: [1, 0] } },
    });

    assert.deepEqual(
      { children: editor.read.children(), outcome },
      {
        children: [title, paragraph('ab')],
        outcome: { reason: 'lossy', status: 'refused' },
      }
    );
  });

  for (const edge of ['first', 'last'] as const) {
    it(`refuses a move whose landing read changes a link on the ${edge} branch`, () => {
      const linked = (before: string, label: string, after: string) => ({
        type: 'paragraph',
        children: [
          { text: before },
          { type: 'link', url: 'a', children: [{ text: label }] },
          { text: after },
        ],
      });
      const editor = createEditor({
        initialValue: [
          linked('a', 'bc', 'd'),
          linked('e', 'fg', 'h'),
          paragraph('ij'),
        ],
        plugins: [
          transfer(),
          moveSchema,
          mapLanded('relink', (node, index) =>
            ElementApi.isElement(node) && index === (edge === 'first' ? 0 : 1)
              ? {
                  ...node,
                  children: node.children.map((child) =>
                    ElementApi.isElement(child) && child.type === 'link'
                      ? { ...child, url: 'b' }
                      : child
                  ),
                }
              : node
          ),
        ],
      });

      const outcome = editor.api.transfer.move({
        range: {
          anchor: { offset: 1, path: [0, 1, 0] },
          focus: { offset: 1, path: [1, 1, 0] },
        },
        to: { point: { offset: 1, path: [2, 0] } },
      });

      assert.deepEqual(
        { outcome, texts: texts(editor) },
        {
          outcome: { reason: 'lossy', status: 'refused' },
          texts: ['abcd', 'efgh', 'ij'],
        }
      );
    });
  }

  it('refuses a move a landing read grows past the length limit, and publishes nothing', () => {
    const editor = createEditor({
      initialValue: [paragraph('abcd'), paragraph('ef')],
      maxLength: 7,
      plugins: [
        transfer(),
        moveSchema,
        mapLanded('grow', (node) =>
          ElementApi.isElement(node)
            ? { ...node, children: [{ text: 'bcdbcd' }] }
            : node
        ),
      ],
    });

    const outcome = editor.api.transfer.move({
      range: textRange([0, 1], [0, 4]),
      to: { point: { offset: 1, path: [1, 0] } },
    });

    assert.deepEqual(
      { outcome, texts: texts(editor) },
      {
        outcome: { reason: 'lossy', status: 'refused' },
        texts: ['abcd', 'ef'],
      }
    );
  });

  it('refuses a move the length limit cuts to nothing, and publishes nothing', () => {
    const editor = createEditor({
      initialValue: [paragraph('abcdef'), paragraph('gh')],
      maxLength: 4,
      plugins: [transfer(), moveSchema],
    });

    const outcome = editor.api.transfer.move({
      range: textRange([0, 0], [0, 2]),
      to: { point: { offset: 1, path: [1, 0] } },
    });

    assert.deepEqual(
      { outcome, texts: texts(editor) },
      {
        outcome: { reason: 'lossy', status: 'refused' },
        texts: ['abcdef', 'gh'],
      }
    );
  });

  it('merges selected heading text into the paragraph it lands in', () => {
    const editor = createEditor({
      initialValue: [
        { ...block('heading', { text: 'Title' }), level: 1 },
        paragraph('ab'),
      ],
      plugins: [transfer(), moveSchema],
    });

    const outcome = editor.api.transfer.move({
      range: textRange([0, 1], [0, 3]),
      to: { point: { offset: 1, path: [1, 0] } },
    });

    assert.deepEqual(
      { children: editor.read.children(), status: outcome.status },
      {
        children: [
          { ...block('heading', { text: 'Tle' }), level: 1 },
          paragraph('aitb'),
        ],
        status: 'moved',
      }
    );
  });

  it('refuses a move whose landing read changes a closed title it keeps whole', () => {
    const editor = createEditor({
      initialValue: [
        { ...block('title', { text: 'Head' }), align: 'left' },
        paragraph('ab'),
      ],
      plugins: [
        transfer(),
        moveSchema,
        mapLanded('realign', (node) =>
          ElementApi.isElement(node) && node.type === 'title'
            ? { ...node, align: 'right' }
            : node
        ),
      ],
    });

    const outcome = editor.api.transfer.move({
      range: textRange([0, 0], [0, 4]),
      to: { point: { offset: 1, path: [1, 0] } },
    });

    assert.deepEqual(
      { outcome, texts: texts(editor) },
      {
        outcome: { reason: 'lossy', status: 'refused' },
        texts: ['Head', 'ab'],
      }
    );
  });

  it('lands a closed title inside a paragraph', () => {
    const editor = createEditor({
      initialValue: [
        { ...block('title', { text: 'Head' }), align: 'left' },
        paragraph('ab'),
      ],
      plugins: [transfer(), moveSchema],
    });

    const outcome = editor.api.transfer.move({
      range: textRange([0, 0], [0, 4]),
      to: { point: { offset: 1, path: [1, 0] } },
    });

    assert.deepEqual(
      { children: editor.read.children(), status: outcome.status },
      {
        children: [
          { ...block('title', { text: '' }), align: 'left' },
          paragraph('a'),
          { ...block('title', { text: 'Head' }), align: 'left' },
          paragraph('b'),
        ],
        status: 'moved',
      }
    );
  });

  const replaceEmpty = (
    name: string,
    head: (node: Descendant) => Descendant = (node) => node
  ) =>
    onMove(name, (landed, input) =>
      input.target.kind === 'empty'
        ? {
            ...landed,
            replaceEmpty: {
              slice: ContentSlice.closed(
                landed.slice.content.map((node, index) =>
                  index === 0 ? head(node) : node
                )
              ),
            },
          }
        : landed
    );
  const aligned = { ...paragraph(''), align: 'center' };

  for (const [source, range, landed] of [
    [
      'an open',
      textRange([0, 1], [0, 2]),
      [paragraph('a'), { ...paragraph('b'), align: 'center' }],
    ],
    [
      'a closed',
      textRange([0, 0], [0, 4]),
      [
        block('title', { text: '' }),
        { ...block('title', { text: 'Head' }), align: 'center' },
      ],
    ],
  ] as const) {
    it(`replaces an empty aligned block with ${source} moved head, keeping the alignment, and undoes in one step`, () => {
      const before = [
        source === 'an open'
          ? paragraph('ab')
          : block('title', { text: 'Head' }),
        aligned,
        paragraph('cd'),
      ];
      const editor = createEditor({
        initialValue: before,
        plugins: [
          transfer(),
          history(),
          moveSchema,
          replaceEmpty('replace-empty'),
        ],
      });

      const outcome = editor.api.transfer.move({
        range,
        to: { point: { offset: 0, path: [1, 0] } },
      });

      assert.deepEqual(
        { children: editor.read.children(), status: outcome.status },
        { children: [...landed, paragraph('cd')], status: 'moved' }
      );

      editor.api.history.undo();

      assert.deepEqual(editor.read.children(), before);
    });
  }

  const checkLanded = definePlugin('check-landed', {
    corrections: [
      {
        event: 'content',
        correct({ entry: [node, path], tx }) {
          if (
            ElementApi.isElement(node) &&
            node.align === 'center' &&
            NodeApi.string(node) === 'b' &&
            !node.checked
          ) {
            tx.nodes.set({ checked: true }, { at: path });
          }
        },
      },
    ],
  });

  for (const [change, plugin] of [
    [
      'a landing read changes its checked state',
      replaceEmpty('check-head', (node) => ({ ...node, checked: true })),
    ],
    ['a correction changes its checked state', checkLanded],
    [
      "a landing read adds an alignment other than the replaced block's",
      replaceEmpty('realign-head', (node) => ({ ...node, align: 'right' })),
    ],
  ] as const) {
    it(`refuses a move into an empty block when ${change}`, () => {
      const editor = createEditor({
        initialValue: [
          { ...paragraph('ab'), checked: false },
          aligned,
          paragraph('cd'),
        ],
        plugins: [
          transfer(),
          moveSchema,
          ...(plugin === checkLanded
            ? [replaceEmpty('replace-empty'), plugin]
            : [plugin]),
        ],
      });

      const outcome = editor.api.transfer.move({
        range: textRange([0, 1], [0, 2]),
        to: { point: { offset: 0, path: [1, 0] } },
      });

      assert.deepEqual(
        { outcome, texts: texts(editor) },
        {
          outcome: { reason: 'lossy', status: 'refused' },
          texts: ['ab', '', 'cd'],
        }
      );
    });
  }

  it('lands a move whose source comes before the drop point in the same parent', () => {
    const editor = createEditor({
      initialValue: [paragraph('abc'), paragraph('de'), paragraph('fg')],
      plugins: [transfer(), moveSchema],
    });

    const outcome = editor.api.transfer.move({
      range: textRange([0, 1], [1, 1]),
      to: { point: { offset: 1, path: [2, 0] } },
    });

    assert.deepEqual(
      { status: outcome.status, texts: texts(editor) },
      { status: 'moved', texts: ['ae', 'fbc', 'dg'] }
    );
  });

  const endChecked = () => [
    paragraph('ab'),
    { ...paragraph('cd'), checked: true },
    paragraph('ef'),
  ];
  const mapEnd = (name: string, map: (node: Element) => Descendant) =>
    onMove(name, (landed) => ({
      ...landed,
      slice: ContentSlice.withContent(
        landed.slice,
        landed.slice.content.map((node, index) =>
          index === landed.slice.content.length - 1 &&
          ElementApi.isElement(node)
            ? map(node)
            : node
        ),
        { open: 'preserve' }
      ),
    }));
  const refusesUnchanged = (
    initialValue: Descendant[],
    plugins: readonly unknown[],
    range: {
      anchor: { offset: number; path: number[] };
      focus: { offset: number; path: number[] };
    },
    point: { offset: number; path: number[] },
    schemaPlugin: unknown = moveSchema
  ) => {
    const editor = createEditor({
      initialValue,
      plugins: [transfer(), schemaPlugin, ...plugins] as never[],
    });
    let commits = 0;
    const unsubscribe = editor.subscribeCommit(() => {
      commits += 1;
    });

    const outcome = editor.api.transfer.move({ range, to: { point } });

    unsubscribe();
    assert.deepEqual(
      { children: editor.read.children(), commits, outcome },
      {
        children: initialValue,
        commits: 0,
        outcome: { reason: 'lossy', status: 'refused' },
      }
    );
  };

  for (const [name, map] of [
    ['unticks', (node: Element) => ({ ...node, checked: false })],
    [
      'retypes as a heading',
      (node: Element) => ({ ...node, level: 1, type: 'heading' }),
    ],
    [
      "drops the checked state so the drop block's shell matches,",
      ({ checked: _checked, ...node }: Element) => node as Element,
    ],
  ] as const) {
    it(`refuses a move whose landing read ${name} the block that holds the range's end`, () => {
      refusesUnchanged(
        endChecked(),
        [mapEnd('change-end', map)],
        textRange([0, 1], [1, 1]),
        { offset: 1, path: [2, 0] }
      );
    });
  }

  it("refuses a move whose correction unticks the block that holds the range's end", () => {
    const untickLanded = definePlugin('untick-landed', {
      corrections: [
        {
          event: 'content',
          correct({ entry: [node, path], tx }) {
            if (
              ElementApi.isElement(node) &&
              node.checked &&
              NodeApi.string(node) === 'cf'
            ) {
              tx.nodes.set({ checked: false }, { at: path });
            }
          },
        },
      ],
    });

    refusesUnchanged(endChecked(), [untickLanded], textRange([0, 1], [1, 1]), {
      offset: 1,
      path: [2, 0],
    });
  });

  const quoteSchema = defineEditorSchema('schema:transfer-contract-quote', {
    elements: {
      link: {
        content: schema.content.text({ default: 'text', min: 1 }),
        inline: true,
        properties: { url: property.string() },
      },
      paragraph: { content: moveText() },
      quote: {
        content: schema.content.types(['paragraph', 'quote'], {
          default: { type: 'paragraph' },
          min: 1,
        }),
      },
    },
    id: 'transfer-contract-quote',
    properties: [
      schema.elementProperty('checked', property.boolean(), {
        target: target.types(['paragraph', 'quote']),
      }),
    ],
    root: schema.content.types(['paragraph', 'quote'], {
      default: { type: 'paragraph' },
      min: 1,
    }),
    unknown: 'reject',
    version: 1,
  });
  const quote = (...children: Descendant[]): Element => ({
    type: 'quote',
    children,
  });

  it("refuses a move whose landing read unticks a quote that holds the range's end", () => {
    refusesUnchanged(
      [
        quote(paragraph('ab')),
        { ...quote(paragraph('cd')), checked: true },
        quote(paragraph('ef')),
      ],
      [mapEnd('untick-quote', (node) => ({ ...node, checked: false }))],
      {
        anchor: { offset: 1, path: [0, 0, 0] },
        focus: { offset: 1, path: [1, 0, 0] },
      },
      { offset: 1, path: [2, 0, 0] },
      quoteSchema
    );
  });

  const itemSchema = defineEditorSchema('schema:transfer-contract-item', {
    elements: {
      item: {
        content: schema.content.types(['paragraph'], {
          default: { type: 'paragraph' },
          max: 1,
          min: 1,
        }),
      },
      list: {
        content: schema.content.types(['item'], {
          default: { type: 'item' },
          min: 1,
        }),
      },
      paragraph: {
        content: schema.content.text({ default: 'text', min: 1 }),
      },
    },
    id: 'transfer-contract-item',
    root: schema.content.types(['list', 'paragraph'], {
      default: { type: 'paragraph' },
      min: 1,
    }),
    unknown: 'reject',
    version: 1,
  });
  const itemList = (...labels: string[]): Element => ({
    type: 'list',
    children: labels.map((text) => ({
      type: 'item',
      children: [paragraph(text)],
    })),
  });

  it('refuses, for now, a move that a paste would land inside items the schema creates', () => {
    const initialValue = [
      paragraph('ab'),
      paragraph('X'),
      paragraph('cd'),
      itemList('ef'),
    ];
    refusesUnchanged(
      initialValue,
      [],
      textRange([0, 1], [2, 1]),
      { offset: 1, path: [3, 0, 0, 0] },
      itemSchema
    );
  });

  for (const [path, end] of [
    ['local', { ...paragraph('cd'), checked: true }],
    ['prepared', paragraph('cd')],
  ] as const) {
    it(`lands the moved head in the drop block and the end block as itself on the ${path} path`, () => {
      const editor = createEditor({
        initialValue: [paragraph('ab'), end, paragraph('ef')],
        plugins: [transfer(), moveSchema],
      });

      const outcome = editor.api.transfer.move({
        range: textRange([0, 1], [1, 1]),
        to: { point: { offset: 1, path: [2, 0] } },
      });

      assert.deepEqual(
        { children: editor.read.children(), status: outcome.status },
        {
          children: [
            paragraph('ad'),
            paragraph('eb'),
            { ...end, children: [{ text: 'cf' }] },
          ],
          status: 'moved',
        }
      );
    });
  }

  it("refuses a move whose landing read unticks the empty block that holds the range's end", () => {
    refusesUnchanged(
      endChecked(),
      [mapEnd('untick-empty-end', (node) => ({ ...node, checked: false }))],
      textRange([0, 1], [1, 0]),
      { offset: 1, path: [2, 0] }
    );
  });

  it('refuses a move whose landing read drops the last block it carries', () => {
    refusesUnchanged(
      [paragraph('ab'), paragraph('cd'), paragraph('ef'), paragraph('gh')],
      [
        onMove('drop-last', (landed) => ({
          ...landed,
          slice: ContentSlice.withContent(
            landed.slice,
            landed.slice.content.slice(0, -1),
            { open: 'preserve' }
          ),
        })),
      ],
      textRange([0, 1], [2, 1]),
      { offset: 1, path: [3, 0] }
    );
  });

  for (const [name, initialValue, range, landed] of [
    [
      "ends at a block's start, landing only its text and keeping that block once",
      endChecked(),
      textRange([0, 0], [1, 0]),
      [paragraph(''), { ...paragraph('cd'), checked: true }, paragraph('eabf')],
    ],
    [
      'starts with an empty block, onto an aligned block',
      [
        paragraph('ab'),
        { ...paragraph(''), checked: true },
        paragraph('cd'),
        { ...paragraph('ef'), align: 'center' },
      ],
      textRange([0, 2], [2, 1]),
      [
        paragraph('abd'),
        { ...paragraph('e'), align: 'center' },
        { ...paragraph(''), checked: true },
        paragraph('cf'),
      ],
    ],
    [
      'holds only a paragraph break',
      endChecked(),
      textRange([0, 2], [1, 0]),
      [paragraph('abcd'), paragraph('e'), { ...paragraph('f'), checked: true }],
    ],
  ] as const) {
    it(`lands a move whose range ${name}`, () => {
      const editor = createEditor({
        initialValue: [...initialValue],
        plugins: [transfer(), moveSchema],
      });

      const outcome = editor.api.transfer.move({
        range,
        to: { point: { offset: 1, path: [initialValue.length - 1, 0] } },
      });

      assert.deepEqual(
        { children: editor.read.children(), status: outcome.status },
        { children: landed, status: 'moved' }
      );
    });
  }

  const textPoint = (path: number[], offset: number) => ({ offset, path });
  const inlineLink = (text: string): Element => ({
    type: 'link',
    url: 'u',
    children: [{ text }],
  });
  const linkedParagraph = (...children: Descendant[]): Element => ({
    type: 'paragraph',
    children,
  });
  const endLinked = () => [
    paragraph('ab'),
    { ...paragraph('cd'), checked: true },
    linkedParagraph({ text: 'e' }, inlineLink('xy'), { text: 'z' }),
  ];
  const movesTo = (
    initialValue: Descendant[],
    range: {
      anchor: ReturnType<typeof textPoint>;
      focus: ReturnType<typeof textPoint>;
    },
    point: ReturnType<typeof textPoint>,
    landed: Descendant[],
    schemaPlugin: unknown = moveSchema
  ) => {
    const editor = createEditor({
      initialValue,
      plugins: [transfer(), schemaPlugin] as never[],
    });

    const outcome = editor.api.transfer.move({ range, to: { point } });

    assert.deepEqual(
      { children: editor.read.children(), status: outcome.status },
      { children: landed, status: 'moved' }
    );
  };

  it("lands a move whose range starts at a block's end, dropped inside a block", () => {
    movesTo(endChecked(), textRange([0, 2], [1, 1]), textPoint([2, 0], 1), [
      paragraph('abd'),
      paragraph('e'),
      { ...paragraph('cf'), checked: true },
    ]);
  });

  it("lands a move whose range ends at a block's start, dropped at a block's end", () => {
    movesTo(endChecked(), textRange([1, 1], [2, 0]), textPoint([0, 0], 2), [
      paragraph('abd'),
      paragraph(''),
      { ...paragraph('cef'), checked: true },
    ]);
  });

  for (const [name, offset, landed] of [
    [
      "a block's end",
      2,
      [paragraph('abcd'), paragraph('ef'), { ...paragraph(''), checked: true }],
    ],
    [
      "a block's start",
      0,
      [paragraph('abcd'), paragraph(''), { ...paragraph('ef'), checked: true }],
    ],
  ] as const) {
    it(`lands a move that holds only a paragraph break, dropped at ${name}`, () => {
      movesTo(
        endChecked(),
        textRange([0, 2], [1, 0]),
        textPoint([2, 0], offset),
        [...landed]
      );
    });
  }

  it('lands part of one block dropped inside a link', () => {
    movesTo(
      [
        paragraph('abc'),
        linkedParagraph({ text: 'e' }, inlineLink('xy'), { text: 'z' }),
      ],
      textRange([0, 1], [0, 2]),
      textPoint([1, 1, 0], 1),
      [
        paragraph('ac'),
        linkedParagraph(
          { text: 'e' },
          inlineLink('x'),
          { text: 'b' },
          inlineLink('y'),
          { text: 'z' }
        ),
      ]
    );
  });

  for (const [name, end, landed] of [
    [
      'ends inside a block',
      1,
      [
        paragraph('ad'),
        linkedParagraph({ text: 'e' }, inlineLink('x'), { text: 'b' }),
        {
          ...linkedParagraph({ text: 'c' }, inlineLink('y'), { text: 'z' }),
          checked: true,
        },
      ],
    ],
    [
      "ends at a block's start",
      0,
      [
        paragraph('acd'),
        linkedParagraph({ text: 'e' }, inlineLink('x'), { text: 'b' }),
        {
          ...linkedParagraph({ text: '' }, inlineLink('y'), { text: 'z' }),
          checked: true,
        },
      ],
    ],
  ] as const) {
    it(`lands a move whose range ${name}, dropped inside a link`, () => {
      movesTo(
        endLinked(),
        textRange([0, 1], [1, end]),
        textPoint([2, 1, 0], 1),
        [...landed]
      );
    });
  }

  it("lands a nested move dropped at a quoted block's end", () => {
    movesTo(
      [
        quote(paragraph('ab')),
        quote({ ...paragraph('cd'), checked: true }),
        quote(paragraph('ef')),
      ],
      {
        anchor: textPoint([0, 0, 0], 1),
        focus: textPoint([1, 0, 0], 1),
      },
      textPoint([2, 0, 0], 2),
      [
        quote(paragraph('ad')),
        quote(paragraph('ef'), paragraph('b')),
        quote({ ...paragraph('c'), checked: true }, paragraph('')),
      ],
      quoteSchema
    );
  });

  it("lands a move whose range ends inside a link, dropped at a quoted block's end", () => {
    movesTo(
      [
        paragraph('ab'),
        quote(paragraph('cd')),
        linkedParagraph({ text: 'e' }, inlineLink('xy'), { text: 'z' }),
      ],
      {
        anchor: textPoint([2, 0], 1),
        focus: textPoint([2, 1, 0], 1),
      },
      textPoint([1, 0, 0], 2),
      [
        paragraph('ab'),
        quote(linkedParagraph({ text: 'cd' }, inlineLink('x'), { text: '' })),
        linkedParagraph({ text: 'e' }, inlineLink('y'), { text: 'z' }),
      ],
      quoteSchema
    );
  });

  const betweenLinks = () => [
    linkedParagraph({ text: 'a' }, inlineLink('bc'), { text: '' }),
    {
      ...linkedParagraph({ text: '' }, inlineLink('de'), { text: 'f' }),
      checked: true,
    },
    paragraph('gh'),
  ];
  const fromLinkEnd = {
    anchor: textPoint([0, 1, 0], 2),
    focus: textPoint([1, 1, 0], 0),
  };

  it("lands a move from a link's end to the next link's start, dropped inside a link", () => {
    movesTo(betweenLinks(), fromLinkEnd, textPoint([0, 1, 0], 1), [
      linkedParagraph({ text: 'a' }, inlineLink('b'), { text: '' }),
      {
        ...linkedParagraph(
          { text: '' },
          inlineLink('c'),
          { text: '' },
          inlineLink('de'),
          { text: 'f' }
        ),
        checked: true,
      },
      paragraph('gh'),
    ]);
  });

  it("refuses a move from a link's end to the next link's start whose landing read unticks its end block", () => {
    refusesUnchanged(
      betweenLinks(),
      [mapEnd('untick-end', (node) => ({ ...node, checked: false }))],
      fromLinkEnd,
      textPoint([0, 1, 0], 1)
    );
  });

  it("refuses a move whose landing read unticks the empty block that holds the range's end, dropped at a block's end", () => {
    refusesUnchanged(
      endChecked(),
      [mapEnd('untick-empty-end', (node) => ({ ...node, checked: false }))],
      textRange([0, 2], [1, 0]),
      textPoint([2, 0], 2)
    );
  });

  it("refuses a move whose landing read unticks the empty block that holds the range's end, dropped inside a link", () => {
    refusesUnchanged(
      endLinked(),
      [mapEnd('untick-empty-end', (node) => ({ ...node, checked: false }))],
      textRange([0, 1], [1, 0]),
      textPoint([2, 1, 0], 1)
    );
  });

  it("refuses a move whose correction unticks the empty block that holds the range's end", () => {
    const untickEmpty = definePlugin('untick-empty', {
      corrections: [
        {
          event: 'content',
          correct({ entry: [node, path], tx }) {
            if (
              ElementApi.isElement(node) &&
              node.checked &&
              NodeApi.string(node) === ''
            ) {
              tx.nodes.set({ checked: false }, { at: path });
            }
          },
        },
      ],
    });

    refusesUnchanged(
      endChecked(),
      [untickEmpty],
      textRange([0, 2], [1, 0]),
      textPoint([2, 0], 2)
    );
  });

  it('lands a text drop into an empty paragraph there', () => {
    movesTo(
      [paragraph('ab'), { ...paragraph('cd'), checked: true }, paragraph('')],
      textRange([0, 1], [1, 1]),
      textPoint([2, 0], 0),
      [paragraph('ad'), paragraph('b'), { ...paragraph('c'), checked: true }]
    );
  });

  const chipped = (before: string, after: string): Element => ({
    type: 'paragraph',
    children: [
      { text: before },
      { type: 'chip', label: 'x', children: [{ text: '' }] },
      { text: after },
    ],
  });

  it('moves an inline void its range ends inside at a later block start, leaving no copy', () => {
    movesTo(
      [chipped('a', 'b'), paragraph('cd'), chipped('', '')],
      { anchor: textPoint([0, 2], 0), focus: textPoint([2, 1, 0], 0) },
      textPoint([0, 0], 0),
      [
        paragraph('b'),
        paragraph('cd'),
        {
          type: 'paragraph',
          children: [
            { text: '' },
            { type: 'chip', label: 'x', children: [{ text: '' }] },
            { text: 'a' },
            { type: 'chip', label: 'x', children: [{ text: '' }] },
            { text: '' },
          ],
        },
      ],
      chipSchema
    );
  });

  it('refuses a move dropped right after an inline void its range ends inside', () => {
    const initialValue = [chipped('a', 'b'), paragraph('cd'), chipped('', 'x')];
    const editor = createEditor({
      initialValue,
      plugins: [transfer(), chipSchema],
    });

    const outcome = editor.api.transfer.move({
      range: { anchor: textPoint([0, 0], 1), focus: textPoint([2, 1, 0], 0) },
      to: { point: textPoint([2, 2], 0) },
    });

    assert.deepEqual(
      { children: editor.read.children(), outcome },
      {
        children: initialValue,
        outcome: { reason: 'no-op', status: 'refused' },
      }
    );
  });

  for (const [edge, range, drop] of [
    ['ends', textRange([0, 1], [1, 1]), textPoint([2, 0], 1)],
    ['starts', textRange([1, 1], [2, 1]), textPoint([0, 0], 1)],
  ] as const) {
    it(`refuses to move a range that ${edge} inside a read-only block, which its deletion removes whole`, () => {
      const lockedSchema = defineEditorSchema(
        'schema:transfer-contract-locked',
        {
          elements: {
            locked: {
              content: schema.content.text({ default: 'text', min: 1 }),
              readOnly: true,
            },
            paragraph: {
              content: schema.content.text({ default: 'text', min: 1 }),
            },
          },
          id: 'transfer-contract-locked',
          root: schema.content.types(['locked', 'paragraph'], {
            default: { type: 'paragraph' },
            min: 1,
          }),
          unknown: 'reject',
          version: 1,
        }
      );
      const initialValue = [
        paragraph('ab'),
        { children: [{ text: 'CDEF' }], type: 'locked' },
        paragraph('xy'),
      ];
      const editor = createEditor({
        initialValue,
        plugins: [transfer(), lockedSchema],
      });

      const outcome = editor.api.transfer.move({ range, to: { point: drop } });

      assert.deepEqual(
        { children: editor.read.children(), outcome },
        {
          children: initialValue,
          outcome: { reason: 'lossy', status: 'refused' },
        }
      );
    });
  }

  it('refuses to move a range that runs to the next line, dropped at the end of its text', () => {
    const initialValue = [paragraph('ab'), paragraph('cd')];
    const editor = createEditor({ initialValue, plugins: [transfer()] });

    const outcome = editor.api.transfer.move({
      range: textRange([0, 0], [1, 0]),
      to: { point: textPoint([0, 0], 2) },
    });

    assert.deepEqual(
      { children: editor.read.children(), outcome },
      {
        children: initialValue,
        outcome: { reason: 'no-op', status: 'refused' },
      }
    );
  });

  it('refuses to move a range that selects only an empty line', () => {
    const initialValue = [paragraph('ab'), paragraph(''), paragraph('cd')];
    const editor = createEditor({ initialValue, plugins: [transfer()] });

    const outcome = editor.api.transfer.move({
      range: textRange([1, 0], [2, 0]),
      to: { point: textPoint([0, 0], 1) },
    });

    assert.deepEqual(
      { children: editor.read.children(), outcome },
      {
        children: initialValue,
        outcome: { reason: 'no-op', status: 'refused' },
      }
    );
  });

  for (const [name, initialValue, range, point, at] of [
    [
      "starts at a block's end, from the end of the drop point's block",
      endChecked(),
      textRange([0, 2], [1, 1]),
      textPoint([2, 0], 1),
      {
        anchor: textPoint([2, 0], 1),
        focus: textPoint([3, 0], 1),
      },
    ],
    [
      'ends inside a block dropped inside a link, inside that block',
      endLinked(),
      textRange([0, 1], [1, 1]),
      textPoint([2, 1, 0], 1),
      {
        anchor: textPoint([2, 2], 0),
        focus: textPoint([3, 0], 1),
      },
    ],
    [
      "ends at a link's start dropped inside that link, from after the link the drop splits",
      endLinked(),
      {
        anchor: textPoint([2, 0], 1),
        focus: textPoint([2, 1, 0], 0),
      },
      textPoint([2, 1, 0], 1),
      {
        anchor: textPoint([2, 2], 0),
        focus: textPoint([2, 3, 0], 0),
      },
    ],
  ] as const) {
    it(`returns a copy whose range ${name}`, () => {
      const editor = createEditor({
        initialValue,
        plugins: [transfer(), moveSchema],
      });

      const outcome = editor.api.transfer.copy({ range, to: { point } });

      assert.deepEqual(outcome, {
        at,
        diagnostics: [],
        reason: 'intent',
        status: 'copied',
      });
    });
  }

  const paragraphIn = (parent: ReturnType<typeof target.type>) =>
    target.and(target.type('paragraph'), parent);
  const quotedDepth = defineEditorSchema(
    'schema:transfer-contract-quoted-depth',
    {
      elements: {
        paragraph: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
        quote: {
          content: schema.content.types(['paragraph'], {
            default: { type: 'paragraph' },
            min: 1,
          }),
        },
      },
      id: 'transfer-contract-quoted-depth',
      properties: [
        schema.elementProperty('depth', property.number(), {
          landing: 'rebase',
          target: paragraphIn(target.parent(target.type('quote'))),
        }),
        schema.elementProperty('depth', property.number(), {
          target: paragraphIn(target.not(target.parent(target.type('quote')))),
        }),
      ],
      root: schema.content.types(['paragraph', 'quote'], {
        default: { type: 'paragraph' },
        min: 1,
      }),
      unknown: 'reject',
      version: 1,
    }
  );

  it('lands a property a landing read changes where the drop declares it as following the drop', () => {
    const editor = createEditor({
      initialValue: [
        paragraph('ab'),
        { ...paragraph('cd'), depth: 1 },
        quote(paragraph('ef')),
      ],
      plugins: [
        transfer(),
        quotedDepth,
        mapEnd('rebase-end', (node) => ({ ...node, depth: 2 })),
      ],
    });

    const outcome = editor.api.transfer.move({
      range: textRange([0, 1], [1, 1]),
      to: { point: { offset: 1, path: [2, 0, 0] } },
    });

    assert.deepEqual(
      { children: editor.read.children(), status: outcome.status },
      {
        children: [
          paragraph('ad'),
          quote(paragraph('eb'), { ...paragraph('cf'), depth: 2 }),
        ],
        status: 'moved',
      }
    );
  });

  it('refuses a move whose landing read changes a property that follows the drop only where the block left', () => {
    const rebaseDeep = (node: Descendant): Descendant =>
      ElementApi.isElement(node)
        ? {
            ...node,
            ...('depth' in node ? { depth: 2 } : {}),
            children: node.children.map(rebaseDeep),
          }
        : node;

    refusesUnchanged(
      [
        quote(paragraph('ab'), { ...paragraph('cd'), depth: 1 }),
        paragraph('ef'),
      ],
      [
        onMove('rebase-left', (landed) => ({
          ...landed,
          slice: ContentSlice.withContent(
            landed.slice,
            landed.slice.content.map(rebaseDeep),
            { open: 'preserve' }
          ),
        })),
      ],
      {
        anchor: { offset: 1, path: [0, 0, 0] },
        focus: { offset: 1, path: [0, 1, 0] },
      },
      { offset: 1, path: [1, 0] },
      quotedDepth
    );
  });

  const trimLanded = (from: number, to: number) =>
    definePlugin(`trim-${from}-${to}`, {
      corrections: [
        {
          event: 'content',
          correct({ entry: [node, path], tx }) {
            if (
              ElementApi.isElement(node) &&
              NodeApi.string(node) === 'xbcbc'
            ) {
              tx.text.delete({
                at: {
                  anchor: { offset: from, path: [...path, 0] },
                  focus: { offset: to, path: [...path, 0] },
                },
              });
            }
          },
        },
      ],
    });
  const moveBeside = (
    intent: 'edit' | 'plain' | 'propose',
    from: number,
    to: number
  ) => {
    const editor = createEditor({
      initialValue: [paragraph('bc'), paragraph('xbc')],
      plugins: [
        transfer(),
        trimLanded(from, to),
        ...(intent === 'plain'
          ? []
          : [history(), authored({ authorId: 'alice' })]),
        moveSchema,
      ],
    });
    const view =
      intent === 'plain'
        ? editor
        : createEditorView(editor, { authored: { intent } });
    let commits = 0;
    const unsubscribe = editor.subscribeCommit(() => {
      commits += 1;
    });
    const outcome = view.api.transfer.move({
      range: textRange([0, 0], [0, 2]),
      to: { point: textPoint([1, 0], 1) },
    });

    unsubscribe();

    return { commits, outcome, texts: texts(view) };
  };

  const modes = {
    edit: 'while editing',
    plain: 'on a plain editor',
    propose: 'while suggesting',
  } as const;

  for (const intent of ['plain', 'edit'] as const) {
    it(`refuses a move ${modes[intent]} whose correction deletes its landing beside identical text`, () => {
      assert.deepEqual(moveBeside(intent, 1, 3), {
        commits: 0,
        outcome: { reason: 'lossy', status: 'refused' },
        texts: ['bc', 'xbc'],
      });
    });
  }

  for (const intent of ['plain', 'edit', 'propose'] as const) {
    it(`lands a move ${modes[intent]} whose correction deletes the identical text beside its landing`, () => {
      const { commits, outcome, texts: landed } = moveBeside(intent, 3, 5);

      assert.equal(outcome.status, 'moved');
      assert.equal(commits, 1);
      assert.deepEqual(
        landed,
        intent === 'propose' ? ['bc', 'xbcbc'] : ['', 'xbc']
      );
    });
  }

  const moveFromCard = (
    intent: 'edit' | 'propose',
    from: number,
    to: number
  ) => {
    const editor = createEditor({
      initialValue: {
        children: [
          paragraph('xbc'),
          {
            type: 'card',
            childRoots: { body: 'card:1' },
            children: [{ text: '' }],
          },
        ] as Descendant[],
        roots: { 'card:1': [paragraph('bc')] },
      },
      plugins: [
        transfer(),
        cardSchema,
        trimLanded(from, to),
        history(),
        authored({ authorId: 'alice' }),
      ],
    });
    const view = (root?: string) =>
      createEditorView(editor, {
        authored: { intent },
        ...(root ? { root } : {}),
      });
    const main = view();
    const body = view('card:1');
    const outcome = main.api.transfer.move({
      from: body,
      range: textRange([0, 0], [0, 2]),
      to: { point: textPoint([0, 0], 1) },
    });

    return { body: texts(body), main: texts(main), outcome };
  };

  it('refuses a move out of a card body while editing whose correction deletes its landing', () => {
    assert.deepEqual(moveFromCard('edit', 1, 3), {
      body: ['bc'],
      main: ['xbc', ''],
      outcome: { reason: 'lossy', status: 'refused' },
    });
  });

  it('lands a move out of a card body while suggesting whose correction deletes the text before its landing', () => {
    const { main, outcome } = moveFromCard('propose', 0, 1);

    assert.equal(outcome.status, 'moved');
    assert.deepEqual(main, ['xbcbc', '']);
  });

  it('refuses a block move whose correction deletes it beside an identical block', () => {
    const dedupe = definePlugin('dedupe', {
      corrections: [
        {
          event: 'children',
          query: 'root',
          correct({ tx }) {
            const children = tx.nodes
              .children()
              .map((node) => NodeApi.string(node));

            if (children.join('/') === 'b/a/a') tx.nodes.remove({ at: [1] });
          },
        },
      ],
    });
    const editor = createEditor({
      initialValue: [paragraph('a'), paragraph('b'), paragraph('a')],
      plugins: [transfer(), dedupe],
    });

    const outcome = editor.api.transfer.move({
      nodes: [editor.key([0])!],
      to: { edge: 'before', key: editor.key([2])! },
    });

    assert.deepEqual(outcome, { reason: 'lossy', status: 'refused' });
    assert.deepEqual(texts(editor), ['a', 'b', 'a']);
  });

  const edgeSchema = defineEditorSchema('schema:transfer-contract-edges', {
    elements: {
      link: {
        content: schema.content.text({ default: 'text', min: 1 }),
        inline: true,
        properties: { url: property.string() },
      },
      paragraph: { content: moveText() },
      quote: {
        content: schema.content.types(['paragraph', 'title', 'quote'], {
          default: { type: 'paragraph' },
          min: 1,
        }),
      },
      title: { content: moveText(), slice: { preserveContext: true } },
    },
    id: 'transfer-contract-edges',
    root: schema.content.types(['paragraph', 'title', 'quote'], {
      default: { type: 'paragraph' },
      min: 1,
    }),
    unknown: 'reject',
    version: 1,
  });
  const titled = (text: string) => block('title', { text });
  const linkEdge = (text: string) =>
    linkedParagraph({ text: '' }, inlineLink(text), { text: '' });

  for (const [name, initialValue, range, point, landed] of [
    [
      'a line break between closed titles',
      [titled(''), titled('ab'), titled('cd')],
      textRange([1, 2], [2, 0]),
      textPoint([0, 0], 0),
      [titled(''), titled(''), titled('abcd')],
    ],
    [
      "a link's opening edge",
      [quote(linkEdge('ab'))],
      { anchor: textPoint([0, 0, 0], 0), focus: textPoint([0, 0, 1, 0], 0) },
      textPoint([0, 0, 1, 0], 2),
      [quote(linkEdge('ab'), linkEdge(''))],
    ],
    [
      "a link's opening edge, before a paragraph",
      [quote(linkEdge('a')), paragraph('b')],
      { anchor: textPoint([0, 0, 0], 0), focus: textPoint([0, 0, 1, 0], 0) },
      textPoint([0, 0, 1, 0], 1),
      [quote(linkEdge('a'), linkEdge('')), paragraph('b')],
    ],
  ] as const) {
    it(`lands a move that carries no characters: ${name}`, () => {
      const editor = createEditor({
        initialValue: [...initialValue],
        plugins: [transfer(), edgeSchema],
      });

      const outcome = editor.api.transfer.move({ range, to: { point } });

      assert.deepEqual(
        { children: editor.read.children(), status: outcome.status },
        { children: landed, status: 'moved' }
      );
    });
  }
});

// Built per case, so a runtime without landing policies fails each case alone.
const adoptSchema = () =>
  defineEditorSchema('schema:transfer-contract-adopt', {
    elements: {
      heading: { content: schema.content.text({ default: 'text', min: 1 }) },
      paragraph: { content: schema.content.text({ default: 'text', min: 1 }) },
      titled: {
        content: schema.content.prefix(
          [{ element: 'heading', properties: { role: 'title' } }],
          schema.content.types(['heading'], { min: 0 })
        ),
      },
    },
    id: 'transfer-contract-adopt',
    properties: [
      schema.elementProperty('depth', property.number(), {
        landing: 'rebase',
        target: target.types(['heading', 'paragraph']),
      }),
      schema.elementProperty('group', property.string(), {
        landing: 'adopt',
        target: target.types(['heading', 'paragraph']),
      }),
      schema.elementProperty('role', property.string(), {
        landing: 'adopt',
        target: target.type('heading'),
      }),
      schema.elementProperty('tone', property.string(), {
        target: target.types(['heading', 'paragraph']),
      }),
    ],
    root: schema.content.types(['heading', 'paragraph', 'titled'], {
      default: { type: 'paragraph' },
      min: 1,
    }),
    unknown: 'reject',
    version: 1,
  });

/** An adopt read that patches every block copy with \`patches\`, counting its runs. */
const adopting = (
  patches: (input: TransferAdoptInput) => readonly TransferPatch[]
) => {
  const runs: TransferAdoptInput[] = [];
  const plugin = definePlugin('adopting', {
    readMiddleware: ({ around }) => [
      around(editorReads.transfer.adopt, ({ input, next }) => {
        runs.push(input);

        return [...next(), ...patches(input)];
      }),
    ],
  });

  return { plugin, runs };
};

describe('block transfer adoption', () => {
  it('lands a block copy with the properties the adopt read gives it at the final edge', () => {
    const { plugin } = adopting(({ target: [node] }) => [
      { at: [0], properties: { group: node.group } },
    ]);
    const editor = createEditor({
      initialValue: [paragraph('a'), { ...paragraph('b'), group: 'g' }],
      plugins: [transfer(), adoptSchema(), plugin],
    });

    const outcome = editor.api.transfer.copy({
      nodes: [editor.key([0])!],
      to: { edge: 'after', key: editor.key([1])! },
    });

    assert.deepEqual(
      {
        children: editor.read.children(),
        diagnostics: outcome.status === 'copied' && outcome.diagnostics,
      },
      {
        children: [
          paragraph('a'),
          { ...paragraph('b'), group: 'g' },
          { ...paragraph('a'), group: 'g' },
        ],
        diagnostics: [],
      }
    );
  });

  it('adopts patches to several children of a copied block and leaves the source alone', () => {
    const { plugin } = adopting(() => [
      { at: [0, 0], properties: { group: 'first' } },
      { at: [0, 1], properties: { group: 'second' } },
    ]);
    const titled = block(
      'titled',
      { ...block('heading', { text: 'T' }), role: 'title' },
      block('heading', { text: 'h' })
    );
    const editor = createEditor({
      initialValue: [titled, paragraph('b')],
      plugins: [transfer(), adoptSchema(), plugin],
    });

    const outcome = editor.api.transfer.copy({
      nodes: [editor.key([0])!],
      to: { edge: 'after', key: editor.key([1])! },
    });

    assert.deepEqual(
      { children: editor.read.children(), status: outcome.status },
      {
        children: [
          titled,
          paragraph('b'),
          block(
            'titled',
            {
              ...block('heading', { text: 'T' }),
              group: 'first',
              role: 'title',
            },
            { ...block('heading', { text: 'h' }), group: 'second' }
          ),
        ],
        status: 'copied',
      }
    );
  });

  it('adopts a property declared only under the parent the copy lands in', () => {
    const { plugin } = adopting(() => [
      { at: [0], properties: { group: 'g' } },
    ]);
    const sectionSchema = defineEditorSchema('schema:transfer-adopt-section', {
      elements: {
        paragraph: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
        section: {
          content: schema.content.types(['paragraph'], {
            default: { type: 'paragraph' },
            min: 1,
          }),
        },
      },
      id: 'transfer-adopt-section',
      properties: [
        schema.elementProperty('group', property.string(), {
          landing: 'adopt',
          target: target.and(
            target.type('paragraph'),
            target.parent(target.type('section'))
          ),
        }),
      ],
      root: schema.content.types(['section'], {
        default: { type: 'section' },
        min: 1,
      }),
      unknown: 'reject',
      version: 1,
    });
    const editor = createEditor({
      initialValue: [block('section', paragraph('a'), paragraph('b'))],
      plugins: [transfer(), sectionSchema, plugin],
    });

    const outcome = editor.api.transfer.copy({
      nodes: [editor.key([0, 0])!],
      to: { edge: 'after', key: editor.key([0, 1])! },
    });

    assert.deepEqual(
      { children: editor.read.children(), status: outcome.status },
      {
        children: [
          block('section', paragraph('a'), paragraph('b'), {
            ...paragraph('a'),
            group: 'g',
          }),
        ],
        status: 'copied',
      }
    );
  });

  for (const [name, patch] of [
    ['an undeclared property', { at: [0], properties: { tone: 'loud' } }],
    [
      'a property a landing may only rebase',
      { at: [0], properties: { depth: 2 } },
    ],
    // @ts-expect-error a patch never names the element type
    ['the element type', { at: [0], properties: { type: 'heading' } }],
    // @ts-expect-error a patch never names content roots
    ['content roots', { at: [0], properties: { childRoots: {} } }],
    ['no element of the payload', { at: [3], properties: { group: 'g' } }],
    ['a text of the payload', { at: [0, 0], properties: { group: 'g' } }],
  ] as const) {
    it(`refuses a block copy whose adopt read patches ${name}`, () => {
      const { plugin } = adopting(() => [patch]);
      const editor = createEditor({
        initialValue: [paragraph('a'), paragraph('b')],
        plugins: [transfer(), adoptSchema(), plugin],
      });
      const input = {
        nodes: [editor.key([0])!],
        to: { edge: 'after' as const, key: editor.key([1])! },
      };

      assert.deepEqual(
        {
          check: checkTransfer(editor, input, 'copy'),
          outcome: editor.api.transfer.copy(input),
          texts: texts(editor),
        },
        {
          check: { admitted: false, reason: 'policy' },
          outcome: { reason: 'policy', status: 'refused' },
          texts: ['a', 'b'],
        }
      );
    });
  }

  for (const [name, patch, extra, reason] of [
    ['the schema refuses', { role: undefined }, [], 'schema'],
    [
      'a veto refuses',
      { group: 'locked' },
      [
        definePlugin('lock-group', {
          contributions: [
            transferVeto.of(
              ({ payload }) =>
                payload.kind === 'nodes' &&
                payload.nodes.some(
                  (node) =>
                    ElementApi.isElement(node) && node.group === 'locked'
                )
            ),
          ],
        }),
      ],
      'policy',
    ],
  ] as const) {
    it(`refuses at hover and at drop a block copy whose adopted properties ${name}`, () => {
      const { plugin } = adopting(() => [{ at: [0], properties: patch }]);
      const editor = createEditor({
        initialValue: [
          block('titled', {
            type: 'heading',
            role: 'title',
            children: [{ text: 'Title' }],
          }),
          { type: 'heading', role: 'title', children: [{ text: 'Copy' }] },
        ],
        plugins: [transfer(), adoptSchema(), plugin, ...extra],
      });
      const input = {
        nodes: [editor.key([1])!],
        to: { edge: 'before' as const, key: editor.key([0, 0])! },
      };

      assert.deepEqual(
        {
          check: checkTransfer(editor, input, 'copy'),
          outcome: editor.api.transfer.copy(input),
        },
        {
          check: { admitted: false, reason },
          outcome: { reason, status: 'refused' },
        }
      );
    });
  }

  it('refuses at hover and at drop a block move whose adopted properties set null', () => {
    const { plugin } = adopting(() => [
      { at: [0], properties: { group: null } },
    ]);
    const nullable = defineEditorSchema('schema:transfer-contract-adopt-null', {
      elements: {
        paragraph: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
      id: 'transfer-contract-adopt-null',
      properties: [
        schema.elementProperty('group', property.json(), {
          landing: 'adopt',
          target: target.type('paragraph'),
        }),
      ],
      root: schema.content.types(['paragraph'], {
        default: { type: 'paragraph' },
        min: 1,
      }),
      unknown: 'reject',
      version: 1,
    });
    const editor = createEditor({
      initialValue: [{ ...paragraph('a'), group: 'x' }, paragraph('b')],
      plugins: [transfer(), nullable, plugin],
    });
    const input = {
      nodes: [editor.key([0])!],
      to: { edge: 'after' as const, key: editor.key([1])! },
    };

    assert.deepEqual(
      {
        check: checkTransfer(editor, input, 'move'),
        outcome: editor.api.transfer.move(input),
      },
      {
        check: { admitted: false, reason: 'policy' },
        outcome: { reason: 'policy', status: 'refused' },
      }
    );
  });

  it('lands a copy as copied where it adopts nothing, after hovering an edge where it adopts', () => {
    const { plugin } = adopting(({ target: [node] }) =>
      node.group ? [{ at: [0], properties: { group: node.group } }] : []
    );
    const editor = createEditor({
      initialValue: [
        paragraph('a'),
        { ...paragraph('b'), group: 'g' },
        paragraph('c'),
      ],
      plugins: [transfer(), adoptSchema(), plugin],
    });
    const nodes = [editor.key([0])!];

    checkTransfer(
      editor,
      { nodes, to: { edge: 'after', key: editor.key([1])! } },
      'copy'
    );
    editor.api.transfer.copy({
      nodes,
      to: { edge: 'after', key: editor.key([2])! },
    });

    assert.deepEqual(editor.read.children(), [
      paragraph('a'),
      { ...paragraph('b'), group: 'g' },
      paragraph('c'),
      paragraph('a'),
    ]);
  });

  it('adopts once on the edge a keyboard step copy settles on', () => {
    const { plugin, runs } = adopting(() => []);
    const skipFirst = definePlugin('skip-first', {
      contributions: [
        transferVeto.of(({ target: [node] }) => NodeApi.string(node) === 'b'),
      ],
    });
    const editor = createEditor({
      initialValue: [paragraph('a'), paragraph('b'), paragraph('c')],
      plugins: [transfer(), adoptSchema(), plugin, skipFirst],
    });

    editor.update.selection.set({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    });

    const outcome = editor.api.transfer.copy({ to: 'next' });

    assert.deepEqual(
      {
        runs: runs.map(({ edge, target: [node] }) => [
          edge,
          NodeApi.string(node),
        ]),
        status: outcome.status,
        texts: texts(editor),
      },
      {
        runs: [['after', 'c']],
        status: 'copied',
        texts: ['a', 'b', 'c', 'a'],
      }
    );
  });

  it('lands a block move with the properties the adopt read gives it, keeping its key, in one undo step', () => {
    const { plugin, runs } = adopting(() => [
      { at: [0], properties: { group: 'g' } },
    ]);
    const editor = createEditor({
      initialValue: [paragraph('a'), paragraph('b')],
      plugins: [transfer(), history(), adoptSchema(), plugin],
    });
    const key = editor.key([0])!;

    const outcome = editor.api.transfer.move({
      nodes: [key],
      to: { edge: 'after', key: editor.key([1])! },
    });
    const moved = {
      children: editor.read.children(),
      intents: runs.map(({ intent }) => intent),
      keyKept: editor.key([1]) === key,
      status: outcome.status,
    };

    editor.api.history.undo();

    assert.deepEqual(
      { ...moved, undone: editor.read.children() },
      {
        children: [paragraph('b'), { ...paragraph('a'), group: 'g' }],
        intents: ['move'],
        keyKept: true,
        status: 'moved',
        undone: [paragraph('a'), paragraph('b')],
      }
    );
  });

  it('sets a nested adopt patch on the child of a moved read-only container', () => {
    const { plugin } = adopting(() => [
      { at: [0, 1], properties: { group: 'g' } },
    ]);
    const lockedBlocks = defineEditorSchema(
      'schema:transfer-contract-adopt-locked',
      {
        elements: {
          locked: {
            content: schema.content.types(['paragraph'], {
              default: { type: 'paragraph' },
              min: 1,
            }),
            readOnly: true,
          },
          paragraph: {
            content: schema.content.text({ default: 'text', min: 1 }),
          },
        },
        id: 'transfer-contract-adopt-locked',
        properties: [
          schema.elementProperty('group', property.string(), {
            landing: 'adopt',
            target: target.type('paragraph'),
          }),
        ],
        root: schema.content.types(['locked', 'paragraph'], {
          default: { type: 'paragraph' },
          min: 1,
        }),
        unknown: 'reject',
        version: 1,
      }
    );
    const editor = createEditor({
      initialValue: [
        block('locked', paragraph('a'), paragraph('b')),
        paragraph('c'),
      ],
      plugins: [transfer(), lockedBlocks, plugin],
    });

    const outcome = editor.api.transfer.move({
      nodes: [editor.key([0])!],
      to: { edge: 'after', key: editor.key([1])! },
    });

    assert.deepEqual(
      { children: editor.read.children(), status: outcome.status },
      {
        children: [
          paragraph('c'),
          block('locked', paragraph('a'), { ...paragraph('b'), group: 'g' }),
        ],
        status: 'moved',
      }
    );
  });

  it('adopts on a block moved from the main root into a content-root view', () => {
    const { plugin } = adopting(() => [
      { at: [0], properties: { group: 'g' } },
    ]);
    const groupedCards = defineEditorSchema(
      'schema:transfer-contract-adopt-card',
      {
        elements: {
          card: {
            content: schema.content.text({ default: 'text', min: 1 }),
            contentRoots: {
              body: {
                content: schema.content.types(['paragraph'], {
                  default: { type: 'paragraph' },
                  min: 1,
                }),
                ownership: 'exclusive',
              },
            },
          },
          paragraph: {
            content: schema.content.text({ default: 'text', min: 1 }),
          },
        },
        id: 'transfer-contract-adopt-card',
        properties: [
          schema.elementProperty('group', property.string(), {
            landing: 'adopt',
            target: target.type('paragraph'),
          }),
        ],
        root: schema.content.types(['card', 'paragraph'], {
          default: { type: 'paragraph' },
          min: 1,
        }),
        unknown: 'reject',
        version: 1,
      }
    );
    const editor = createEditor({
      initialValue: {
        children: [
          paragraph('top'),
          {
            type: 'card',
            childRoots: { body: 'card:1' },
            children: [{ text: '' }],
          },
        ] as Descendant[],
        roots: { 'card:1': [paragraph('inside')] },
      },
      plugins: [transfer(), groupedCards, plugin],
    });
    const body = createEditorView(editor, { root: 'card:1' });

    const outcome = body.api.transfer.move({
      from: editor,
      nodes: [editor.key([0])!],
      to: { edge: 'after', key: body.key([0])! },
    });

    assert.deepEqual(
      { body: body.read.children(), status: outcome.status },
      {
        body: [paragraph('inside'), { ...paragraph('top'), group: 'g' }],
        status: 'moved',
      }
    );
  });

  it('copies no more child entries per child to adopt patches for 300 children than for 10', () => {
    const copiedPerChild = (count: number) => {
      const { plugin } = adopting(() =>
        Array.from({ length: count }, (_, index) => ({
          at: [0, index + 1],
          properties: { group: 'g' },
        }))
      );
      const editor = createEditor({
        initialValue: [
          block(
            'titled',
            { ...block('heading', { text: 'T' }), role: 'title' },
            ...Array.from({ length: count }, (_, index) =>
              block('heading', { text: `h${index}` })
            )
          ),
          paragraph('b'),
        ],
        plugins: [transfer(), adoptSchema(), plugin],
      });
      const before = landingMetrics.copiedEntries;

      const outcome = editor.api.transfer.copy({
        nodes: [editor.key([0])!],
        to: { edge: 'after', key: editor.key([1])! },
      });

      assert.equal(outcome.status, 'copied');

      return (landingMetrics.copiedEntries - before) / count;
    };
    const ten = copiedPerChild(10);

    assert.ok(copiedPerChild(300) <= ten);
  });
});
