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
    (globalThis as any).IntersectionObserver = IntersectionObserverMock;
  });

  afterEach(() => {
    (globalThis as any).IntersectionObserver = OriginalIntersectionObserver;
  });

  it('tracks visibility and offset for the active toc item', async () => {
    const { useTocObserver } = await import(
      `./useTocObserver?test=${Math.random().toString(36).slice(2)}`
    );
    const activeItem = document.createElement('div');
    const root = document.createElement('nav');
    root.querySelectorAll = () => [activeItem] as any;
    root.getBoundingClientRect = () => ({ height: 100 }) as DOMRect;

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
            boundingClientRect: { bottom: 120, top: -20 },
            intersectionRatio: 0,
            rootBounds: { bottom: 100, top: 0 },
          } as any,
        ],
        {} as any
      );
    });

    expect(observeMock).toHaveBeenCalledWith(activeItem);
    expect(result.current.visible).toBe(false);
    expect(result.current.offset).toBe(-70);
  });
});
