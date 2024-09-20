import React from 'react';

import { render } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import {
  type PlateRenderElementProps,
  createPlateEditor,
  createPluginFactory,
  useEditorRef,
  usePlateSelectors,
} from '@udecode/plate-common';

import type { PlateRenderLeafProps } from '../../shared';

import { PlateController, usePlateEditorStore } from '../stores';
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
        const wrapper = ({ children }: any) => (
          <Plate id="test1">
            <Plate id="test2">{children}</Plate>
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
        const wrapper = ({ children }: any) => (
          <Plate id="test1">
            <Plate id="test2">{children}</Plate>
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

  describe('usePlateSelectors().value()', () => {
    describe('when initialValue is defined', () => {
      it('should be initialValue', async () => {
        const initialValue = [{ children: [{ text: 'test' }], type: 'p' }];

        const wrapper = ({ children }: any) => (
          <Plate initialValue={initialValue}>{children}</Plate>
        );
        const { result } = renderHook(() => usePlateSelectors().value(), {
          wrapper,
        });

        expect(result.current).toBe(initialValue);
      });
    });

    describe('when value is defined', () => {
      it('should be value', async () => {
        const value = [{ children: [{ text: 'value' }], type: 'p' }];

        const wrapper = ({ children }: any) => (
          <Plate value={value}>{children}</Plate>
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
        editor.children = [{ children: [{ text: 'value' }], type: 'p' }];

        const wrapper = ({ children }: any) => (
          <Plate editor={editor}>{children}</Plate>
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
          <Plate editor={editor}>{children}</Plate>
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
          <Plate plugins={plugins}>{children}</Plate>
        );
        const { rerender, result } = renderHook(
          () => usePlateSelectors().plugins(),
          {
            initialProps: { plugins: _plugins },
            wrapper,
          }
        );

        expect(result.current.at(-1)!.key).toBe('test');

        rerender({ plugins: [{ key: 'test2' }] });

        expect(result.current.at(-1)!.key).toBe('test2');
      });
    });

    it('should use plugins from editor', () => {
      const _plugins = [{ key: 'test' }];
      const editor = createPlateEditor({ plugins: _plugins });

      const wrapper = ({ children }: any) => (
        <Plate editor={editor}>{children}</Plate>
      );

      const { rerender, result } = renderHook(
        () => usePlateSelectors().plugins(),
        {
          wrapper,
        }
      );

      expect(result.current.some((p: any) => p.key === 'test')).toBe(true);

      rerender();

      expect(result.current.some((p: any) => p.key === 'test')).toBe(true);
    });
  });

  describe('when id updates', () => {
    it('should remount Plate', () => {
      const _plugins = [{ key: 'test1' }];

      const wrapper = ({ children, id }: any) => (
        <Plate id={id} plugins={id === '1' ? _plugins : undefined}>
          {children}
        </Plate>
      );
      const { rerender, result } = renderHook(
        ({ id }) => usePlateSelectors(id).plugins(),
        {
          initialProps: { id: '1' },
          wrapper,
        }
      );

      expect(result.current.at(-1)!.key).toBe('test1');

      rerender({ id: '2' });

      expect(result.current.at(-1)!.key).not.toBe('test1');
    });
  });

  describe('usePlateSelectors().id()', () => {
    describe('when Plate has an id', () => {
      it('should be that id', () => {
        const wrapper = ({ children }: any) => (
          <Plate id="test">{children}</Plate>
        );
        const { result } = renderHook(() => usePlateSelectors().id(), {
          wrapper,
        });

        expect(result.current).toBe('test');
      });
    });

    describe('when Plate without id > Plate with id', () => {
      it('should be the closest one', () => {
        const wrapper = ({ children }: any) => (
          <Plate>
            <Plate id="test">{children}</Plate>
          </Plate>
        );
        const { result } = renderHook(() => usePlateSelectors().id(), {
          wrapper,
        });

        expect(result.current).toBe('test');
      });
    });

    describe('when Plate with id > Plate without id > select id', () => {
      it('should be that id', () => {
        const wrapper = ({ children }: any) => (
          <Plate id="test">
            <Plate>{children}</Plate>
          </Plate>
        );
        const { result } = renderHook(() => usePlateSelectors('test').id(), {
          wrapper,
        });

        expect(result.current).toBe('test');
      });
    });

    describe('when Plate has an editor', () => {
      it('should be editor id', async () => {
        const editor = createPlateEditor({ id: 'test' });

        const wrapper = ({ children }: any) => (
          <Plate editor={editor}>{children}</Plate>
        );
        const { result } = renderHook(() => usePlateSelectors().id(), {
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
      renderHook(() => usePlateSelectors().id(), { wrapper }).result.current;

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
        it('returns the store', () => {
          const wrapper = ({ children }: any) => (
            <Plate id="test">{children}</Plate>
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

  describe('User-defined attributes', () => {
    const ParagraphElement = ({
      attributes,
      children,
      nodeProps,
    }: PlateRenderElementProps) => (
      <p {...attributes} {...nodeProps} data-testid="paragraph">
        {children}
      </p>
    );

    const BoldLeaf = ({
      attributes,
      children,
      nodeProps,
    }: PlateRenderLeafProps) => (
      <strong {...attributes} {...nodeProps} data-testid="bold">
        {children}
      </strong>
    );

    const getParagraphPlugin = (dangerouslyAllowAttributes: boolean) =>
      createPluginFactory({
        component: ParagraphElement,
        dangerouslyAllowAttributes: dangerouslyAllowAttributes
          ? ['data-my-paragraph-attribute']
          : undefined,
        isElement: true,
        key: 'p',
      });

    const getBoldPlugin = (dangerouslyAllowAttributes: boolean) =>
      createPluginFactory({
        component: BoldLeaf,
        dangerouslyAllowAttributes: dangerouslyAllowAttributes
          ? ['data-my-bold-attribute']
          : undefined,
        isLeaf: true,
        key: 'bold',
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
      const plugins = [
        getParagraphPlugin(dangerouslyAllowAttributes)(),
        getBoldPlugin(dangerouslyAllowAttributes)(),
      ];

      return (
        <Plate initialValue={initialValue} plugins={plugins}>
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
      expect(Object.keys(boldEl.dataset)).toEqual(['slateLeaf', 'testid']);
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
        'slateLeaf',
        'myBoldAttribute',
        'testid',
      ]);
    });
  });
});
