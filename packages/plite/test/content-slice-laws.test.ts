import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ContentSlice, type Descendant } from '@platejs/plite';
import fc from 'fast-check';

import { PreparedTokenSlice } from '../src/core/change/tokens';
import {
  encodeContentSlice,
  prepareContentSliceVariant,
} from '../src/core/content-slice';

const lawSeed = Number.parseInt(
  process.env.PLITE_CONTENT_SLICE_LAW_SEED ?? '20260720',
  10
);
const lawRuns = Number.parseInt(
  process.env.PLITE_CONTENT_SLICE_LAW_RUNS ?? '150',
  10
);

const textArbitrary = fc.record({
  bold: fc.boolean(),
  text: fc.string({ maxLength: 24 }),
});

const textNode = ({
  bold,
  text,
}: {
  bold: boolean;
  text: string;
}): Descendant => ({
  ...(bold ? { bold: true } : {}),
  text,
});

const wrap = (child: Descendant, depth: number, label: string): Descendant => {
  let current = child;

  for (let index = 0; index < depth; index++) {
    current = {
      children: [current],
      level: index,
      type: `${label}-${index}`,
    };
  }

  return current;
};

const sliceInputArbitrary = fc
  .record({
    left: textArbitrary,
    leftDepth: fc.integer({ max: 4, min: 0 }),
    middle: fc.array(textArbitrary, { maxLength: 5 }),
    openEndSeed: fc.nat(),
    openStartSeed: fc.nat(),
    right: textArbitrary,
    rightDepth: fc.integer({ max: 4, min: 0 }),
  })
  .map(
    ({
      left,
      leftDepth,
      middle,
      openEndSeed,
      openStartSeed,
      right,
      rightDepth,
    }) => ({
      content: [
        wrap(textNode(left), leftDepth, 'left'),
        ...middle.map(textNode),
        wrap(textNode(right), rightDepth, 'right'),
      ],
      openEnd: openEndSeed % (rightDepth + 1),
      openStart: openStartSeed % (leftDepth + 1),
    })
  );

const assertLaw = (property: Parameters<typeof fc.assert>[0], offset: number) =>
  fc.assert(property, {
    numRuns: lawRuns,
    seed: lawSeed + offset,
    verbose: true,
  });

void describe('ContentSlice generated laws', () => {
  void it('round-trips detached JSON and reuses only trusted values', () => {
    void assertLaw(
      fc.property(sliceInputArbitrary, (input) => {
        const expected = structuredClone(input);
        const slice = ContentSlice.fromJSON(input);
        const roundTrip = ContentSlice.fromJSON(
          JSON.parse(JSON.stringify(slice)) as unknown
        );

        assert.deepEqual(slice, expected);
        assert.deepEqual(roundTrip, slice);
        assert.equal(ContentSlice.fromJSON(slice), slice);
        assert.notEqual(slice, input);
        assert.equal(Object.isFrozen(slice), true);
        assert.equal(Object.isFrozen(slice.content), true);

        input.content.splice(0, input.content.length, { text: 'mutated' });

        assert.deepEqual(slice, expected);
      }),
      0
    );
  });

  void it('preserves valid openness across content rewrites and closes explicitly', () => {
    void assertLaw(
      fc.property(sliceInputArbitrary, (input) => {
        const slice = ContentSlice.fromJSON(input);
        const replacement = structuredClone(slice.content);
        const preserved = ContentSlice.withContent(slice, replacement, {
          open: 'preserve',
        });
        const closed = ContentSlice.withContent(slice, replacement, {
          open: 'closed',
        });

        assert.deepEqual(preserved, slice);
        assert.equal(ContentSlice.fromJSON(preserved), preserved);
        assert.deepEqual(closed, {
          content: slice.content,
          openEnd: 0,
          openStart: 0,
        });
        assert.deepEqual(ContentSlice.closed(replacement), closed);
      }),
      1
    );
  });

  void it('rejects every generated edge depth beyond the structural spine', () => {
    void assertLaw(
      fc.property(sliceInputArbitrary, fc.boolean(), (input, useStart) => {
        assert.throws(() =>
          ContentSlice.fromJSON({
            ...input,
            ...(useStart
              ? { openStart: input.openStart + 5 }
              : { openEnd: input.openEnd + 5 }),
          })
        );
      }),
      2
    );
  });

  void it('prepares the same token slice as the canonical document encoder', () => {
    void assertLaw(
      fc.property(sliceInputArbitrary, (input) => {
        const slice = ContentSlice.fromJSON(input);
        const canonical = PreparedTokenSlice.fromNodes(slice.content);

        assert.deepEqual(
          encodeContentSlice(slice).toJSON(),
          canonical
            .slice(slice.openStart, canonical.length - slice.openEnd)
            .toJSON()
        );
      }),
      3
    );
  });

  void it('prepares variant openness without cloning trusted content again', () => {
    void assertLaw(
      fc.property(sliceInputArbitrary, (input) => {
        const source = ContentSlice.closed(input.content);

        for (let openStart = 0; openStart <= input.openStart; openStart++) {
          for (let openEnd = 0; openEnd <= input.openEnd; openEnd++) {
            const variant = prepareContentSliceVariant(
              source,
              openStart,
              openEnd
            );

            assert.equal(variant.content, source.content);
            assert.equal(
              prepareContentSliceVariant(source, openStart, openEnd),
              variant
            );
          }
        }
      }),
      4
    );
  });
});
