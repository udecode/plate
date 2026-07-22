import { act, renderHook } from '@testing-library/react';

import {
  registerSharedTocHookMocks,
  resetSharedTocHookMocks,
  useEditorMock,
  useEditorSelectorMock,
} from './__tests__/tocHookMocks';

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

describe('useContentObserver', () => {
  beforeEach(() => {
    registerSharedTocHookMocks();
    resetSharedTocHookMocks();
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

  it('observes heading elements and promotes the first visible heading id', async () => {
    const headingEl = document.createElement('h2');
    headingEl.id = 'h1';

    useEditorSelectorMock.mockReturnValue([{ id: 'h1', path: [0] }]);
    useEditorMock.mockReturnValue({
      api: {
        dom: { resolveDOMNode: () => headingEl },
      },
      read: { nodes: { get: () => [{ id: 'h1' }, [0]] } },
    });

    const { useContentObserver } = await import(
      `./useContentObserver?test=${Math.random().toString(36).slice(2)}`
    );

    const { result } = renderHook(() =>
      useContentObserver({
        editorContent: document.createElement('div'),
        isObserve: true,
        isScroll: true,
        rootMargin: '0px',
        status: 0,
      })
    );

    expect(observeMock).toHaveBeenCalledWith(headingEl);

    act(() => {
      intersectionCallback?.(
        [
          {
            boundingClientRect: DOMRect.fromRect({}),
            intersectionRatio: 1,
            intersectionRect: DOMRect.fromRect({}),
            isIntersecting: true,
            rootBounds: DOMRect.fromRect({}),
            target: headingEl,
            time: 0,
          } as IntersectionObserverEntry,
        ],
        new IntersectionObserver(() => {})
      );
    });

    expect(result.current.activeId).toBe('h1');
  });
});
