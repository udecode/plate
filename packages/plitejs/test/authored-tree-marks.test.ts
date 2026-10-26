import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  defineEditorSchema,
  property,
  schema,
  target,
} from 'plitejs';

import { createAuthoredPlugin } from '../src/authored/authored';
import { getCompiledEditorSchema } from '../src/core/plugin-registry';
import { getEditorAuthoredDocumentCapability } from '../src/create-editor';
import { getDefined } from '../src/internal/get-defined';
import { authoredTestApi, recordsOf } from './support/authored';

const mark = (kind: 'delete' | 'insert', author: string, at: number) => ({
  at,
  author,
  change: 'c1',
  kind,
});

describe('authored review tree marks', () => {
  it('refuses a document whose leaves of one change disagree about the author', () => {
    assert.throws(
      () =>
        createEditor({
          plugins: [createAuthoredPlugin({ authorId: 'alice' })],
          initialValue: [
            {
              type: 'paragraph',
              children: [
                { text: 'gone ', authored: [mark('delete', 'bob', 1)] },
                { text: 'new', authored: [mark('insert', 'alice', 1)] },
              ],
            },
          ],
        }),
      /Change c1 has marks with different authors\./
    );
  });

  for (const [kind, name] of [
    ['insert', 'insertion'],
    ['delete', 'deletion'],
  ] as const) {
    it(`refuses a document holding an Editing ${name}`, () => {
      assert.throws(
        () =>
          createEditor({
            plugins: [createAuthoredPlugin({ authorId: 'alice' })],
            initialValue: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'typed',
                    authored: [
                      { ...mark(kind, 'bob', 1), change: '~edit:bob' },
                    ],
                  },
                ],
              },
              { type: 'paragraph', children: [{ text: 'next' }] },
            ],
          }),
        new RegExp(`An Editing mark of kind "${kind}" never stays stored`)
      );
    });
  }

  it('keeps an Editing format tag only over other tags, with their links and its landed write', () => {
    const pending = {
      at: 1,
      author: 'ann',
      change: 'ann:1',
      id: 'a1',
      key: 'color',
      kind: 'format',
      write: { kind: 'set', value: 'red' },
    };
    const edited = {
      at: 2,
      author: 'bob',
      base: { kind: 'remove' },
      before: 'red',
      change: '~edit:bob',
      id: 'e1',
      key: 'color',
      kind: 'format',
      over: [[{ id: 'a1', write: { kind: 'set', value: 'red' } }]],
      write: { kind: 'set', value: 'green' },
    };
    const load = (authored: unknown[], landed = true) =>
      createEditor({
        plugins: [createAuthoredPlugin({ authorId: 'alice' })],
        initialValue: {
          children: [
            {
              type: 'paragraph',
              children: [{ authored, color: 'green', text: 'word' }],
            },
          ],
          records: {
            'authored-landed': landed
              ? { e1: { at: 2, change: '~edit:bob' } }
              : {},
          },
        },
      } as never).read.children();
    const { base: _base, over: _over, ...plain } = edited;

    assert.deepEqual(load([pending, edited]), [
      {
        type: 'paragraph',
        children: [
          { authored: [pending, edited], color: 'green', text: 'word' },
        ],
      },
    ]);
    assert.deepEqual(load([pending, edited], false), [
      {
        type: 'paragraph',
        children: [{ authored: [pending], color: 'red', text: 'word' }],
      },
    ]);
    assert.throws(
      () => load([pending, plain]),
      /An Editing mark of kind "format" never stays stored/
    );
    assert.throws(
      () =>
        load([
          pending,
          {
            ...edited,
            over: [{ id: 'a1', write: { kind: 'set', value: 'red' } }],
          },
        ]),
      /A review mark is malformed\./
    );
  });

  it('loads a replacement whose marks agree and keeps them in the value', () => {
    const children = [
      {
        type: 'paragraph',
        children: [
          { text: 'keep ' },
          { text: 'gone ', authored: [mark('delete', 'bob', 1)] },
          { text: 'new', authored: [mark('insert', 'bob', 1)] },
        ],
      },
    ];
    const editor = createEditor({
      plugins: [createAuthoredPlugin({ authorId: 'alice' })],
      initialValue: children,
    });

    assert.deepEqual(editor.read.children(), children);
  });
});

describe('spare blocks', () => {
  // Only a schema that generates an element property keeps spares.
  const Quotes = defineEditorSchema('schema:authored-spares', {
    elements: {
      paragraph: schema.element.textBlock(),
      quote: { content: schema.content.type('paragraph', { min: 1 }) },
    },
    id: 'authored-spares',
    properties: [
      schema.elementProperty(
        'id',
        property.string({ generate: () => 'fresh' }),
        {
          copy: 'drop',
          role: 'metadata',
          target: target.group('element'),
          typeChange: 'preserve-if-allowed',
        }
      ),
    ],
    root: schema.content.types(['paragraph', 'quote'], {
      default: { type: 'paragraph' },
      min: 1,
    }),
    unknown: 'reject',
    version: 1,
  });
  const line = { children: [{ text: '' }], id: 's1', type: 'paragraph' };
  const spare = {
    at: 1,
    author: 'cara',
    change: 'cara:1',
    kind: 'reserve',
    node: line,
    slot: { min: 0 },
    type: 'quote',
  };
  const rootSpareId = JSON.stringify(['main', 'cara:1', null, 'm0']);
  const rootSpare = {
    at: 1,
    author: 'cara',
    change: 'cara:1',
    node: { ...line, id: 's2' },
    root: 'main',
    slot: { min: 0 },
  };
  const inserted = { at: 2, author: 'bob', change: 'bob:1', kind: 'insert' };
  const stored = (
    quoteMembers: readonly unknown[] = [spare],
    reserves: Readonly<Record<string, unknown>> = { [rootSpareId]: rootSpare }
  ) => ({
    children: [
      {
        authored: quoteMembers,
        children: [{ children: [{ text: 'a' }], id: 'a', type: 'paragraph' }],
        id: 'q',
        type: 'quote',
      },
      {
        children: [{ text: 'b' }, { authored: [inserted], text: 'c' }],
        id: 'b',
        type: 'paragraph',
      },
    ],
    records: { 'authored-reserves': reserves },
  });
  const load = (value: unknown) =>
    createEditor({
      initialValue: value as never,
      plugins: [Quotes, createAuthoredPlugin({ authorId: 'zed' })],
    });

  it('load and save unchanged, in a container and in the root records', () => {
    const editor = load(stored());

    assert.deepEqual(
      load(JSON.parse(JSON.stringify(editor.read.value()))).read.value(),
      stored()
    );
  });

  it('add no change, card or pending count, and no projection shows them', () => {
    const editor = load(stored());
    const projected = getDefined(
      getEditorAuthoredDocumentCapability(editor)
    ).project(editor.read.value(), 'proposed', getCompiledEditorSchema(editor));

    assert.deepEqual(
      {
        card: editor.read.authored.groupOf('cara:1'),
        changes: editor.read.authored.changes().items.map(({ id }) => id),
        children: projected.ok ? projected.document.children : null,
        marks: editor.read.authored.reviewOf(editor.read.children()[0]).marks,
        pending: projected.pending,
      },
      {
        card: null,
        changes: ['bob:1'],
        children: [
          {
            children: [
              { children: [{ text: 'a' }], id: 'a', type: 'paragraph' },
            ],
            id: 'q',
            type: 'quote',
          },
          { children: [{ text: 'bc' }], id: 'b', type: 'paragraph' },
        ],
        marks: [],
        pending: 1,
      }
    );
  });

  it('leave their container and root once a decision leaves no pending claim that could empty either', () => {
    const editor = load(stored());

    authoredTestApi(editor).decide({ action: 'accept', changes: ['bob:1'] });

    assert.deepEqual(
      {
        children: editor.read.children(),
        reserves: recordsOf(editor.read.value())['authored-reserves'],
      },
      {
        children: [
          {
            children: [
              { children: [{ text: 'a' }], id: 'a', type: 'paragraph' },
            ],
            id: 'q',
            type: 'quote',
          },
          { children: [{ text: 'bc' }], id: 'b', type: 'paragraph' },
        ],
        reserves: undefined,
      }
    );
  });

  it('refuse a malformed spare as they refuse a malformed format tag', () => {
    const refusals = [
      stored([{ ...spare, slot: { min: -1 } }]),
      stored([{ ...spare, node: { ...line, authored: [inserted] } }]),
      stored([{ ...spare, extra: true }]),
      stored([spare], { [rootSpareId]: { ...rootSpare, root: 'other' } }),
      stored([spare], { [rootSpareId]: { ...rootSpare, slot: { prefix: 0 } } }),
    ].map((value) => {
      try {
        load(value);

        return null;
      } catch (error) {
        return (error as Error).message;
      }
    });

    assert.deepEqual(refusals, [
      'A review mark is malformed.',
      'A review mark is malformed.',
      'A review mark is malformed.',
      `Review spare block ${rootSpareId} is malformed.`,
      `Review spare block ${rootSpareId} is malformed.`,
    ]);
  });
});
