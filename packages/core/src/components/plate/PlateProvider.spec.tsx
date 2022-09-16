import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import {
  PLATE_SCOPE,
  usePlateEditorRef,
  usePlateSelectors,
} from '../../stores/index';
import { ELEMENT_DEFAULT } from '../../types/index';
import { createPlateEditor, getPluginType } from '../../utils/index';
import { PlateProvider } from './PlateProvider';

describe('PlateProvider', () => {
  describe('usePlateEditorRef()', () => {
    describe('when editor is defined', () => {
      it('should be initialValue', async () => {
        const editor = createPlateEditor();

        const wrapper = ({ children }: any) => (
          <PlateProvider editor={editor}>{children}</PlateProvider>
        );
        const { result } = renderHook(() => usePlateEditorRef(), {
          wrapper,
        });

        expect(result.current).toBe(editor);
      });
    });
    describe('when editor is not defined', () => {
      it('should be default', async () => {
        const wrapper = ({ children }: any) => (
          <PlateProvider>{children}</PlateProvider>
        );
        const { result } = renderHook(() => usePlateEditorRef(), {
          wrapper,
        });

        expect(result.current.id).toBe(PLATE_SCOPE);
      });
    });
    describe('when id is defined', () => {
      it('should be id', async () => {
        const wrapper = ({ children }: any) => (
          <PlateProvider id="test">{children}</PlateProvider>
        );
        const { result } = renderHook(() => usePlateEditorRef('test'), {
          wrapper,
        });

        expect(result.current.id).toBe('test');
      });
      it('should be not find editor with default id', async () => {
        const wrapper = ({ children }: any) => (
          <PlateProvider id="test">{children}</PlateProvider>
        );
        const { result } = renderHook(() => usePlateEditorRef(), {
          wrapper,
        });

        expect(result.current).toBeNull();
      });
    });
  });

  describe('usePlateSelectors().value()', () => {
    describe('when initialValue is defined', () => {
      it('should be initialValue', async () => {
        const initialValue = [{ type: 'p', children: [{ text: 'test' }] }];

        const wrapper = ({ children }: any) => (
          <PlateProvider initialValue={initialValue}>{children}</PlateProvider>
        );
        const { result } = renderHook(() => usePlateSelectors().value(), {
          wrapper,
        });

        expect(result.current).toBe(initialValue);
      });
    });
    describe('when value is defined', () => {
      it('should be value', async () => {
        const value = [{ type: 'p', children: [{ text: 'value' }] }];

        const wrapper = ({ children }: any) => (
          <PlateProvider value={value}>{children}</PlateProvider>
        );
        const { result } = renderHook(() => usePlateSelectors().value(), {
          wrapper,
        });

        expect(result.current).toBe(value);
      });
    });
    describe('when editor with children is defined', () => {
      it('should be editor.children', async () => {
        const editor = createPlateEditor();
        editor.children = [{ type: 'p', children: [{ text: 'value' }] }];

        const wrapper = ({ children }: any) => (
          <PlateProvider editor={editor}>{children}</PlateProvider>
        );
        const { result } = renderHook(() => usePlateSelectors().value(), {
          wrapper,
        });

        expect(result.current).toBe(editor.children);
      });
    });
    describe('when editor without children is defined', () => {
      it('should be default', async () => {
        const editor = createPlateEditor();

        const wrapper = ({ children }: any) => (
          <PlateProvider editor={editor}>{children}</PlateProvider>
        );
        const { result } = renderHook(() => usePlateSelectors().value(), {
          wrapper,
        });

        expect(result.current).toEqual([
          {
            type: getPluginType(editor, ELEMENT_DEFAULT),
            children: [{ text: '' }],
          },
        ]);
      });
    });
  });

  describe('usePlateSelectors().plugins()', () => {
    describe('when plugins is updated', () => {
      it('should be updated', () => {
        const _plugins = [{ key: 'test' }];

        const wrapper = ({ children, plugins }: any) => (
          <PlateProvider plugins={plugins}>{children}</PlateProvider>
        );
        const { result, rerender } = renderHook(
          () => usePlateSelectors().plugins(),
          {
            wrapper,
            initialProps: { plugins: _plugins },
          }
        );

        expect(result.current[result.current.length - 1].key).toBe('test');

        rerender({ plugins: [{ key: 'test2' }] });

        expect(result.current[result.current.length - 1].key).toBe('test2');
      });
    });
  });
});
