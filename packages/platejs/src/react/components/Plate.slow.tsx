/// <reference types="@testing-library/jest-dom" />

import { render, renderHook } from '@testing-library/react';
import React from 'react';

import { property, schema, target, type Value } from '../../core';
import { getPlateRuntime } from '../../internal/plugin/compilePlateModel';
import { definePlugin as defineHeadlessPlugin } from '../../lib';
import { TestPlate as EditorRoot } from '../__tests__/TestPlate';
import { useEditorContainerRef } from '../core';
import { createEditor, useCreateEditor } from '../editor';
import type { PlatePlugins } from '../plugin';
import { definePlugin } from '../plugin/definePlugin';
import { ParagraphPlugin } from '../plugins';
import { useOptionalEditor, useEditor, useEditorValue } from '../stores';
import { EditorProvider } from './EditorProvider';
import type { EditorElementProps, EditorLeafProps } from './plate-nodes';
import { EditorContainer } from './PlateContainer';
import { EditorContent } from './PlateContent';
import { EditorController } from './PlateController';

describe('Plate', () => {
  it('resolves the nearest container and clears its ref on unmount', () => {
    const first = createEditor({ id: 'first' });
    const second = createEditor({ id: 'second' });
    const refs = new Map<string, React.RefObject<HTMLDivElement | null>>();
    const Probe = ({ id }: { id?: string }) => {
      const ref = useEditorContainerRef();

      React.useLayoutEffect(() => {
        refs.set(id ?? 'closest', ref);
      }, [id, ref]);

      return null;
    };
    const { getByTestId, unmount } = render(
      <EditorRoot editor={first}>
        <EditorContainer data-testid="first" />
        <Probe id="first" />
        <EditorRoot editor={second}>
          <EditorContainer data-testid="second" />
          <Probe id="second" />
          <Probe />
        </EditorRoot>
      </EditorRoot>
    );

    expect(refs.get('first')?.current).toBe(getByTestId('first'));
    expect(refs.get('second')?.current).toBe(getByTestId('second'));
    expect(refs.get('closest')).toBe(refs.get('second'));
    expect(refs.get('first')).not.toBe(refs.get('second'));

    unmount();

    expect(refs.get('first')?.current).toBeNull();
    expect(refs.get('second')?.current).toBeNull();
  });

  describe('useEditor()', () => {
    describe('when editor is defined', () => {
      it('returns the provided editor', async () => {
        const editor = createEditor();

        const wrapper = ({ children }: any) => (
          <EditorRoot editor={editor}>{children}</EditorRoot>
        );
        const { result } = renderHook(() => useEditor(), { wrapper });

        expect(result.current as any).toBe(editor);
      });
    });

    describe('when editor is not defined', () => {
      it('returns the closest editor from context', async () => {
        const editor1 = createEditor({
          id: 'test1',
        });
        const editor2 = createEditor({
          id: 'test2',
        });

        const wrapper = ({ children }: any) => (
          <EditorRoot editor={editor1}>
            <EditorRoot editor={editor2}>{children}</EditorRoot>
          </EditorRoot>
        );

        const { result } = renderHook(() => useEditor(), { wrapper });

        expect(result.current.id).toBe('test2');
      });
    });
  });

  describe('useEditorValue()', () => {
    describe('when initialValue is defined', () => {
      it('returns the initial value', async () => {
        const initialValue: Value = [
          { children: [{ text: 'test' }], type: 'paragraph' },
        ];
        const editor = createEditor({
          initialValue,
        });

        const wrapper = ({ children }: any) => (
          <EditorRoot editor={editor}>{children}</EditorRoot>
        );
        const { result } = renderHook(() => useEditorValue(), { wrapper });

        expect(result.current).toEqual(initialValue);
      });
    });

    describe('when editor with children is defined', () => {
      it('returns the editor children', async () => {
        const editor = createEditor();
        editor.update.value.replace({
          children: [{ children: [{ text: 'value' }], type: 'paragraph' }],
          selection: null,
        });

        const wrapper = ({ children }: any) => (
          <EditorRoot editor={editor}>{children}</EditorRoot>
        );
        const { result } = renderHook(() => useEditorValue(), { wrapper });

        expect(result.current).toBe(editor.read.children());
      });
    });

    describe('when editor without children is defined', () => {
      it('falls back to the default editor value', async () => {
        const editor = createEditor();

        const wrapper = ({ children }: any) => (
          <EditorRoot editor={editor}>{children}</EditorRoot>
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
      const _plugins = [defineHeadlessPlugin('test', {})];
      const editor = createEditor({
        plugins: _plugins,
      });

      const wrapper = ({ children }: any) => (
        <EditorRoot editor={editor}>{children}</EditorRoot>
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
        const editor = createEditor({
          id: 'test',
        });

        const wrapper = ({ children }: any) => (
          <EditorRoot editor={editor}>{children}</EditorRoot>
        );
        const { result } = renderHook(() => useEditor().id, { wrapper });

        expect(result.current).toBe('test');
      });
    });

    describe('when Plate without id > Plate with id', () => {
      it('returns the closest editor with an id', () => {
        const wrapper = ({ children }: any) => (
          <EditorRoot editor={createEditor()}>
            <EditorRoot
              editor={createEditor({
                id: 'test',
              })}
            >
              {children}
            </EditorRoot>
          </EditorRoot>
        );
        const { result } = renderHook(() => useEditor().id, { wrapper });

        expect(result.current).toBe('test');
      });
    });
  });

  it('provides an explicit editor to controls under another Plate', () => {
    const outer = createEditor();
    const inner = createEditor();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <EditorRoot editor={inner}>
        <EditorProvider editor={outer}>{children}</EditorProvider>
      </EditorRoot>
    );
    expect(renderHook(() => useEditor(), { wrapper }).result.current).toBe(
      outer
    );
  });

  it('returns null from optional controls until a controller has a mounted target', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <EditorController>{children}</EditorController>
    );
    expect(
      renderHook(() => useOptionalEditor(), { wrapper }).result.current
    ).toBeNull();
    expect(() => renderHook(() => useEditor(), { wrapper })).toThrow(
      'useEditor() requires an active Plate editor.'
    );
  });

  describe('when editor normalization is disabled', () => {
    it('does not normalize on mount', () => {
      const fn = mock();

      const plugins = [
        defineHeadlessPlugin('a', {
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

      const editor = createEditor({
        plugins,
        initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
      });

      render(
        <EditorRoot editor={editor}>
          <EditorContent />
        </EditorRoot>
      );

      expect(fn).not.toHaveBeenCalled();

      expect(editor.read.children()).not.toStrictEqual([
        { children: [{ text: '' }], path: [0], type: 'paragraph' },
      ]);
    });
  });
  describe('when slots.wrapRoot renders null', () => {
    it('renders without normalizing editor children', () => {
      const plugins: PlatePlugins = [
        definePlugin('a', {
          slots: {
            wrapRoot: () => null,
          },
        }),
      ];

      const editor = createEditor({
        plugins,
        initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
      });

      expect(() =>
        render(
          <EditorRoot editor={editor}>
            <EditorContent />
          </EditorRoot>
        )
      ).not.toThrow();
    });
  });

  describe('Plate remounting', () => {
    it('remounts when useCreateEditor recreates the editor', () => {
      let mountCount = 0;

      const MountCounter = () => {
        React.useEffect(() => {
          mountCount += 1;
        }, []);

        return null;
      };

      const TestComponent = ({ dep }: { dep: number }) => {
        const editor = useCreateEditor(
          {
            id: 'test',
          },
          [dep]
        );

        return (
          <EditorRoot editor={editor}>
            <EditorContent />
            <MountCounter />
          </EditorRoot>
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
    }: EditorElementProps<typeof ParagraphPlugin>) => (
      <p {...attributes} data-testid="paragraph">
        {children}
      </p>
    );

    const BoldPlugin = definePlugin('bold', {
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
    }: EditorLeafProps<typeof BoldPlugin>) => (
      <strong {...attributes} data-testid="bold">
        {children}
      </strong>
    );

    const ParagraphAttributesPlugin = defineHeadlessPlugin(
      'paragraphAttributes',
      {
        targetPlugins: [ParagraphPlugin],
        schema: ({ targetElementTypes }) => ({
          properties: {
            attributes: schema.elementProperty(property.json(), {
              target: target.types(targetElementTypes),
            }),
          },
        }),
      }
    );

    const getParagraphPlugin = (projectAttributes: boolean) =>
      ParagraphPlugin.configure({
        component: ParagraphElement,
        render: {
          attributes: projectAttributes
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
          attributes: projectAttributes
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
      const editor = useCreateEditor({
        plugins: [
          getParagraphPlugin(projectAttributes),
          ParagraphAttributesPlugin,
          getBoldPlugin(projectAttributes),
        ],
        initialValue,
      });

      return (
        <EditorRoot editor={editor}>
          <EditorContent />
        </EditorRoot>
      );
    };

    it('renders no user-defined attributes by default', () => {
      const { getByTestId } = render(<Editor projectAttributes={false} />);

      const paragraphEl = getByTestId('paragraph');
      expect(Object.keys(paragraphEl.dataset)).toEqual([
        'editorNode',
        'testid',
        'editorPath',
        'editorNodeKey',
      ]);

      const boldEl = getByTestId('bold');
      expect(Object.keys(boldEl.dataset)).toEqual(['testid']);
    });

    it('renders explicitly projected user-defined attributes', () => {
      const { getByTestId } = render(<Editor projectAttributes />);

      const paragraphEl = getByTestId('paragraph');
      expect(Object.keys(paragraphEl.dataset)).toEqual([
        'editorNode',
        'myParagraphAttribute',
        'testid',
        'editorPath',
        'editorNodeKey',
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

      const UnknownElementSchemaPlugin = defineHeadlessPlugin(
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

      const editor = createEditor({
        plugins: [UnknownElementSchemaPlugin],
        initialValue: initialValueWithUnknownType,
      });

      const { getByText } = render(
        <EditorRoot editor={editor}>
          <EditorContent />
        </EditorRoot>
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

      const InitialValuePlugin = definePlugin('initialValue', {
        api: () => ({
          decode: () => syncValue,
        }),
      });

      const SyncEditor = () => {
        const editor = useCreateEditor({
          plugins: [InitialValuePlugin],
          initialValue: ({ editor: innerEditor }) =>
            innerEditor.plugin(InitialValuePlugin).api.decode(),
        });

        return (
          <EditorRoot editor={editor}>
            <EditorContent data-testid="plate-content" />
          </EditorRoot>
        );
      };

      const { getByTestId } = render(<SyncEditor />);

      expect(getByTestId('plate-content')).toHaveTextContent('Sync content');
    });
  });
});
