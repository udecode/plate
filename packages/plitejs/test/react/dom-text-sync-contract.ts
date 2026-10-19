import {
  getDOMTextSyncCapability,
  setDOMTextSyncRendererCapability,
} from '../../src/react/dom-text-sync';

test('DOM text sync capability names opt-out reasons', () => {
  expect(
    getDOMTextSyncCapability({
      hasText: false,
      decorations: [],
    })
  ).toEqual({ enabled: false, reason: 'empty-text' });

  expect(
    getDOMTextSyncCapability({
      hasText: true,
      decorations: [{ attributes: {}, end: 1, key: 'decoration', start: 0 }],
    })
  ).toEqual({ enabled: false, reason: 'decoration' });

  expect(
    getDOMTextSyncCapability({
      hasText: true,
      decorations: [],
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
      decorations: [],
      renderLeaf: safeLeaf,
    })
  ).toEqual({ enabled: true, reason: null });

  expect(
    getDOMTextSyncCapability({
      hasText: true,
      decorations: [],
      renderText: () => null,
    })
  ).toEqual({ enabled: false, reason: 'custom-text' });

  expect(
    getDOMTextSyncCapability({
      hasText: true,
      decorations: [{ attributes: {}, end: 1, key: 'decoration', start: 0 }],
      renderText: () => null,
    })
  ).toEqual({ enabled: false, reason: 'custom-text' });

  expect(
    getDOMTextSyncCapability({
      hasText: true,
      decorations: [],
    })
  ).toEqual({ enabled: true, reason: null });
});
