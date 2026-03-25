import { act, renderHook } from '@testing-library/react';

import {
  registerSharedTocHookMocks,
  resetSharedTocHookMocks,
  useEditorRefMock,
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
    (globalThis as any).IntersectionObserver = IntersectionObserverMock;
  });

  afterEach(() => {
    (globalThis as any).IntersectionObserver = OriginalIntersectionObserver;
  });

  it('observes heading elements and promotes the first visible heading id', async () => {
    const headingEl = document.createElement('h2');
    headingEl.id = 'h1';

    useEditorSelectorMock.mockReturnValue([{ id: 'h1', path: [0] }]);
    useEditorRefMock.mockReturnValue({
      api: {
        toDOMNode: () => headingEl,
      },
    });

    const { useContentObserver } = await import(
      `./useContentObserver?test=${Math.random().toString(36).slice(2)}`
    );

    const { result } = renderHook(() =>
      useContentObserver({
        editorContentRef: { current: document.createElement('div') },
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
            isIntersecting: true,
            target: headingEl,
          } as unknown as IntersectionObserverEntry,
        ],
        {} as IntersectionObserver
      );
    });

    expect(result.current.activeId).toBe('h1');
  });
});
