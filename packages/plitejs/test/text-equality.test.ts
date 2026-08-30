import assert from 'node:assert/strict';

import fc from 'fast-check';
import { TextApi } from 'plitejs';

describe('TextApi.equals', () => {
  it('compares cloned nested array properties structurally', () => {
    const text = {
      metadata: ['draft', { active: true, labels: ['one', 'two'] }],
      text: 'same',
    };
    const clone = structuredClone(text);

    assert.equal(TextApi.equals(text, clone), true);
  });

  it('preserves nested inequality and normalization laws', () => {
    const equalsMetadata = (metadata: unknown, another: unknown) =>
      TextApi.equals(
        { metadata, text: 'same' },
        { metadata: another, text: 'same' }
      );

    assert.equal(
      equalsMetadata([{ active: true }], [{ active: false }]),
      false
    );
    assert.equal(equalsMetadata(['one', 'two'], ['two', 'one']), false);
    assert.equal(equalsMetadata(['one'], ['one', 'two']), false);
    assert.equal(equalsMetadata([], {}), false);
    assert.equal(equalsMetadata([1], ['1']), false);
    assert.equal(equalsMetadata({}, { toString: 1 }), false);
    assert.equal(equalsMetadata({ toString: 1 }, {}), false);
    assert.equal(
      TextApi.equals(
        { metadata: { optional: undefined }, text: 'same' },
        { metadata: {}, text: 'same' }
      ),
      true
    );
    assert.equal(equalsMetadata({ toString: undefined }, {}), true);
    assert.equal(equalsMetadata({}, { toString: undefined }), true);
  });

  it('obeys equality laws for bounded JSON values', () => {
    fc.assert(
      fc.property(fc.jsonValue({ maxDepth: 4 }), (metadata) => {
        const text = { metadata, text: 'same' };
        const clone = structuredClone(text);

        assert.equal(TextApi.equals(text, text), true);
        assert.equal(TextApi.equals(text, clone), true);
        assert.equal(TextApi.equals(clone, text), true);
      }),
      { numRuns: 200 }
    );

    fc.assert(
      fc.property(
        fc.array(fc.jsonValue({ maxDepth: 3 }), { maxLength: 8 }),
        fc.jsonValue({ maxDepth: 3 }),
        (prefix, value) => {
          const left = {
            metadata: [...prefix, { changed: false, value }],
            text: 'same',
          };
          const right = {
            metadata: [...structuredClone(prefix), { changed: true, value }],
            text: 'same',
          };

          assert.equal(TextApi.equals(left, right), false);
          assert.equal(TextApi.equals(right, left), false);
        }
      ),
      { numRuns: 200 }
    );
  });

  it('short-circuits wide arrays at the first unequal value', () => {
    const left = Array.from({ length: 100_000 }, (_value, index) => index);
    const rightTarget = [...left];
    let indexedReads = 0;

    rightTarget[0] = -1;
    const right = new Proxy(rightTarget, {
      get(target, property, receiver) {
        if (typeof property === 'string' && /^\d+$/u.test(property)) {
          indexedReads += 1;
        }

        return Reflect.get(target, property, receiver);
      },
    });

    assert.equal(
      TextApi.equals(
        { metadata: left, text: 'same' },
        { metadata: right, text: 'same' }
      ),
      false
    );
    assert.equal(indexedReads, 1);
  });
});
