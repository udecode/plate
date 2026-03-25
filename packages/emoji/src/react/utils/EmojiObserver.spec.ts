import { afterAll, beforeEach, describe, expect, it, mock } from 'bun:test';

let intersectionCallback: IntersectionObserverCallback | null = null;
const observeMock = mock();
let originalIntersectionObserver = globalThis.IntersectionObserver;

class IntersectionObserverMock {
  constructor(callback: IntersectionObserverCallback) {
    intersectionCallback = callback;
  }

  observe = observeMock;
}

describe('observeCategories', () => {
  beforeEach(() => {
    intersectionCallback = null;
    observeMock.mockReset();
    originalIntersectionObserver = globalThis.IntersectionObserver;
    (globalThis as any).IntersectionObserver = IntersectionObserverMock;
  });

  afterAll(() => {
    mock.restore();
    (globalThis as any).IntersectionObserver = originalIntersectionObserver;
  });

  it('observes section roots and reports the first visible category', async () => {
    const { observeCategories } = await import(
      `./EmojiObserver?test=${Math.random().toString(36).slice(2)}`
    );
    const setFocusedAndVisibleSections = mock();
    const section = document.createElement('div');
    section.dataset.id = 'frequent';

    observeCategories({
      ancestorRef: { current: document.createElement('div') } as any,
      emojiLibrary: {
        getGrid: () => ({
          sections: () => [{ root: { current: section } }],
        }),
      } as any,
      setFocusedAndVisibleSections,
    });

    intersectionCallback?.(
      [
        {
          isIntersecting: true,
          target: section,
        } as unknown as IntersectionObserverEntry,
      ],
      {} as any
    );

    expect(observeMock).toHaveBeenCalledWith(section);
    expect(setFocusedAndVisibleSections).toHaveBeenCalledWith(
      new Map([['frequent', true]]),
      'frequent'
    );
  });
});
