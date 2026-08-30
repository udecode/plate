import {
  getDOMTextSyncCapability,
  setDOMTextSyncRendererCapability,
} from '../../src/react/dom-text-sync';

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
      projections: [],
      renderSegment: () => null,
    })
  ).toEqual({ enabled: false, reason: 'custom-segment' });

  expect(
    getDOMTextSyncCapability({
      hasText: true,
      projections: [],
      renderLeaf: () => null,
    })
  ).toEqual({ enabled: false, reason: 'custom-leaf' });

  const safeLeaf = setDOMTextSyncRendererCapability(
    () => null,
    () => true
  );

  expect(
    getDOMTextSyncCapability({
      hasText: true,
      projections: [],
      renderLeaf: safeLeaf,
    })
  ).toEqual({ enabled: true, reason: null });

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
