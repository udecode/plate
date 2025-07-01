import { renderHook } from '@testing-library/react';

import { createStaticEditor } from '../../lib/static/editor/createStaticEditor';
import { usePlateViewEditor } from './usePlateViewEditor';

// Mock createStaticEditor
jest.mock('../../lib/static/editor/createStaticEditor');

describe('usePlateViewEditor', () => {
  const mockCreateStaticEditor = createStaticEditor as jest.MockedFunction<typeof createStaticEditor>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateStaticEditor.mockImplementation((options) => ({
      id: options?.id || 'mock-editor',
      children: options?.value || [],
    } as any));
  });

  it('should create a static editor', () => {
    const { result } = renderHook(() => usePlateViewEditor());

    expect(mockCreateStaticEditor).toHaveBeenCalledWith({});
    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('id', 'mock-editor');
  });

  it('should pass options to createStaticEditor', () => {
    const value = [
      { 
        type: 'paragraph', 
        children: [{ text: 'Test content' }] 
      }
    ];

    const options = {
      id: 'custom-id',
      value,
      plugins: [],
    };

    renderHook(() => usePlateViewEditor(options));

    expect(mockCreateStaticEditor).toHaveBeenCalledWith(options);
  });

  it('should return null when enabled is false', () => {
    const { result } = renderHook(() => 
      usePlateViewEditor({ enabled: false })
    );

    expect(mockCreateStaticEditor).not.toHaveBeenCalled();
    expect(result.current).toBeNull();
  });

  it('should create editor when enabled is true', () => {
    const { result } = renderHook(() => 
      usePlateViewEditor({ enabled: true })
    );

    expect(mockCreateStaticEditor).toHaveBeenCalledWith({ enabled: true });
    expect(result.current).toBeDefined();
  });

  it('should create editor when enabled is undefined', () => {
    const { result } = renderHook(() => 
      usePlateViewEditor({ enabled: undefined })
    );

    expect(mockCreateStaticEditor).toHaveBeenCalledWith({ enabled: undefined });
    expect(result.current).toBeDefined();
  });

  it('should memoize editor based on id', () => {
    const { result, rerender } = renderHook(
      ({ id }) => usePlateViewEditor({ id }),
      { initialProps: { id: 'editor-1' } }
    );

    const firstEditor = result.current;

    // Re-render with same ID
    rerender({ id: 'editor-1' });
    expect(result.current).toBe(firstEditor);
    expect(mockCreateStaticEditor).toHaveBeenCalledTimes(1);

    // Re-render with different ID
    rerender({ id: 'editor-2' });
    expect(result.current).toHaveProperty('id', 'editor-2');
    expect(mockCreateStaticEditor).toHaveBeenCalledTimes(2);
  });

  it('should memoize editor based on enabled state', () => {
    const { result, rerender } = renderHook(
      ({ enabled }) => usePlateViewEditor({ enabled }),
      { initialProps: { enabled: true } }
    );

    const firstEditor = result.current;

    // Re-render with same enabled state
    rerender({ enabled: true });
    expect(result.current).toBe(firstEditor);
    expect(mockCreateStaticEditor).toHaveBeenCalledTimes(1);

    // Re-render with different enabled state
    rerender({ enabled: false });
    expect(result.current).toBeNull();
    expect(mockCreateStaticEditor).toHaveBeenCalledTimes(1);

    // Re-render back to enabled
    rerender({ enabled: true });
    expect(result.current).toBeDefined();
    expect(mockCreateStaticEditor).toHaveBeenCalledTimes(2);
  });

  it('should use custom dependencies', () => {
    let callCount = 0;
    mockCreateStaticEditor.mockImplementation(() => ({
      id: `editor-${++callCount}`,
      children: [],
    } as any));

    const { result, rerender } = renderHook(
      ({ dep }) => usePlateViewEditor({}, [dep]),
      { initialProps: { dep: 'value-1' } }
    );

    const firstEditor = result.current;

    // Re-render with same dependency
    rerender({ dep: 'value-1' });
    expect(result.current).toBe(firstEditor);
    expect(mockCreateStaticEditor).toHaveBeenCalledTimes(1);

    // Re-render with different dependency
    rerender({ dep: 'value-2' });
    expect(result.current).toHaveProperty('id', 'editor-2');
    expect(mockCreateStaticEditor).toHaveBeenCalledTimes(2);
  });

  it('should handle complex options', () => {
    const options = {
      id: 'complex-editor',
      plugins: [{ key: 'test' }],
      copyPlugin: false,
      value: [{ type: 'paragraph', children: [{ text: 'Test' }] }],
    };

    renderHook(() => usePlateViewEditor(options));

    expect(mockCreateStaticEditor).toHaveBeenCalledWith(options);
  });

  it('should handle unmounting correctly', () => {
    const { unmount } = renderHook(() => usePlateViewEditor());

    // Should not throw on unmount
    expect(() => unmount()).not.toThrow();
  });

  describe('TypeScript types', () => {
    it('should return correct type when enabled is false', () => {
      const { result } = renderHook(() => 
        usePlateViewEditor({ enabled: false as const })
      );

      // TypeScript should infer result.current as null
      const editor: null = result.current;
      expect(editor).toBeNull();
    });

    it('should return correct type when enabled is true', () => {
      const { result } = renderHook(() => 
        usePlateViewEditor({ enabled: true as const })
      );

      // TypeScript should infer result.current as non-null
      expect(result.current).toBeDefined();
    });

    it('should return correct type when enabled is undefined', () => {
      const { result } = renderHook(() => 
        usePlateViewEditor({ enabled: undefined })
      );

      // TypeScript should infer result.current as non-null
      expect(result.current).toBeDefined();
    });
  });
});