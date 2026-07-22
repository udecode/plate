import React from 'react';

import { renderHook } from '@testing-library/react';
import * as actualCoreReact from '@platejs/core/react';

const useEditorMock = mock();
const usePlateValueMock = mock();
const usePluginOptionMock = mock();
const useIsomorphicLayoutEffectMock = mock((effect: () => void) => effect());

mock.module('@platejs/core/react', () => ({
  ...actualCoreReact,
  useEditor: useEditorMock,
  usePlateValue: usePlateValueMock,
  usePluginOption: usePluginOptionMock,
}));

mock.module('@udecode/react-utils', async () => ({
  useIsomorphicLayoutEffect: useIsomorphicLayoutEffectMock,
}));

const loadModule = async () => import('./useCursorOverlay');

describe('useCursorOverlay', () => {
  afterEach(() => {
    mock.restore();
    useEditorMock.mockReset();
    usePlateValueMock.mockReset();
    usePluginOptionMock.mockReset();
    useIsomorphicLayoutEffectMock.mockClear();
  });

  it('returns empty cursor overlays when the container is missing', async () => {
    useEditorMock.mockReturnValue({});
    usePlateValueMock.mockReturnValue({ current: null });
    usePluginOptionMock.mockReturnValue(undefined);

    const { useCursorOverlay } = await loadModule();
    const { result } = renderHook(() => useCursorOverlay());

    expect(result.current).toEqual({
      cursors: [],
      refresh: expect.any(Function),
    });
  });

  it('normalizes tiny selection rects and forwards them to cursor state composition', async () => {
    const range = {
      kind: 'text',
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    };
    const domRange = {
      endContainer: { id: 'end' },
      endOffset: 0,
      startContainer: { id: 'start' },
      startOffset: 0,
    };
    const domNode = {
      getClientRects: () => ({
        item: (index: number) =>
          index === 0 ? { height: 12, left: 56, top: 84, width: 0.5 } : null,
        length: 1,
      }),
      parentElement: {},
    };
    const editor = {
      api: {
        dom: {
          resolveDOMNode: () => domNode,
          resolveDOMRange: () => domRange,
        },
      },
      read: {
        nodes: {
          toArray: () => [[{ text: 'one' }, [0, 0]]],
        },
      },
    };
    const container = document.createElement('div');
    spyOn(container, 'getBoundingClientRect').mockReturnValue({
      x: 50,
      y: 80,
    } as any);
    spyOn(document, 'createRange').mockReturnValue({
      getClientRects: domNode.getClientRects,
      selectNode: mock(),
      setEnd: mock(),
      setStart: mock(),
    } as any);
    Object.defineProperty(container, 'scrollTop', {
      configurable: true,
      value: 4,
    });

    useEditorMock.mockReturnValue(editor);
    usePlateValueMock.mockReturnValue({ current: container });
    usePluginOptionMock.mockReturnValue({
      a: {
        key: 'a',
        selection: range,
      },
    });

    const { useCursorOverlay } = await loadModule();
    const { result } = renderHook(() =>
      useCursorOverlay({
        minSelectionWidth: 4,
        refreshOnResize: false,
      })
    );

    expect(result.current.cursors[0]?.selectionRects).toEqual([
      {
        height: 12,
        left: 4.25,
        top: 8,
        width: 4,
      },
    ]);
    expect(result.current.refresh).toEqual(expect.any(Function));
  });
});
