import { renderHook } from '@testing-library/react';
import * as actualPlatejsReact from 'platejs/react';

const useDragMock = mock(() => {
  throw new Error('useDrag should not run when DOM DnD is unavailable');
});
const useDropMock = mock(() => {
  throw new Error('useDrop should not run when DOM DnD is unavailable');
});
const useEditorRefMock = mock();
const canUseDomDndMock = mock(() => false);

mock.module('platejs/react', () => ({
  ...actualPlatejsReact,
  useEditorRef: useEditorRefMock,
}));

mock.module('react-dnd', () => ({
  useDrag: useDragMock,
  useDrop: useDropMock,
}));

mock.module('../utils/dndEnvironment', () => ({
  canUseDomDnd: canUseDomDndMock,
  noopConnector: (value: any) => value,
}));

const element = {
  children: [{ text: 'Hello' }],
  id: 'block-1',
  type: 'p',
} as any;

describe('useDraggable', () => {
  beforeEach(() => {
    useDragMock.mockClear();
    useDropMock.mockClear();
    useEditorRefMock.mockReset();
    canUseDomDndMock.mockReset();

    useEditorRefMock.mockReturnValue({ plugins: { dnd: {} } });
    canUseDomDndMock.mockReturnValue(false);
  });

  afterAll(() => {
    mock.restore();
  });

  it('returns inert drag state when DOM DnD is unavailable', async () => {
    const { useDraggable } = await import(
      `./useDraggable?test=${Math.random().toString(36).slice(2)}`
    );

    const { result } = renderHook(() => useDraggable({ element }));

    expect(result.current.isAboutToDrag).toBe(false);
    expect(result.current.isDragging).toBe(false);
    expect(result.current.nodeRef.current).toBeNull();
    expect(result.current.previewRef.current).toBeNull();
    expect(useDragMock).not.toHaveBeenCalled();
    expect(useDropMock).not.toHaveBeenCalled();
  });
});
