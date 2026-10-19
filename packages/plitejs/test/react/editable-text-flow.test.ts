import {
  compileTextFlowSegments,
  shouldDeferTextFlowReconcileForNativeInput,
} from '../../src/react/components/editable-text-flow';

describe('compileTextFlowSegments', () => {
  it('preserves source order while sweeping overlapping boundaries once', () => {
    const plan = compileTextFlowSegments('abcdefghij', [
      { attributes: { className: 'outer' }, end: 8, key: 'outer', start: 1 },
      { attributes: { className: 'inner' }, end: 6, key: 'inner', start: 3 },
    ]);

    expect(plan.boundaryVisits).toBe(4);
    expect(
      plan.segments.map(({ decorations, end, start, text }) => ({
        decorations: decorations.map(({ key }) => key),
        end,
        start,
        text,
      }))
    ).toEqual([
      { decorations: [], end: 1, start: 0, text: 'a' },
      { decorations: ['outer'], end: 3, start: 1, text: 'bc' },
      {
        decorations: ['outer', 'inner'],
        end: 6,
        start: 3,
        text: 'def',
      },
      { decorations: ['outer'], end: 8, start: 6, text: 'gh' },
      { decorations: [], end: 10, start: 8, text: 'ij' },
    ]);
  });

  it('keeps stable identities when mapped ranges move after an insertion', () => {
    const before = compileTextFlowSegments('abcdefghij', [
      { attributes: {}, end: 4, key: 'first', start: 1 },
      { attributes: {}, end: 9, key: 'second', start: 6 },
    ]);
    const after = compileTextFlowSegments('abcXdefghij', [
      { attributes: {}, end: 5, key: 'first', start: 1 },
      { attributes: {}, end: 10, key: 'second', start: 7 },
    ]);

    expect(after.segments.map(({ identity }) => identity)).toEqual(
      before.segments.map(({ identity }) => identity)
    );
  });

  it('does not multiply deterministic boundary work by segment count', () => {
    const decorations = Array.from({ length: 10_000 }, (_, index) => ({
      attributes: {},
      end: index * 2 + 1,
      key: String(index),
      start: index * 2,
    }));
    const plan = compileTextFlowSegments('x'.repeat(20_000), decorations);

    expect(plan.boundaryVisits).toBe(20_000);
    expect(plan.segments).toHaveLength(20_000);
  });
});

describe('shouldDeferTextFlowReconcileForNativeInput', () => {
  it('waits only while a native text repair owns the DOM', () => {
    expect(
      shouldDeferTextFlowReconcileForNativeInput({
        activeIntent: 'text-insert',
        pendingNativeTextInputRepairPathKey: '0,0',
        receivedUserInput: true,
      })
    ).toBe(true);
    expect(
      shouldDeferTextFlowReconcileForNativeInput({
        activeIntent: 'text-insert',
        pendingNativeTextInputRepairPathKey: null,
        receivedUserInput: true,
      })
    ).toBe(false);
  });
});
