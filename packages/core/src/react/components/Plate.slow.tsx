/// <reference types="@testing-library/jest-dom" />

import { property, schema, target, type Value } from '@platejs/plite';
import { render, renderHook } from '@testing-library/react';
import { useAtomStoreValue } from 'jotai-x';
import React from 'react';

import { getPlateRuntime } from '../../internal/plugin/compilePlateModel';
import { defineBasePlugin } from '../../lib';
import { TestPlate as Plate } from '../__tests__/TestPlate';
import { createPlateEditor, usePlateEditor } from '../editor';
import type { PlatePlugins } from '../plugin';
import { definePlatePlugin } from '../plugin/definePlatePlugin';
import { ParagraphPlugin } from '../plugins';
import {
  PlateController,
  useActiveEditor,
  useEditor,
  useEditorValue,
  usePlateStore,
} from '../stores';
import type { PlateElementProps, PlateLeafProps } from './plate-nodes';
import { PlateContent } from './PlateContent';

describe('Plate', () => {
  describe('useEditor()', () => {
    describe('when editor is defined', () => {
      it('returns the provided editor', async () => {
        const editor = createPlateEditor();

        const wrapper = ({ children }: any) => (
          <Plate editor={editor}>{children}</Plate>
        );
        const { result } = renderHook(() => useEditor(), { wrapper });

        expect(result.current as any).toBe(editor);
      });
    });

    describe('when editor is not defined', () => {
      it('returns the closest editor from context', async () => {
        const editor1 = createPlateEditor({
          id: 'test1',
        });
        const editor2 = createPlateEditor({
          id: 'test2',
        });

        const wrapper = ({ children }: any) => (
          <Plate editor={editor1}>
            <Plate editor={editor2}>{children}</Plate>
          </Plate>
        );

        const { result } = renderHook(() => useEditor(), { wrapper });

        expect(result.current.id).toBe('test2');
      });
    });

    describe('when id is defined', () => {
      it('selects the editor by id', async () => {
        const editor1 = createPlateEditor({
          id: 'test1',
        });
        const editor2 = createPlateEditor({
          id: 'test2',
        });

        const wrapper = ({ children }: any) => (
          <Plate editor={editor1}>
            <Plate editor={editor2}>{children}</Plate>
          </Plate>
        );

        const { result: result1 } = renderHook(
          () => useEditor({ id: 'test1' }),
          { wrapper }
        );
        const { result: result2 } = renderHook(
          () => useEditor({ id: 'test2' }),
          { wrapper }
        );

        expect(result1.current.id).toBe('test1');
        expect(result2.current.id).toBe('test2');
      });
    });
  });

  describe('useEditorValue()', () => {
    describe('when initialValue is defined', () => {
      it('returns the initial value', async () => {
        const initialValue: Value = [
          { children: [{ text: 'test' }], type: 'paragraph' },
        ];
        const editor = createPlateEditor({
          initialValue,
        });

        const wrapper = ({ children }: any) => (
          <Plate editor={editor}>{children}</Plate>
        );
        const { result } = renderHook(() => useEditorValue(), { wrapper });

        expect(result.current).toEqual(initialValue);
      });
    });

    describe('when editor with children is defined', () => {
      it('returns the editor children', async () => {
        const editor = createPlateEditor();
        editor.update.value.replace({
          children: [{ children: [{ text: 'value' }], type: 'paragraph' }],
          selection: null,
        });

        const wrapper = ({ children }: any) => (
          <Plate editor={editor}>{children}</Plate>
        );
        const { result } = renderHook(() => useEditorValue(), { wrapper });

        expect(result.current).toBe(editor.read.children());
      });
    });

    describe('when editor without children is defined', () => {
      it('falls back to the default editor value', async () => {
        const editor = createPlateEditor();

        const wrapper = ({ children }: any) => (
          <Plate editor={editor}>{children}</Plate>
        );
        const { result } = renderHook(() => useEditorValue(), { wrapper });

        expect(result.current).toEqual([
          { children: [{ text: '' }], type: 'paragraph' },
        ]);
      });
    });
  });

  describe('useEditor().plugins', () => {
    it('uses the plugins already attached to the editor', () => {
      const _plugins = [defineBasePlugin('test', {})];
      const editor = createPlateEditor({
        plugins: _plugins,
      });

      const wrapper = ({ children }: any) => (
        <Plate editor={editor}>{children}</Plate>
      );

      const { result } = renderHook(
        () => getPlateRuntime(useEditor()).pluginList,
        { wrapper }
      );

      expect(result.current.some((plugin: any) => plugin.name === 'test')).toBe(
        true
      );
    });
  });

  describe('useEditor().id', () => {
    describe('when Plate has an id', () => {
      it('returns the editor id', async () => {
        const editor = createPlateEditor({
          id: 'test',
        });

        const wrapper = ({ children }: any) => (
          <Plate editor={editor}>{children}</Plate>
        );
        const { result } = renderHook(() => useEditor().id, { wrapper });

        expect(result.current).toBe('test');
      });
    });

    describe('when Plate without id > Plate with id', () => {
      it('returns the closest editor with an id', () => {
        const wrapper = ({ children }: any) => (
          <Plate editor={createPlateEditor()}>
            <Plate
              editor={createPlateEditor({
                id: 'test',
              })}
            >
              {children}
            </Plate>
          </Plate>
        );
        const { result } = renderHook(() => useEditor().id, { wrapper });

        expect(result.current).toBe('test');
      });
    });

    describe('when Plate with id > Plate without id > select id', () => {
      it('returns the requested editor id from context', () => {
        const wrapper = ({ children }: any) => (
          <Plate
            editor={createPlateEditor({
              id: 'test',
            })}
          >
            <Plate editor={createPlateEditor()}>{children}</Plate>
          </Plate>
        );
        const { result } = renderHook(() => useEditor({ id: 'test' }).id, {
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

    const getActiveEditor = (wrapper: any) =>
      renderHook(() => useActiveEditor(), { wrapper }).result.current;

    describe('when Plate exists', () => {
      describe('when editor is defined', () => {
        it('returns the store', async () => {
          const editor = createPlateEditor({
            id: 'test',
          });

          const wrapper = ({ children }: any) => (
            <Plate editor={editor}>{children}</Plate>
          );
          expect(getStore(wrapper)).toBeDefined();
          expect(getId(wrapper)).toBe('test');
          expect(getActiveEditor(wrapper)).toBe(editor);
        });

        it('prefers the closest Plate store over PlateController state', () => {
          const EXPECTED_STORE = 'controller store' as any;
          const editor = createPlateEditor({
            id: 'local',
          });

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
          expect(getActiveEditor(wrapper)).toBe(editor);
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
            expect(getActiveEditor(wrapper)).toBeNull();
            expect(() => renderHook(() => useEditor(), { wrapper })).toThrow(
              'useEditor() requires an active Plate editor.'
            );
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
      const fn = mock();

      const plugins = [
        defineBasePlugin('a', {
          corrections: [
            {
              event: 'content',
              correct({ entry, tx }) {
                const [node, path] = entry;

                if (path.length && node.path !== path) {
                  fn();
                  tx.nodes.set({ path }, { at: path });
                }
              },
            },
          ],
        }),
      ];

      const editor = createPlateEditor({
        plugins,
        initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
      });

      render(
        <Plate editor={editor}>
          <PlateContent />
        </Plate>
      );

      expect(fn).not.toHaveBeenCalled();

      expect(editor.read.children()).not.toStrictEqual([
        { children: [{ text: '' }], path: [0], type: 'paragraph' },
      ]);
    });
  });
  describe('when render abovePlite renders null', () => {
    it('renders without normalizing editor children', () => {
      const plugins: PlatePlugins = [
        definePlatePlugin('a', {
          render: {
            abovePlite: () => null,
          },
        }),
      ];

      const editor = createPlateEditor({
        plugins,
        initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
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
    it('remounts when usePlateEditor recreates the editor', () => {
      let mountCount = 0;

      const MountCounter = () => {
        React.useEffect(() => {
          mountCount += 1;
        }, []);

        return null;
      };

      const TestComponent = ({ dep }: { dep: number }) => {
        const editor = usePlateEditor(
          {
            id: 'test',
          },
          [dep]
        );

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
    const ParagraphElement = ({
      attributes,
      children,
    }: PlateElementProps<typeof ParagraphPlugin>) => (
      <p {...attributes} data-testid="paragraph">
        {children}
      </p>
    );

    const BoldPlugin = definePlatePlugin('bold', {
      schema: {
        mark: property.boolean({ default: false, omitDefault: true }),
        properties: {
          attributes: schema.textProperty(property.json()),
        },
      },
    });

    const BoldLeaf = ({
      attributes,
      children,
    }: PlateLeafProps<typeof BoldPlugin>) => (
      <strong {...attributes} data-testid="bold">
        {children}
      </strong>
    );

    const ParagraphAttributesPlugin = defineBasePlugin('paragraphAttributes', {
      targetPlugins: [ParagraphPlugin],
      schema: ({ targetElementTypes }) => ({
        properties: {
          attributes: schema.elementProperty(property.json(), {
            target: target.types(targetElementTypes),
          }),
        },
      }),
    });

    const getParagraphPlugin = (projectAttributes: boolean) =>
      ParagraphPlugin.configure({
        component: ParagraphElement,
        render: {
          nodeProps: projectAttributes
            ? ({ element }) => {
                const value =
                  typeof element.attributes === 'object' &&
                  element.attributes !== null &&
                  !Array.isArray(element.attributes)
                    ? Reflect.get(
                        element.attributes,
                        'data-my-paragraph-attribute'
                      )
                    : undefined;

                return typeof value === 'string'
                  ? { 'data-my-paragraph-attribute': value }
                  : {};
              }
            : undefined,
        },
      });

    const getBoldPlugin = (projectAttributes: boolean) =>
      BoldPlugin.configure({
        component: BoldLeaf,
        render: {
          nodeProps: projectAttributes
            ? ({ text }) => {
                const value =
                  typeof text.attributes === 'object' &&
                  text.attributes !== null &&
                  !Array.isArray(text.attributes)
                    ? Reflect.get(text.attributes, 'data-my-bold-attribute')
                    : undefined;

                return typeof value === 'string'
                  ? { 'data-my-bold-attribute': value }
                  : {};
              }
            : undefined,
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
        type: 'paragraph',
      },
    ];

    const Editor = ({ projectAttributes }: { projectAttributes: boolean }) => {
      const editor = usePlateEditor({
        plugins: [
          getParagraphPlugin(projectAttributes),
          ParagraphAttributesPlugin,
          getBoldPlugin(projectAttributes),
        ],
        initialValue,
      });

      return (
        <Plate editor={editor}>
          <PlateContent />
        </Plate>
      );
    };

    it('renders no user-defined attributes by default', () => {
      const { getByTestId } = render(<Editor projectAttributes={false} />);

      const paragraphEl = getByTestId('paragraph');
      expect(Object.keys(paragraphEl.dataset)).toEqual([
        'pliteNode',
        'testid',
        'plitePath',
        'pliteNodeKey',
      ]);

      const boldEl = getByTestId('bold');
      expect(Object.keys(boldEl.dataset)).toEqual(['testid']);
    });

    it('renders explicitly projected user-defined attributes', () => {
      const { getByTestId } = render(<Editor projectAttributes />);

      const paragraphEl = getByTestId('paragraph');
      expect(Object.keys(paragraphEl.dataset)).toEqual([
        'pliteNode',
        'myParagraphAttribute',
        'testid',
        'plitePath',
        'pliteNodeKey',
      ]);

      const boldEl = getByTestId('bold');
      expect(Object.keys(boldEl.dataset)).toEqual([
        'myBoldAttribute',
        'testid',
      ]);
    });
  });

  describe('when rendering unknown element type', () => {
    it('uses the renderer fallback for a schema-declared element type', () => {
      const initialValueWithUnknownType: Value = [
        {
          children: [
            {
              text: 'This content is of an unknown type and should not crash the editor.',
            },
          ],
          type: 'unknown-element-type',
        },
      ];

      const UnknownElementSchemaPlugin = defineBasePlugin(
        'unknownElementSchema',
        {
          schema: {
            element: {
              content: schema.content.open({ default: 'text', min: 1 }),
              type: 'unknown-element-type',
            },
          },
        }
      );

      const editor = createPlateEditor({
        plugins: [UnknownElementSchemaPlugin],
        initialValue: initialValueWithUnknownType,
      });

      const { getByText } = render(
        <Plate editor={editor}>
          <PlateContent />
        </Plate>
      );

      expect(
        getByText(
          'This content is of an unknown type and should not crash the editor.'
        )
      ).toBeInTheDocument();
    });
  });

  describe('initialValue', () => {
    it('runs a contextual initializer after plugins are compiled', () => {
      const syncValue: Value = [
        {
          children: [{ text: 'Sync content' }],
          type: 'paragraph',
        },
      ];

      const InitialValuePlugin = definePlatePlugin('initialValue', {
        api: () => ({
          decode: () => syncValue,
        }),
      });

      const SyncEditor = () => {
        const editor = usePlateEditor({
          plugins: [InitialValuePlugin],
          initialValue: ({ editor: innerEditor }) =>
            innerEditor.plugin(InitialValuePlugin).api.decode(),
        });

        return (
          <Plate editor={editor}>
            <PlateContent data-testid="plate-content" />
          </Plate>
        );
      };

      const { getByTestId } = render(<SyncEditor />);

      expect(getByTestId('plate-content')).toHaveTextContent('Sync content');
    });
  });
});
