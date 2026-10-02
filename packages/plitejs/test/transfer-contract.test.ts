import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
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
  target,
  transfer,
  transferVeto,
} from 'plitejs';
import { authored } from 'plitejs/authored';
import { history } from 'plitejs/history';

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
          { type: 'quote', children: [paragraph('abc')] } as Element,
        ],
        plugins: [
          transfer(),
          truncate,
          history(),
          authored({ authorId: 'alice' }),
          nestSchema,
        ],
      });
      const view = createEditorView(editor, {
        authored:
          intent === 'propose'
            ? { intent, projection: 'proposed' }
            : { intent, projection: 'accepted' },
      });
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
      authored: { intent: 'propose', projection: 'proposed' },
    });
    const input = {
      from: proposed,
      nodes: [proposed.key([0])!],
      to: { edge: 'before' as const, key: editor.key([1])! },
    };

    assert.equal(checkTransfer(editor, input, 'move').admitted, true);

    proposed.api.authored.setView({ intent: 'edit', projection: 'accepted' });

    assert.deepEqual(checkTransfer(editor, input, 'move'), {
      admitted: false,
      reason: 'no-op',
    });
  });

  it('moves a block in a proposing view as a proposal', () => {
    const editor = createEditor({
      initialValue: [paragraph('a'), paragraph('b'), paragraph('c')],
      plugins: [transfer(), history(), authored({ authorId: 'alice' })],
    });
    const view = createEditorView(editor, {
      authored: { intent: 'propose', projection: 'proposed' },
    });

    const outcome = view.api.transfer.move({
      nodes: [view.key([0])!],
      to: { edge: 'after', key: view.key([2])! },
    });

    assert.equal(outcome.status, 'moved');
    assert.deepEqual(texts(view), ['b', 'c', 'a']);
    assert.deepEqual(texts(editor), ['a', 'b', 'c']);
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
        } as Element,
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
        } as Element),
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
