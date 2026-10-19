import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createEditor } from 'plitejs';

import { createAuthoredPlugin } from '../src/authored/authored';

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
