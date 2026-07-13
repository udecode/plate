import { act, renderHook } from '@testing-library/react';

const OriginalIntersectionObserver = globalThis.IntersectionObserver;

let intersectionCallback: IntersectionObserverCallback | null = null;
const observeMock = mock();
const disconnectMock = mock();

class IntersectionObserverMock {
  constructor(callback: IntersectionObserverCallback) {
    intersectionCallback = callback;
  }

  disconnect = disconnectMock;
  observe = observeMock;
}

describe('useTocObserver', () => {
  beforeEach(() => {
    intersectionCallback = null;
    observeMock.mockReset();
    disconnectMock.mockReset();
    Object.defineProperty(globalThis, 'IntersectionObserver', {
      configurable: true,
      value: IntersectionObserverMock,
    });
  });

  afterEach(() => {
    Object.defineProperty(globalThis, 'IntersectionObserver', {
      configurable: true,
      value: OriginalIntersectionObserver,
    });
  });

  it('tracks visibility and offset for the active toc item', async () => {
    const { useTocObserver } = await import(
      `./useTocObserver?test=${Math.random().toString(36).slice(2)}`
    );
    const activeItem = document.createElement('div');
    const root = document.createElement('nav');

    activeItem.id = 'toc_item_active';
    root.append(activeItem);
    root.getBoundingClientRect = () => DOMRect.fromRect({ height: 100 });

    const { result } = renderHook(() =>
      useTocObserver({
        activeId: 'a',
        isObserve: true,
        tocRef: { current: root },
      })
    );

    act(() => {
      intersectionCallback?.(
        [
          {
            boundingClientRect: DOMRect.fromRect({ height: 140, y: -20 }),
            intersectionRatio: 0,
            rootBounds: DOMRect.fromRect({ height: 100 }),
          } as IntersectionObserverEntry,
        ],
        new IntersectionObserver(() => {})
      );
    });

    expect(observeMock).toHaveBeenCalledWith(activeItem);
    expect(result.current.visible).toBe(false);
    expect(result.current.offset).toBe(-70);
  });
});
