import assert from 'node:assert/strict';

import { type Element, NodeApi, type NodeTextRangeRoot } from '../src';

const root = (children: Element['children']): Element => ({
  type: 'root',
  children,
});

const snapshotRoot = (children: Element['children']): NodeTextRangeRoot => ({
  children,
});

it('finds literal text ranges across adjacent leaves in one text run', () => {
  assert.deepEqual(
    NodeApi.findTextRanges(
      root([
        {
          type: 'paragraph',
          children: [{ text: 'look ' }, { text: 'for' }, { text: 'ward' }],
        },
      ]),
      'forward'
    ),
    [
      {
        anchor: { path: [0, 1], offset: 0 },
        focus: { path: [0, 2], offset: 4 },
      },
    ]
  );
});

it('does not join separate text runs', () => {
  assert.deepEqual(
    NodeApi.findTextRanges(
      root([
        { type: 'paragraph', children: [{ text: 'foo' }] },
        { type: 'paragraph', children: [{ text: 'bar' }] },
      ]),
      'foobar'
    ),
    []
  );
});

it('accepts snapshot roots with children only', () => {
  assert.deepEqual(
    NodeApi.findTextRanges(
      snapshotRoot([{ type: 'paragraph', children: [{ text: 'snapshot' }] }]),
      'shot'
    ),
    [
      {
        anchor: { path: [0, 0], offset: 4 },
        focus: { path: [0, 0], offset: 8 },
      },
    ]
  );
});

it('supports case-insensitive string matches', () => {
  assert.deepEqual(
    NodeApi.findTextRanges(
      root([
        {
          type: 'paragraph',
          children: [{ text: 'Alpha alpha' }],
        },
      ]),
      'alpha',
      { caseSensitive: false }
    ),
    [
      {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 5 },
      },
      {
        anchor: { path: [0, 0], offset: 6 },
        focus: { path: [0, 0], offset: 11 },
      },
    ]
  );
});

it('supports regular expressions without mutating caller lastIndex', () => {
  const query = /f.o/gi;
  query.lastIndex = 2;

  assert.deepEqual(
    NodeApi.findTextRanges(
      root([
        {
          type: 'paragraph',
          children: [{ text: 'foo Fao' }],
        },
      ]),
      query
    ),
    [
      {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 3 },
      },
      {
        anchor: { path: [0, 0], offset: 4 },
        focus: { path: [0, 0], offset: 7 },
      },
    ]
  );
  assert.equal(query.lastIndex, 2);
});

it('supports callback matches and ignores invalid offsets', () => {
  assert.deepEqual(
    NodeApi.findTextRanges(
      root([
        {
          type: 'paragraph',
          children: [{ text: 'custom text' }],
        },
      ]),
      () => [
        { start: 0, end: 6 },
        { start: 8, end: 4 },
        { start: -1, end: 2 },
      ]
    ),
    [
      {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 6 },
      },
    ]
  );
});

it('ignores empty string and zero-width regular expression matches', () => {
  const value = root([
    {
      type: 'paragraph',
      children: [{ text: 'alpha' }],
    },
  ]);

  assert.deepEqual(NodeApi.findTextRanges(value, ''), []);
  assert.deepEqual(NodeApi.findTextRanges(value, /(?=a)/g), []);
});
