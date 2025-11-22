import { jsx } from '@platejs/test-utils';
/** @jsx jsx */
import { renderHook } from '@testing-library/react';

import { createSlatePlugin } from '../../lib/plugin/createSlatePlugin';
import * as withStaticModule from '../../static/editor/withStatic';
import { usePlateViewEditor } from './usePlateViewEditor';

jsx;

// Mock createStaticEditor
let mockCreateStaticEditor: ReturnType<typeof mock>;
let createStaticEditorSpy: ReturnType<typeof spyOn>;

describe('usePlateViewEditor', () => {
  beforeEach(() => {
    mockCreateStaticEditor = mock((options) => ({
      id: options?.id || 'test-editor',
      children: options?.value || [],
      plugins: options?.plugins || [],
      ...options,
    }));
    createStaticEditorSpy = spyOn(
      withStaticModule,
      'createStaticEditor'
    ).mockImplementation(mockCreateStaticEditor);
  });

  afterEach(() => {
    createStaticEditorSpy?.mockRestore();
  });

  describe('basic functionality', () => {
    it('should create a static editor', () => {
      const { result } = renderHook(() => usePlateViewEditor());

      expect(result.current).toBeDefined();
      expect(mockCreateStaticEditor).toHaveBeenCalledWith(
        expect.objectContaining({})
      );
    });

    it('should pass options to createStaticEditor', () => {
      const options = {
        id: 'custom-id',
        plugins: [createSlatePlugin({ key: 'test' })],
        value: [{ children: [{ text: 'Hello' }], type: 'p' }],
      };

      const { result } = renderHook(() => usePlateViewEditor(options));

      expect(result.current).toBeDefined();
      expect(mockCreateStaticEditor).toHaveBeenCalledWith(
        expect.objectContaining(options)
      );
      expect(result.current.id).toBe('custom-id');
    });

    it('should memoize the editor instance', () => {
      const { rerender, result } = renderHook(() => usePlateViewEditor());

      const firstEditor = result.current;

      // Re-render without changing deps
      rerender();

      const secondEditor = result.current;

      expect(firstEditor).toBe(secondEditor);
      expect(mockCreateStaticEditor).toHaveBeenCalledTimes(1);
    });
  });

  describe('enabled option', () => {
    it('should return null when enabled is false', () => {
      const { result } = renderHook(() =>
        usePlateViewEditor({ enabled: false })
      );

      expect(result.current).toBeNull();
      expect(mockCreateStaticEditor).not.toHaveBeenCalled();
    });

    it('should create editor when enabled is true', () => {
      const { result } = renderHook(() =>
        usePlateViewEditor({ enabled: true })
      );

      expect(result.current).toBeDefined();
      expect(mockCreateStaticEditor).toHaveBeenCalled();
    });

    it('should create editor when enabled is undefined', () => {
      const { result } = renderHook(() =>
        usePlateViewEditor({ enabled: undefined })
      );

      expect(result.current).toBeDefined();
      expect(mockCreateStaticEditor).toHaveBeenCalled();
    });

    it('should recreate editor when enabled changes from false to true', () => {
      const { rerender, result } = renderHook(
        ({ enabled }) => usePlateViewEditor({ enabled }),
        { initialProps: { enabled: false as boolean | undefined } }
      );

      expect(result.current).toBeNull();
      expect(mockCreateStaticEditor).not.toHaveBeenCalled();

      // Change enabled to true
      rerender({ enabled: true });

      expect(result.current).toBeDefined();
      expect(mockCreateStaticEditor).toHaveBeenCalledTimes(1);
    });

    it('should return null when enabled changes from true to false', () => {
      const { rerender, result } = renderHook(
        ({ enabled }) => usePlateViewEditor({ enabled }),
        { initialProps: { enabled: true as boolean | undefined } }
      );

      expect(result.current).toBeDefined();
      expect(mockCreateStaticEditor).toHaveBeenCalledTimes(1);

      // Change enabled to false
      rerender({ enabled: false });

      expect(result.current).toBeNull();
      // Still called only once from initial render
      expect(mockCreateStaticEditor).toHaveBeenCalledTimes(1);
    });
  });

  describe('dependency list', () => {
    it('should recreate editor when id changes', () => {
      const { rerender, result } = renderHook(
        ({ id }) => usePlateViewEditor({ id }),
        { initialProps: { id: 'editor-1' } }
      );

      const firstEditor = result.current;
      expect(mockCreateStaticEditor).toHaveBeenCalledTimes(1);

      // Change id
      rerender({ id: 'editor-2' });

      const secondEditor = result.current;
      expect(firstEditor).not.toBe(secondEditor);
      expect(mockCreateStaticEditor).toHaveBeenCalledTimes(2);
    });

    it('should use custom dependencies', () => {
      let customDep = 'initial';

      const { rerender, result } = renderHook(() =>
        usePlateViewEditor({}, [customDep])
      );

      const firstEditor = result.current;
      expect(mockCreateStaticEditor).toHaveBeenCalledTimes(1);

      // Change custom dependency
      customDep = 'changed';
      rerender();

      const secondEditor = result.current;
      expect(firstEditor).not.toBe(secondEditor);
      expect(mockCreateStaticEditor).toHaveBeenCalledTimes(2);
    });

    it('should not recreate editor when non-dependency options change', () => {
      const { rerender, result } = renderHook(
        ({ value }) => usePlateViewEditor({ value }),
        {
          initialProps: {
            value: [{ children: [{ text: 'Initial' }], type: 'p' }],
          },
        }
      );

      const firstEditor = result.current;
      expect(mockCreateStaticEditor).toHaveBeenCalledTimes(1);

      // Change value (not in dependency list)
      rerender({ value: [{ children: [{ text: 'Changed' }], type: 'p' }] });

      const secondEditor = result.current;
      expect(firstEditor).toBe(secondEditor);
      expect(mockCreateStaticEditor).toHaveBeenCalledTimes(1);
    });
  });

  describe('mounting behavior', () => {
    it('should handle component unmounting', () => {
      const { unmount } = renderHook(() => usePlateViewEditor());

      expect(mockCreateStaticEditor).toHaveBeenCalledTimes(1);

      unmount();

      // Should not cause any errors
      expect(() => unmount()).not.toThrow();
    });

    it('should create editor on remount', () => {
      const { result, unmount } = renderHook(() => usePlateViewEditor());

      const firstEditor = result.current;
      expect(mockCreateStaticEditor).toHaveBeenCalledTimes(1);

      unmount();

      // Remount
      const { result: newResult } = renderHook(() => usePlateViewEditor());

      const secondEditor = newResult.current;
      expect(firstEditor).not.toBe(secondEditor);
      expect(mockCreateStaticEditor).toHaveBeenCalledTimes(2);
    });
  });

  describe('type safety', () => {
    it('should properly type the return value based on enabled option', () => {
      // Test compile-time type checking
      const { result: enabledTrue } = renderHook(() =>
        usePlateViewEditor({ enabled: true })
      );
      // Should not be null
      if (enabledTrue.current) {
        expect(enabledTrue.current.id).toBeDefined();
      }

      const { result: enabledFalse } = renderHook(() =>
        usePlateViewEditor({ enabled: false })
      );
      // Should be null
      expect(enabledFalse.current).toBeNull();

      const { result: enabledUndefined } = renderHook(() =>
        usePlateViewEditor({ enabled: undefined })
      );
      // Should not be null
      if (enabledUndefined.current) {
        expect(enabledUndefined.current.id).toBeDefined();
      }
    });
  });

  describe('edge cases', () => {
    it('should handle rapid prop changes', () => {
      const { rerender, result } = renderHook(
        ({ id, enabled }) => usePlateViewEditor({ id, enabled }),
        {
          initialProps: {
            id: 'editor-1',
            enabled: true as boolean | undefined,
          },
        }
      );

      // Rapid changes
      rerender({ id: 'editor-2', enabled: true });
      rerender({ id: 'editor-3', enabled: false });
      rerender({ id: 'editor-4', enabled: true });

      expect(result.current).toBeDefined();
      // Should be called 3 times: initial, editor-2, editor-4 (skipped editor-3 because enabled was false)
      expect(mockCreateStaticEditor).toHaveBeenCalledTimes(3);
    });

    it('should handle options with all properties', () => {
      const complexOptions = {
        id: 'complex-editor',
        enabled: true,
        plugins: [
          createSlatePlugin({ key: 'plugin1' }),
          createSlatePlugin({ key: 'plugin2' }),
        ],
        selection: {
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 7, path: [0, 0] },
        },
        value: [{ children: [{ text: 'Complex' }], type: 'p' }],
      };

      const { result } = renderHook(() => usePlateViewEditor(complexOptions));

      expect(result.current).toBeDefined();
      expect(mockCreateStaticEditor).toHaveBeenCalledWith(
        expect.objectContaining(complexOptions)
      );
    });

    it('should handle empty options object', () => {
      const { result } = renderHook(() => usePlateViewEditor({}));

      expect(result.current).toBeDefined();
      expect(mockCreateStaticEditor).toHaveBeenCalledWith(
        expect.objectContaining({})
      );
    });
  });
});
