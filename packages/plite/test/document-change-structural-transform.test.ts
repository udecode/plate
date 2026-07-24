import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { DocumentIndex } from '../src/core/change/document-index';
import { insertTextChange, RootChange } from '../src/core/change/root-change';
import type { JsonNode } from '../src/core/change/tokens';

const paragraph = (text: string): JsonNode => ({
  children: [{ text }],
  type: 'paragraph',
});

describe('structural document change transform', () => {
  it('keeps a nested concurrent edit through a wrapper relocation', () => {
    const before = DocumentIndex.fromValue([
      { children: [paragraph('alpha')], type: 'quote' },
    ]);
    const remote = insertTextChange(before, [0, 0, 0], 5, '!');
    const unwrap = RootChange.between(
      before,
      DocumentIndex.fromValue([paragraph('alpha')])
    );
    const transformed = RootChange.transformInDocument(remote, unwrap, before);
    const expected = [paragraph('alpha!')];

    assert.deepEqual(transformed.b.apply(remote.apply(before)).value, expected);
    assert.deepEqual(transformed.a.apply(unwrap.apply(before)).value, expected);
  });

  it('does not replay a structural intent already satisfied remotely', () => {
    const before = DocumentIndex.fromValue([paragraph('Hello world!')]);
    const remote = RootChange.between(
      before,
      DocumentIndex.fromValue([paragraph('Hello '), paragraph('world!!')])
    );
    const local = RootChange.between(
      before,
      DocumentIndex.fromValue([paragraph('Hello '), paragraph('world!')])
    );
    const transformed = RootChange.transformInDocument(remote, local, before);
    const expected = [paragraph('Hello '), paragraph('world!!')];

    assert.equal(transformed.b.empty, true);
    assert.deepEqual(transformed.b.apply(remote.apply(before)).value, expected);
    assert.deepEqual(transformed.a.apply(local.apply(before)).value, expected);
  });

  it('replays a structural change through an unrelated sibling insertion', () => {
    const before = DocumentIndex.fromValue([paragraph('Hello world!')]);
    const remote = RootChange.between(
      before,
      DocumentIndex.fromValue([
        paragraph('Hello world!'),
        paragraph('world! after'),
      ])
    );
    const local = RootChange.between(
      before,
      DocumentIndex.fromValue([paragraph('Hello '), paragraph('world!')])
    );
    const transformed = RootChange.transformInDocument(remote, local, before);
    const expected = [
      paragraph('Hello '),
      paragraph('world!'),
      paragraph('world! after'),
    ];

    assert.deepEqual(transformed.b.apply(remote.apply(before)).value, expected);
    assert.deepEqual(transformed.a.apply(local.apply(before)).value, expected);
  });

  it('preserves an insertion at the boundary of a concurrent deletion', () => {
    const before = DocumentIndex.fromValue([paragraph('alphaLin fragment')]);
    const remote = RootChange.between(
      before,
      DocumentIndex.fromValue([paragraph('alpha AdaLin fragment')])
    );
    const local = RootChange.between(
      before,
      DocumentIndex.fromValue([paragraph('alpha')])
    );
    const transformed = RootChange.transformInDocument(remote, local, before);
    const expected = [paragraph('alpha Ada')];

    assert.deepEqual(transformed.b.apply(remote.apply(before)).value, expected);
    assert.deepEqual(transformed.a.apply(local.apply(before)).value, expected);
  });
});
