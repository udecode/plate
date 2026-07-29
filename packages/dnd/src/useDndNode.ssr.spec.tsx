import { renderHook } from '@testing-library/react';
import type { Element } from '@platejs/plite';

import * as actualPlatejsReact from '@platejs/core/react';

const useDragMock = mock(() => {
  throw new Error('useDrag should not run when DOM DnD is unavailable');
});
const useDropMock = mock(() => {
  throw new Error('useDrop should not run when DOM DnD is unavailable');
});
const useEditorMock = mock();

mock.module('@platejs/core/react', () => ({
  ...actualPlatejsReact,
  useEditor: useEditorMock,
}));

mock.module('react-dnd', () => ({
  useDrag: useDragMock,
  useDrop: useDropMock,
}));

const element: Element = {
  children: [{ text: 'Hello' }],
  id: 'block-1',
  type: 'p',
};

describe('useDraggable', () => {
  beforeEach(() => {
    useDragMock.mockClear();
    useDropMock.mockClear();
    useEditorMock.mockReset();

    useEditorMock.mockReturnValue({ plugins: { dnd: {} } });
  });

  afterAll(() => {
    mock.restore();
  });

  it('returns inert drag state when DOM DnD is unavailable', async () => {
    const documentDescriptor = Object.getOwnPropertyDescriptor(
      globalThis,
      'document'
    );
    const windowDescriptor = Object.getOwnPropertyDescriptor(
      globalThis,
      'window'
    );
    let useDraggable: typeof import('./useDndNode')['useDraggable'] | undefined;

    try {
      Object.defineProperty(globalThis, 'document', {
        configurable: true,
        value: undefined,
      });
      Object.defineProperty(globalThis, 'window', {
        configurable: true,
        value: undefined,
      });
      ({ useDraggable } = await import(
        `./useDndNode?test=${Math.random().toString(36).slice(2)}`
      ));
    } finally {
      if (documentDescriptor) {
        Object.defineProperty(globalThis, 'document', documentDescriptor);
      }
      if (windowDescriptor) {
        Object.defineProperty(globalThis, 'window', windowDescriptor);
      }
    }

    if (!useDraggable) {
      throw new Error('Expected the inert DnD hook.');
    }

    const { result } = renderHook(() => useDraggable({ element }));

    expect(result.current.isAboutToDrag).toBe(false);
    expect(result.current.isDragging).toBe(false);
    expect(result.current.nodeRef.current).toBeNull();
    expect(result.current.previewRef.current).toBeNull();
    expect(useDragMock).not.toHaveBeenCalled();
    expect(useDropMock).not.toHaveBeenCalled();
  });
});
