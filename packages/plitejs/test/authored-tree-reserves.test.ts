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
import { sparesFor, withSpareWrites } from '../src/authored/tree/reserves';
import { getCompiledEditorSchema } from '../src/core/plugin-registry';
import type { EditorDocumentValue } from '../src/interfaces/editor';

const c = schema.content;
let made = 0;
const pairs = (generated: boolean) =>
  defineEditorSchema(generated ? 'spares-generated' : 'spares-plain', {
    elements: {
      pair: { content: c.type('paragraph', { min: 2 }) },
      paragraph: schema.element.textBlock(),
      quote: { content: c.type('paragraph', { min: 1 }) },
    },
    id: generated ? 'spares-generated' : 'spares-plain',
    properties: generated
      ? [
          schema.elementProperty(
            'id',
            property.string({
              generate: () => {
                made += 1;

                return `g${made}`;
              },
            }),
            {
              copy: 'drop',
              role: 'metadata',
              target: target.group('element'),
              typeChange: 'preserve-if-allowed',
            }
          ),
        ]
      : [],
    root: c.types(['paragraph', 'pair', 'quote'], {
      default: { type: 'paragraph' },
      min: 1,
    }),
    unknown: 'reject',
    version: 1,
  });
const compiledOf = (generated: boolean) =>
  getCompiledEditorSchema(
    createEditor({
      plugins: [pairs(generated), createAuthoredPlugin({ authorId: 'zed' })],
    })
  );
const deleted = (change: string) => ({
  at: 1,
  author: change,
  change,
  kind: 'delete',
});
const line = (text: string, ...marks: readonly unknown[]) => ({
  ...(marks.length > 0 ? { authored: marks } : {}),
  children: [{ ...(marks.length > 0 ? { authored: marks } : {}), text }],
  id: `id-${text}`,
  type: 'paragraph',
});
const document = (...children: readonly unknown[]) =>
  ({ children }) as unknown as EditorDocumentValue;
const pairOf = (...children: readonly unknown[]) =>
  document({ children, id: 'pair', type: 'pair' });
const atPair = [{ path: [0], root: 'main' }];

describe('the spares a write stores', () => {
  it('give a pair whose paragraphs a pending change deletes one generated paragraph per minimum slot, once', () => {
    const compiled = compiledOf(true);
    made = 0;
    const value = pairOf(line('a', deleted('A')), line('b', deleted('A')));
    const writes = sparesFor(value, compiled, atPair);
    const again = sparesFor(withSpareWrites(value, writes), compiled, atPair);

    assert.deepEqual(
      [writes.containers, again.containers],
      [
        [
          {
            added: [0, 1].map((min) => ({
              ...deleted('A'),
              kind: 'reserve',
              node: {
                children: [{ text: '' }],
                id: `g${min + 1}`,
                type: 'paragraph',
              },
              slot: { min },
              type: 'pair',
            })),
            path: [0],
            replaced: [],
            root: 'main',
          },
        ],
        [],
      ]
    );
  });

  it('add nothing for a second change on a pair that holds unbuilt spares', () => {
    const compiled = compiledOf(true);
    const first = pairOf(line('a', deleted('A')), line('b'));
    const stored = withSpareWrites(first, sparesFor(first, compiled, atPair));
    const [pair] = stored.children as unknown as [
      { children: unknown[] } & Record<string, unknown>,
    ];
    const second = document({
      ...pair,
      children: [pair.children[0], line('b', deleted('B'))],
    });

    assert.deepEqual(sparesFor(second, compiled, atPair).containers, []);
  });

  it('add nothing under a schema that generates no element value', () => {
    assert.deepEqual(
      sparesFor(
        pairOf(line('a', deleted('A')), line('b', deleted('A'))),
        compiledOf(false),
        atPair
      ).containers,
      []
    );
  });

  it('add nothing for a pending format change of a child', () => {
    const formatted = {
      at: 1,
      author: 'A',
      change: 'A',
      id: 'w1',
      key: 'id',
      kind: 'format',
      write: { kind: 'set', value: 'other' },
    };

    assert.deepEqual(
      sparesFor(
        pairOf(
          { ...line('a'), authored: [formatted] },
          { ...line('b'), authored: [formatted] }
        ),
        compiledOf(true),
        atPair
      ).containers,
      []
    );
  });

  it('give a root a pending deletion can empty a spare record of its own', () => {
    const compiled = compiledOf(true);
    made = 0;
    const writes = sparesFor(document(line('a', deleted('A'))), compiled, [
      { path: [], root: 'main' },
    ]);

    assert.deepEqual(
      Object.fromEntries(
        [...(writes.records.get('authored-reserves') ?? [])].map(
          ([id, json]) => [id, JSON.parse(json ?? 'null')]
        )
      ),
      {
        [JSON.stringify(['main', 'A', null, 'm0'])]: {
          at: 1,
          author: 'A',
          change: 'A',
          node: { children: [{ text: '' }], id: 'g1', type: 'paragraph' },
          root: 'main',
          slot: { min: 0 },
        },
      }
    );
  });
});
