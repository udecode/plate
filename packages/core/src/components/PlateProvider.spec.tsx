import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import {
  createPlateEditor,
  usePlateEditorRef,
  usePlateSelectors,
} from '@udecode/plate-common';

import { PLATE_SCOPE } from '../stores/index';
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

        expect(result.current.id).toBe(PLATE_SCOPE.toString());
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

        expect(result.current).toEqual(editor.childrenFactory());
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

        expect(result.current.at(-1)!.key).toBe('test');

        rerender({ plugins: [{ key: 'test2' }] });

        expect(result.current.at(-1)!.key).toBe('test2');
      });
    });
  });

  describe('when id updates', () => {
    it('should remount PlateProvider', () => {
      const _plugins = [{ key: 'test1' }];

      const wrapper = ({ children, id }: any) => (
        <PlateProvider id={id} plugins={id === 1 ? _plugins : undefined}>
          {children}
        </PlateProvider>
      );
      const { result, rerender } = renderHook(
        ({ id }) => usePlateSelectors(id).plugins(),
        {
          wrapper,
          initialProps: { id: 1 },
        }
      );

      expect(result.current.at(-1)!.key).toBe('test1');

      rerender({ id: 2 });

      expect(result.current.at(-1)!.key).not.toBe('test1');
    });
  });

  describe('usePlateSelectors().id()', () => {
    describe('when PlateProvider has an id', () => {
      it('should be that id', () => {
        const wrapper = ({ children }: any) => (
          <PlateProvider id="test">{children}</PlateProvider>
        );
        const { result } = renderHook(() => usePlateSelectors().id(), {
          wrapper,
        });

        expect(result.current).toBe('test');
      });
    });

    describe('when PlateProvider without id > PlateProvider with id', () => {
      it('should be the one without id', () => {
        const wrapper = ({ children }: any) => (
          <PlateProvider>
            <PlateProvider id="test">{children}</PlateProvider>
          </PlateProvider>
        );
        const { result } = renderHook(() => usePlateSelectors().id(), {
          wrapper,
        });

        expect(result.current).toBe(PLATE_SCOPE);
      });
    });

    describe('when PlateProvider with id > PlateProvider without id > select id', () => {
      it('should be that id', () => {
        const wrapper = ({ children }: any) => (
          <PlateProvider id="test">
            <PlateProvider>{children}</PlateProvider>
          </PlateProvider>
        );
        const { result } = renderHook(() => usePlateSelectors('test').id(), {
          wrapper,
        });

        expect(result.current).toBe('test');
      });
    });

    describe('when PlateProvider with id > PlateProvider without id', () => {
      it('should be that id', () => {
        const wrapper = ({ children }: any) => (
          <PlateProvider id="test">
            <PlateProvider>{children}</PlateProvider>
          </PlateProvider>
        );
        const { result } = renderHook(() => usePlateSelectors().id(), {
          wrapper,
        });

        expect(result.current).toBe(PLATE_SCOPE);
      });
    });
  });
});
