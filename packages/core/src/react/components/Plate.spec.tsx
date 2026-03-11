/// <reference types="@testing-library/jest-dom" />

import React from 'react';

import type { Value } from '@platejs/slate';

import { act, render, renderHook } from '@testing-library/react';
import { useAtomStoreValue } from 'jotai-x';
import isEqual from 'lodash/isEqual';
import memoize from 'lodash/memoize';

import type { PlatePlugins } from '../plugin';
import type { PlateElementProps, PlateLeafProps } from './plate-nodes';

import { type SlatePlugins, createSlatePlugin } from '../../lib';
import { createPlateEditor, usePlateEditor } from '../editor';
import { createPlatePlugin } from '../plugin/createPlatePlugin';
import {
  PlateController,
  useEditorRef,
  useEditorValue,
  usePlateStore,
} from '../stores';
import { TestPlate as Plate } from '../__tests__/TestPlate';
import { PlateContent } from './PlateContent';

describe('Plate', () => {
  describe('useEditorRef()', () => {
    describe('when editor is defined', () => {
      it('returns the provided editor', async () => {
        const editor = createPlateEditor();

        const wrapper = ({ children }: any) => (
          <Plate editor={editor}>{children}</Plate>
        );
        const { result } = renderHook(() => useEditorRef(), { wrapper });

        expect(result.current as any).toBe(editor);
      });
    });

    describe('when editor is not defined', () => {
      it('returns the closest editor from context', async () => {
        const editor1 = createPlateEditor({ id: 'test1' });
        const editor2 = createPlateEditor({ id: 'test2' });

        const wrapper = ({ children }: any) => (
          <Plate editor={editor1}>
            <Plate editor={editor2}>{children}</Plate>
          </Plate>
        );

        const { result } = renderHook(() => useEditorRef(), { wrapper });

        expect(result.current.id).toBe('test2');
      });
    });

    describe('when id is defined', () => {
      it('selects the editor by id', async () => {
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
      it('returns the initial value reference', async () => {
        const initialValue: Value = [
          { children: [{ text: 'test' }], type: 'p' },
        ];
        const editor = createPlateEditor({ value: initialValue });

        const wrapper = ({ children }: any) => (
          <Plate editor={editor}>{children}</Plate>
        );
        const { result } = renderHook(() => useEditorValue(), { wrapper });

        expect(result.current).toBe(initialValue);
      });
    });

    describe('when editor with children is defined', () => {
      it('returns the editor children', async () => {
        const editor = createPlateEditor();
        editor.children = [{ children: [{ text: 'value' }], type: 'p' }];

        const wrapper = ({ children }: any) => (
          <Plate editor={editor}>{children}</Plate>
        );
        const { result } = renderHook(() => useEditorValue(), { wrapper });

        expect(result.current).toBe(editor.children);
      });
    });

    describe('when editor without children is defined', () => {
      it('falls back to the default editor value', async () => {
        const editor = createPlateEditor();

        const wrapper = ({ children }: any) => (
          <Plate editor={editor}>{children}</Plate>
        );
        const { result } = renderHook(() => useEditorValue(), { wrapper });

        expect(result.current).toEqual(editor.api.create.value());
      });
    });
  });

  describe('useEditorRef().plugins', () => {
    it('uses the plugins already attached to the editor', () => {
      const _plugins = [createSlatePlugin({ key: 'test' })];
      const editor = createPlateEditor({ plugins: _plugins });

      const wrapper = ({ children }: any) => (
        <Plate editor={editor}>{children}</Plate>
      );

      const { result } = renderHook(() => useEditorRef().meta.pluginList, {
        wrapper,
      });

      expect(result.current.some((p: any) => p.key === 'test')).toBe(true);
    });
  });

  describe('useEditorRef().id', () => {
    describe('when Plate has an id', () => {
      it('returns the editor id', async () => {
        const editor = createPlateEditor({ id: 'test' });

        const wrapper = ({ children }: any) => (
          <Plate editor={editor}>{children}</Plate>
        );
        const { result } = renderHook(() => useEditorRef().id, { wrapper });

        expect(result.current).toBe('test');
      });
    });

    describe('when Plate without id > Plate with id', () => {
      it('returns the closest editor with an id', () => {
        const wrapper = ({ children }: any) => (
          <Plate editor={createPlateEditor()}>
            <Plate editor={createPlateEditor({ id: 'test' })}>{children}</Plate>
          </Plate>
        );
        const { result } = renderHook(() => useEditorRef().id, { wrapper });

        expect(result.current).toBe('test');
      });
    });

    describe('when Plate with id > Plate without id > select id', () => {
      it('returns the requested editor id from context', () => {
        const wrapper = ({ children }: any) => (
          <Plate editor={createPlateEditor({ id: 'test' })}>
            <Plate editor={createPlateEditor()}>{children}</Plate>
          </Plate>
        );
        const { result } = renderHook(() => useEditorRef('test').id, {
          wrapper,
        });

        expect(result.current).toBe('test');
      });
    });
  });

  describe('usePlateStore', () => {
    const getStore = (wrapper: any) =>
      renderHook(() => usePlateStore(), { wrapper }).result.current;

    const getId = (wrapper: any) =>
      renderHook(() => useAtomStoreValue(usePlateStore(), 'editor').id, {
        wrapper,
      }).result.current;

    const getIsFallback = (wrapper: any) =>
      renderHook(() => useEditorRef().meta.isFallback, { wrapper }).result
        .current;

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

        it('prefers the closest Plate store over PlateController state', () => {
          const EXPECTED_STORE = 'controller store' as any;
          const editor = createPlateEditor({ id: 'local' });

          const wrapper = ({ children }: any) => (
            <PlateController
              activeId="controller"
              editorStores={{ controller: EXPECTED_STORE }}
            >
              <Plate editor={editor}>{children}</Plate>
            </PlateController>
          );

          expect(getStore(wrapper)).not.toBe(EXPECTED_STORE);
          expect(getId(wrapper)).toBe('local');
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
                editorStores={{ test: EXPECTED_STORE }}
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
              <PlateController activeId="test" editorStores={{ test: null }}>
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

  describe('when editor normalization is disabled', () => {
    it('does not normalize on mount', () => {
      const fn = mock((e, [node, path]) => {
        if (e.api.isBlock(node) && path?.length && !isEqual(node.path, path)) {
          e.tf.setNodes({ path }, { at: path });
        }
      });

      const plugins: SlatePlugins = memoize(
        (): SlatePlugins => [
          createSlatePlugin({ key: 'a' }).extendEditorTransforms(
            ({ editor, tf: { normalizeNode } }) => ({
              normalizeNode(node) {
                fn(editor, node);
                normalizeNode(node);
              },
            })
          ),
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

  describe('when render aboveSlate renders null', () => {
    it('renders without normalizing editor children', () => {
      const plugins: PlatePlugins = [
        createPlatePlugin({
          key: 'a',
          render: {
            aboveSlate: () => null,
          },
        }),
      ];

      const editor = createPlateEditor({ plugins, value: [{} as any] });

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
    it('remounts when usePlateEditor recreates the editor', () => {
      let mountCount = 0;

      const MountCounter = () => {
        React.useEffect(() => {
          mountCount++;
        }, []);

        return null;
      };

      const TestComponent = ({ dep }: { dep: number }) => {
        const editor = usePlateEditor({ id: 'test' }, [dep]);

        editor.meta.key = dep;

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

  describe('User-defined attributes', () => {
    const ParagraphElement = ({ attributes, children }: PlateElementProps) => (
      <p {...attributes} data-testid="paragraph">
        {children}
      </p>
    );

    const BoldLeaf = ({ attributes, children }: PlateLeafProps) => (
      <strong {...attributes} data-testid="bold">
        {children}
      </strong>
    );

    const getParagraphPlugin = (dangerouslyAllowAttributes: boolean) =>
      createPlatePlugin({
        key: 'p',
        node: {
          component: ParagraphElement,
          dangerouslyAllowAttributes: dangerouslyAllowAttributes
            ? ['data-my-paragraph-attribute']
            : undefined,
          isElement: true,
        },
      });

    const getBoldPlugin = (dangerouslyAllowAttributes: boolean) =>
      createPlatePlugin({
        key: 'bold',
        node: {
          component: BoldLeaf,
          dangerouslyAllowAttributes: dangerouslyAllowAttributes
            ? ['data-my-bold-attribute']
            : undefined,
          isLeaf: true,
        },
      });

    const initialValue = [
      {
        attributes: {
          'data-my-paragraph-attribute': 'hello',
          'data-unpermitted-paragraph-attribute': 'world',
        },
        children: [
          {
            attributes: {
              'data-my-bold-attribute': 'hello',
              'data-unpermitted-bold-attribute': 'world',
            },
            bold: true,
            text: 'My bold paragraph',
          },
        ],
        type: 'p',
      },
    ];

    const Editor = ({
      dangerouslyAllowAttributes,
    }: {
      dangerouslyAllowAttributes: boolean;
    }) => {
      const editor = usePlateEditor({
        plugins: [
          getParagraphPlugin(dangerouslyAllowAttributes),
          getBoldPlugin(dangerouslyAllowAttributes),
        ],
        value: initialValue,
      });

      return (
        <Plate editor={editor}>
          <PlateContent />
        </Plate>
      );
    };

    it('renders no user-defined attributes by default', () => {
      const { getByTestId } = render(
        <Editor dangerouslyAllowAttributes={false} />
      );

      const paragraphEl = getByTestId('paragraph');
      expect(Object.keys(paragraphEl.dataset)).toEqual(['slateNode', 'testid']);

      const boldEl = getByTestId('bold');
      expect(Object.keys(boldEl.dataset)).toEqual(['testid']);
    });

    it('renders allowed user-defined attributes', () => {
      const { getByTestId } = render(
        <Editor dangerouslyAllowAttributes={true} />
      );

      const paragraphEl = getByTestId('paragraph');
      expect(Object.keys(paragraphEl.dataset)).toEqual([
        'slateNode',
        'myParagraphAttribute',
        'testid',
      ]);

      const boldEl = getByTestId('bold');
      expect(Object.keys(boldEl.dataset)).toEqual([
        'myBoldAttribute',
        'testid',
      ]);
    });
  });

  describe('when rendering unknown element type', () => {
    it('does not crash when encountering an element with an unknown type', () => {
      const initialValueWithUnknownType: Value = [
        {
          id: '1',
          children: [
            {
              text: 'This content is of an unknown type and should not crash the editor.',
            },
          ],
          type: 'unknown-element-type', // This type has no corresponding plugin
        },
      ];

      const editor = createPlateEditor({
        value: initialValueWithUnknownType,
      });

      // This assertion will fail if the bug exists, as render() will throw.
      // If the bug is fixed, render() should not throw.
      expect(() => {
        render(
          <Plate editor={editor}>
            <PlateContent />
          </Plate>
        );
      }).not.toThrow();
    });
  });

  describe('async value', () => {
    it('waits for an async value before rendering and calls onReady', async () => {
      const asyncValue: Value = [
        {
          children: [{ text: 'Async loaded content' }],
          type: 'p',
        },
      ];

      const onReadyMock = mock();

      const AsyncEditor = () => {
        const editor = usePlateEditor({
          value: () =>
            new Promise<Value>((resolve) => {
              setTimeout(() => {
                resolve(asyncValue);
              }, 0);
            }),
          onReady: onReadyMock,
        });

        return (
          <Plate editor={editor}>
            <PlateContent data-testid="plate-content" />
          </Plate>
        );
      };

      const { getByTestId, queryByTestId, rerender } = render(<AsyncEditor />);

      // PlateContent should not be rendered initially (returns null)
      (expect(queryByTestId('plate-content')) as any).not.toBeInTheDocument();
      expect(onReadyMock).not.toHaveBeenCalled();

      // Wait for async value to resolve and trigger a rerender
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
        rerender(<AsyncEditor />);
      });

      // Now PlateContent should be rendered and onReady should have been called
      (expect(getByTestId('plate-content')) as any).toBeInTheDocument();
      expect(onReadyMock).toHaveBeenCalledWith({
        editor: expect.any(Object),
        isAsync: true,
        value: asyncValue,
      });
    });

    it('treats synchronous value functions as ready immediately', () => {
      const syncValue: Value = [
        {
          children: [{ text: 'Sync content' }],
          type: 'p',
        },
      ];

      const onReadyMock = mock();

      const SyncEditor = () => {
        const editor = usePlateEditor({
          value: () => syncValue,
          onReady: onReadyMock,
        });

        return (
          <Plate editor={editor}>
            <PlateContent data-testid="plate-content" />
          </Plate>
        );
      };

      const { getByTestId } = render(<SyncEditor />);

      // PlateContent should be rendered immediately for sync values
      (expect(getByTestId('plate-content')) as any).toBeInTheDocument();
      expect(onReadyMock).toHaveBeenCalledWith({
        editor: expect.any(Object),
        isAsync: false,
        value: syncValue,
      });
    });

    it('calls onReady for static values immediately', () => {
      const staticValue: Value = [
        {
          children: [{ text: 'Static content' }],
          type: 'p',
        },
      ];

      const onReadyMock = mock();

      const StaticEditor = () => {
        const editor = usePlateEditor({
          value: staticValue,
          onReady: onReadyMock,
        });

        return (
          <Plate editor={editor}>
            <PlateContent data-testid="plate-content" />
          </Plate>
        );
      };

      const { getByTestId } = render(<StaticEditor />);

      // PlateContent should be rendered immediately for static values
      (expect(getByTestId('plate-content')) as any).toBeInTheDocument();
      expect(onReadyMock).toHaveBeenCalledWith({
        editor: expect.any(Object),
        isAsync: false,
        value: staticValue,
      });
    });
  });
});
