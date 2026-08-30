/** @jsx jsx */
import { renderHook } from '@testing-library/react';

import { defineBasePlugin } from '../../lib/plugin/defineBasePlugin';
import * as extendStaticEditorModule from '../../static/editor/withStatic';
import { jsx } from '../../testing';
import { useStaticEditor } from './useStaticEditor';

jsx;

// Mock createStaticEditor
let mockCreateStaticEditor: ReturnType<typeof mock>;
let createStaticEditorSpy: ReturnType<typeof spyOn>;

describe('useStaticEditor', () => {
  beforeEach(() => {
    mockCreateStaticEditor = mock((options) => ({
      id: options?.id || 'test-editor',
      children: options?.initialValue || [],
      plugins: options?.plugins || [],
      ...options,
    }));
    createStaticEditorSpy = spyOn(
      extendStaticEditorModule,
      'createStaticEditor'
    ).mockImplementation(mockCreateStaticEditor);
  });

  afterEach(() => {
    createStaticEditorSpy?.mockRestore();
  });

  describe('basic functionality', () => {
    it('create a static editor', () => {
      const { result } = renderHook(() => useStaticEditor());

      expect(result.current).toBeDefined();
      expect(mockCreateStaticEditor).toHaveBeenCalledWith(
        expect.objectContaining({})
      );
    });

    it('pass options to createStaticEditor', () => {
      const options = {
        enabled: true as const,
        id: 'custom-id',
        plugins: [defineBasePlugin('test', {})],
        initialValue: [{ children: [{ text: 'Hello' }], type: 'paragraph' }],
      } as const;

      const { result } = renderHook(() => useStaticEditor(options));

      expect(result.current).toBeDefined();
      expect(mockCreateStaticEditor).toHaveBeenCalledWith(
        expect.objectContaining(options)
      );
      expect(result.current.id).toBe('custom-id');
    });

    it('memoize the editor instance', () => {
      const { rerender, result } = renderHook(() => useStaticEditor());

      const firstEditor = result.current;

      // Re-render without changing deps
      rerender();

      const secondEditor = result.current;

      expect(firstEditor).toBe(secondEditor);
      expect(mockCreateStaticEditor).toHaveBeenCalledTimes(1);
    });
  });

  describe('enabled option', () => {
    it('returns null when enabled is false', () => {
      const { result } = renderHook(() => useStaticEditor({ enabled: false }));

      expect(result.current).toBeNull();
      expect(mockCreateStaticEditor).not.toHaveBeenCalled();
    });

    it('create editor when enabled is true', () => {
      const { result } = renderHook(() => useStaticEditor({ enabled: true }));

      expect(result.current).toBeDefined();
      expect(mockCreateStaticEditor).toHaveBeenCalled();
    });

    it('create editor when enabled is undefined', () => {
      const { result } = renderHook(() =>
        useStaticEditor({ enabled: undefined })
      );

      expect(result.current).toBeDefined();
      expect(mockCreateStaticEditor).toHaveBeenCalled();
    });

    it('recreate editor when enabled changes from false to true', () => {
      const { rerender, result } = renderHook(
        ({ enabled }) => useStaticEditor({ enabled }),
        { initialProps: { enabled: false as boolean | undefined } }
      );

      expect(result.current).toBeNull();
      expect(mockCreateStaticEditor).not.toHaveBeenCalled();

      // Change enabled to true
      rerender({ enabled: true });

      expect(result.current).toBeDefined();
      expect(mockCreateStaticEditor).toHaveBeenCalledTimes(1);
    });

    it('returns null when enabled changes from true to false', () => {
      const { rerender, result } = renderHook(
        ({ enabled }) => useStaticEditor({ enabled }),
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
    it('recreate editor when id changes', () => {
      const { rerender, result } = renderHook(
        ({ id }) => useStaticEditor({ id }),
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

    it('use custom dependencies', () => {
      let customDep = 'initial';

      const { rerender, result } = renderHook(() =>
        useStaticEditor({}, [customDep])
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

    it('does not recreate editor when non-dependency options change', () => {
      const { rerender, result } = renderHook(
        ({ value }) => useStaticEditor({ initialValue: value }),
        {
          initialProps: {
            value: [
              {
                children: [{ text: 'Initial' }],
                type: 'paragraph' as const,
              },
            ],
          },
        }
      );

      const firstEditor = result.current;
      expect(mockCreateStaticEditor).toHaveBeenCalledTimes(1);

      // Change value (not in dependency list)
      rerender({
        value: [
          { children: [{ text: 'Changed' }], type: 'paragraph' as const },
        ],
      });

      const secondEditor = result.current;
      expect(firstEditor).toBe(secondEditor);
      expect(mockCreateStaticEditor).toHaveBeenCalledTimes(1);
    });
  });

  describe('mounting behavior', () => {
    it('handle component unmounting', () => {
      const { unmount } = renderHook(() => useStaticEditor());

      expect(mockCreateStaticEditor).toHaveBeenCalledTimes(1);

      unmount();

      // Should not cause any errors
      expect(() => unmount()).not.toThrow();
    });

    it('create editor on remount', () => {
      const { result, unmount } = renderHook(() => useStaticEditor());

      const firstEditor = result.current;
      expect(mockCreateStaticEditor).toHaveBeenCalledTimes(1);

      unmount();

      // Remount
      const { result: newResult } = renderHook(() => useStaticEditor());

      const secondEditor = newResult.current;
      expect(firstEditor).not.toBe(secondEditor);
      expect(mockCreateStaticEditor).toHaveBeenCalledTimes(2);
    });
  });

  describe('type safety', () => {
    it('properly type the return value based on enabled option', () => {
      // Test compile-time type checking
      const { result: enabledTrue } = renderHook(() =>
        useStaticEditor({ enabled: true })
      );
      // Should not be null
      if (enabledTrue.current) {
        expect(enabledTrue.current.id).toBeDefined();
      }

      const { result: enabledFalse } = renderHook(() =>
        useStaticEditor({ enabled: false })
      );
      // Should be null
      expect(enabledFalse.current).toBeNull();

      const { result: enabledUndefined } = renderHook(() =>
        useStaticEditor({ enabled: undefined })
      );
      // Should not be null
      if (enabledUndefined.current) {
        expect(enabledUndefined.current.id).toBeDefined();
      }
    });
  });

  describe('edge cases', () => {
    it('handle rapid prop changes', () => {
      const { rerender, result } = renderHook(
        ({ id, enabled }) => useStaticEditor({ enabled, id }),
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

    it('handle options with all properties', () => {
      const complexOptions = {
        id: 'complex-editor',
        enabled: true,
        plugins: [
          defineBasePlugin('plugin1', {}),
          defineBasePlugin('plugin2', {}),
        ],
        selection: {
          kind: 'text' as const,
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 7, path: [0, 0] },
        },
        initialValue: [{ children: [{ text: 'Complex' }], type: 'paragraph' }],
      } as const;

      const { result } = renderHook(() => useStaticEditor(complexOptions));

      expect(result.current).toBeDefined();
      expect(mockCreateStaticEditor).toHaveBeenCalledWith(
        expect.objectContaining(complexOptions)
      );
    });
  });
});
