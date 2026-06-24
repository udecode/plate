import { getDOMTextSyncCapability } from '../src/dom-text-sync';

test('DOM text sync capability names opt-out reasons', () => {
  expect(
    getDOMTextSyncCapability({
      hasText: false,
      projections: [],
    })
  ).toEqual({ enabled: false, reason: 'empty-text' });

  expect(
    getDOMTextSyncCapability({
      hasText: true,
      projections: [{ key: 'p' } as any],
    })
  ).toEqual({ enabled: false, reason: 'projection' });

  expect(
    getDOMTextSyncCapability({
      hasText: true,
      projections: [{ key: 'p' } as any],
      textSync: { projections: 'range-transform' },
    })
  ).toEqual({ enabled: false, reason: 'projection' });

  expect(
    getDOMTextSyncCapability({
      hasText: true,
      projections: [],
      renderLeaf: () => null,
    })
  ).toEqual({ enabled: false, reason: 'custom-leaf' });

  expect(
    getDOMTextSyncCapability({
      hasText: true,
      projections: [],
      renderLeaf: () => null,
      textSync: { renderLeaf: 'text-invariant' },
    })
  ).toEqual({ enabled: true, reason: null });

  expect(
    getDOMTextSyncCapability({
      hasText: true,
      projections: [],
      renderSegment: () => null,
    })
  ).toEqual({ enabled: false, reason: 'custom-segment' });

  expect(
    getDOMTextSyncCapability({
      hasText: true,
      projections: [],
      renderText: () => null,
    })
  ).toEqual({ enabled: false, reason: 'custom-text' });

  expect(
    getDOMTextSyncCapability({
      hasText: true,
      projections: [{ key: 'p' } as any],
      renderText: () => null,
    })
  ).toEqual({ enabled: false, reason: 'custom-text' });

  expect(
    getDOMTextSyncCapability({
      hasText: true,
      projections: [],
    })
  ).toEqual({ enabled: true, reason: null });
});
