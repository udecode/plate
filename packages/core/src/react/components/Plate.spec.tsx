import React from 'react';

import { render } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import { type Value, isBlock, setNodes } from '@udecode/slate';
import isEqual from 'lodash/isEqual';
import memoize from 'lodash/memoize';

import type { PlatePlugins } from '../plugin';

import { type SlatePlugins, createSlatePlugin } from '../../lib';
import { createPlateEditor, usePlateEditor } from '../editor';
import { createPlatePlugin } from '../plugin/createPlatePlugin';
import {
  PlateController,
  useEditorRef,
  useEditorValue,
  usePlateEditorStore,
  usePlateSelectors,
} from '../stores';
import { Plate } from './Plate';
import { PlateContent } from './PlateContent';

describe('Plate', () => {
  describe('useEditorRef()', () => {
    describe('when editor is defined', () => {
      it('should be initialValue', async () => {
        const editor = createPlateEditor();

        const wrapper = ({ children }: any) => (
          <Plate editor={editor}>{children}</Plate>
        );
        const { result } = renderHook(() => useEditorRef(), {
          wrapper,
        });

        expect(result.current).toBe(editor);
      });
    });

    describe('when editor is not defined', () => {
      it('should be default', async () => {
        const editor1 = createPlateEditor({ id: 'test1' });
        const editor2 = createPlateEditor({ id: 'test2' });

        const wrapper = ({ children }: any) => (
          <Plate editor={editor1}>
            <Plate editor={editor2}>{children}</Plate>
          </Plate>
        );

        const { result } = renderHook(() => useEditorRef(), {
          wrapper,
        });

        expect(result.current.id).toBe('test2');
      });
    });

    describe('when id is defined', () => {
      it('should be id', async () => {
        const editor1 = createPlateEditor({ id: 'test1' });
        const editor2 = createPlateEditor({ id: 'test2' });

        const wrapper = ({ children }: any) => (
          <Plate editor={editor1}>
            <Plate editor={editor2}>{children}</Plate>
          </Plate>
        );

        const { result: result1 } = renderHook(() => useEditorRef('test1'), {
          wrapper,
        });
        const { result: result2 } = renderHook(() => useEditorRef('test2'), {
          wrapper,
        });

        expect(result1.current.id).toBe('test1');
        expect(result2.current.id).toBe('test2');
      });
    });
  });

  describe('useEditorValue()', () => {
    describe('when initialValue is defined', () => {
      it('should be initialValue', async () => {
        const initialValue: Value = [
          { children: [{ text: 'test' }], type: 'p' },
        ];
        const editor = createPlateEditor({ value: initialValue });

        const wrapper = ({ children }: any) => (
          <Plate editor={editor}>{children}</Plate>
        );
        const { result } = renderHook(() => useEditorValue(), {
          wrapper,
        });

        expect(result.current).toBe(initialValue);
      });
    });

    describe('when editor with children is defined', () => {
      it('should be editor.children', async () => {
        const editor = createPlateEditor();
        editor.children = [{ children: [{ text: 'value' }], type: 'p' }];

        const wrapper = ({ children }: any) => (
          <Plate editor={editor}>{children}</Plate>
        );
        const { result } = renderHook(() => useEditorValue(), {
          wrapper,
        });

        expect(result.current).toBe(editor.children);
      });
    });

    describe('when editor without children is defined', () => {
      it('should be default', async () => {
        const editor = createPlateEditor();

        const wrapper = ({ children }: any) => (
          <Plate editor={editor}>{children}</Plate>
        );
        const { result } = renderHook(() => useEditorValue(), {
          wrapper,
        });

        expect(result.current).toEqual(editor.api.childrenFactory());
      });
    });
  });

  describe('usePlateSelectors().editor().plugins', () => {
    describe('when plugins is updated', () => {
      it('should be updated', () => {
        const editor = createPlateEditor({
          plugins: [createSlatePlugin({ key: 'test' })],
        });

        const wrapper = ({ children, editor }: any) => (
          <Plate editor={editor}>{children}</Plate>
        );
        const { rerender, result } = renderHook(
          () => usePlateSelectors().editor().pluginList,
          {
            initialProps: {
              editor,
            },
            wrapper,
          }
        );

        expect(result.current.at(-1)!.key).toBe('test');

        editor.pluginList = [createPlatePlugin({ key: 'test2' }) as any];

        rerender({
          editor,
        });

        expect(result.current.at(-1)!.key).toBe('test2');
      });
    });

    it('should use plugins from editor', () => {
      const _plugins = [createSlatePlugin({ key: 'test' })];
      const editor = createPlateEditor({ plugins: _plugins });

      const wrapper = ({ children }: any) => (
        <Plate editor={editor}>{children}</Plate>
      );

      const { result } = renderHook(
        () => usePlateSelectors().editor().pluginList,
        {
          wrapper,
        }
      );

      expect(result.current.some((p: any) => p.key === 'test')).toBe(true);
    });
  });

  describe('when id updates', () => {
    it('should remount Plate', () => {
      const _plugins1 = [createSlatePlugin({ key: 'test1' })];
      const _plugins2 = [createSlatePlugin({ key: 'test2' })];
      const editor1 = createPlateEditor({ id: '1', plugins: _plugins1 });
      const editor2 = createPlateEditor({ id: '2', plugins: _plugins2 });

      const wrapper = ({ children, editor }: any) => (
        <Plate editor={editor}>{children}</Plate>
      );
      const { rerender, result } = renderHook(
        ({ editor }) => usePlateSelectors(editor.id).editor().pluginList,
        {
          initialProps: { editor: editor1 },
          wrapper,
        }
      );

      expect(result.current.at(-1)!.key).toBe('test1');

      rerender({ editor: editor2 } as any);

      expect(result.current.at(-1)!.key).toBe('test2');
    });
  });

  describe('usePlateSelectors().editor().id', () => {
    describe('when Plate has an id', () => {
      it('should be editor id', async () => {
        const editor = createPlateEditor({ id: 'test' });

        const wrapper = ({ children }: any) => (
          <Plate editor={editor}>{children}</Plate>
        );
        const { result } = renderHook(() => usePlateSelectors().editor().id, {
          wrapper,
        });

        expect(result.current).toBe('test');
      });
    });

    describe('when Plate without id > Plate with id', () => {
      it('should be the closest one', () => {
        const wrapper = ({ children }: any) => (
          <Plate editor={createPlateEditor()}>
            <Plate editor={createPlateEditor({ id: 'test' })}>{children}</Plate>
          </Plate>
        );
        const { result } = renderHook(() => usePlateSelectors().editor().id, {
          wrapper,
        });

        expect(result.current).toBe('test');
      });
    });

    describe('when Plate with id > Plate without id > select id', () => {
      it('should be that id', () => {
        const wrapper = ({ children }: any) => (
          <Plate editor={createPlateEditor({ id: 'test' })}>
            <Plate editor={createPlateEditor()}>{children}</Plate>
          </Plate>
        );
        const { result } = renderHook(
          () => usePlateSelectors('test').editor().id,
          {
            wrapper,
          }
        );

        expect(result.current).toBe('test');
      });
    });

    describe('when Plate has an editor', () => {
      it('should be editor id', async () => {
        const editor = createPlateEditor({ id: 'test' });

        const wrapper = ({ children }: any) => (
          <Plate editor={editor}>{children}</Plate>
        );
        const { result } = renderHook(() => usePlateSelectors().editor().id, {
          wrapper,
        });

        expect(result.current).toBe('test');
      });
    });
  });

  describe('usePlateEditorStore', () => {
    const getStore = (wrapper: any) =>
      renderHook(() => usePlateEditorStore(), { wrapper }).result.current;

    const getId = (wrapper: any) =>
      renderHook(() => usePlateSelectors().editor().id, { wrapper }).result
        .current;

    const getIsFallback = (wrapper: any) =>
      renderHook(() => useEditorRef().isFallback, { wrapper }).result.current;

    describe('when Plate exists', () => {
      describe('when editor is defined', () => {
        it('returns the store', async () => {
          const editor = createPlateEditor({ id: 'test' });

          const wrapper = ({ children }: any) => (
            <Plate editor={editor}>{children}</Plate>
          );
          expect(getStore(wrapper)).toBeDefined();
          expect(getId(wrapper)).toBe('test');
          expect(getIsFallback(wrapper)).toBe(false);
        });
      });

      describe('when editor is not defined', () => {
        it('returns the store', async () => {
          const editor = createPlateEditor({ id: 'test' });

          const wrapper = ({ children }: any) => (
            <Plate editor={editor}>{children}</Plate>
          );
          expect(getStore(wrapper)).toBeDefined();
          expect(getId(wrapper)).toBe('test');
          expect(getIsFallback(wrapper)).toBe(false);
        });
      });
    });

    describe('when Plate does not exist', () => {
      describe('when PlateController exists', () => {
        describe('when PlateController returns a store', () => {
          it('returns the store', () => {
            const EXPECTED_STORE = 'expected store' as any;

            const wrapper = ({ children }: any) => (
              <PlateController
                activeId="test"
                editorStores={{
                  test: EXPECTED_STORE,
                }}
              >
                {children}
              </PlateController>
            );

            expect(getStore(wrapper)).toBe(EXPECTED_STORE);
          });
        });

        describe('when PlateController returns null', () => {
          it('returns the fallback store', () => {
            const wrapper = ({ children }: any) => (
              <PlateController
                activeId="test"
                editorStores={{
                  test: null,
                }}
              >
                {children}
              </PlateController>
            );

            expect(getStore(wrapper)).toBeDefined();
            expect(getIsFallback(wrapper)).toBe(true);
          });
        });
      });

      describe('when PlateController does not exist', () => {
        it('throws an error', () => {
          const wrapper = ({ children }: any) => <>{children}</>;
          expect(() => getStore(wrapper)).toThrow();
        });
      });
    });
  });

  describe('when shouldNormalizeEditor false', () => {
    it('should not trigger normalize if shouldNormalizeEditor is not set to true', () => {
      const fn = jest.fn((e, [node, path]) => {
        if (isBlock(e, node) && path?.length && !isEqual(node.path, path)) {
          setNodes(e, { path }, { at: path });
        }
      });

      const plugins: SlatePlugins = memoize(
        (): SlatePlugins => [
          createSlatePlugin({
            extendEditor: ({ editor }) => {
              const { normalizeNode } = editor;
              editor.normalizeNode = (n) => {
                fn(editor, n);
                normalizeNode(n);
              };

              return editor;
            },
            key: 'a',
          }),
        ]
      )();

      const editor = createPlateEditor({
        plugins,
        value: [{ children: [{ text: '' }] }] as any,
      });

      render(
        <Plate editor={editor}>
          <PlateContent />
        </Plate>
      );

      expect(fn).not.toHaveBeenCalled();

      expect(editor.children).not.toStrictEqual([
        { children: [{ text: '' }], path: [0] },
      ]);
    });
  });

  describe('when renderAboveSlate renders null', () => {
    it('should not normalize editor children', () => {
      const plugins: PlatePlugins = [
        createPlatePlugin({
          key: 'a',
          renderAboveSlate: () => {
            return null;
          },
        }),
      ];

      const editor = createPlateEditor({
        plugins,
        value: [{} as any],
      });

      expect(() =>
        render(
          <Plate editor={editor}>
            <PlateContent />
          </Plate>
        )
      ).not.toThrow();
    });
  });

  describe('Plate remounting', () => {
    it('should remount when editor is recreated', () => {
      let mountCount = 0;

      const MountCounter = () => {
        React.useEffect(() => {
          mountCount++;
        }, []);

        return null;
      };

      const TestComponent = ({ dep }: { dep: number }) => {
        const editor = usePlateEditor({ id: 'test' }, [dep]);

        return (
          <Plate editor={editor}>
            <PlateContent />
            <MountCounter />
          </Plate>
        );
      };

      const { rerender } = render(<TestComponent dep={1} />);

      expect(mountCount).toBe(1);

      // Rerender with the same dependency
      rerender(<TestComponent dep={1} />);
      expect(mountCount).toBe(1);

      // Rerender with a different dependency
      rerender(<TestComponent dep={2} />);
      expect(mountCount).toBe(2);
    });
  });
});
