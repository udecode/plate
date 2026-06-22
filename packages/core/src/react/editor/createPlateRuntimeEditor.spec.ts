import React from 'react';
import type {
  EditorUpdateTransaction,
  Element as SlateElement,
  Path,
  Value,
} from '@platejs/slate';
import {
  Slate,
  useEditor,
  useEditorReadOnly,
  useEditorState,
} from '@platejs/slate-react';
import { act, fireEvent, render, waitFor } from '@testing-library/react';
import * as reactHotkeysModule from '@udecode/react-hotkeys';

import { createSlatePlugin } from '../../lib/plugin/createSlatePlugin';
import { AffinityPlugin } from '../../lib/plugins/affinity/AffinityPlugin';
import { ChunkingPlugin } from '../../lib/plugins/chunking/ChunkingPlugin';
import { DebugPlugin } from '../../lib/plugins/debug/DebugPlugin';
import { DOMPlugin } from '../../lib/plugins/dom/DOMPlugin';
import { HistoryPlugin } from '../../lib/plugins/HistoryPlugin';
import { HtmlPlugin } from '../../lib/plugins/html/HtmlPlugin';
import { InputRulesPlugin } from '../../lib/plugins/input-rules/internal/InputRulesPlugin';
import { LengthPlugin } from '../../lib/plugins/length/LengthPlugin';
import { NodeIdPlugin } from '../../lib/plugins/node-id/NodeIdPlugin';
import { BaseParagraphPlugin } from '../../lib/plugins/paragraph/BaseParagraphPlugin';
import { ParserPlugin } from '../../lib/plugins/ParserPlugin';
import {
  withBreakRules,
  withDeleteRules,
  withMergeRules,
  withNormalizeRules,
  withOverrides,
} from '../../lib/plugins/override';
import { SlateExtensionPlugin } from '../../lib/plugins/slate-extension/SlateExtensionPlugin';
import { NavigationFeedbackPlugin } from '../plugins/navigation-feedback/NavigationFeedbackPlugin';
import { ReactPlugin } from '../plugins/react/ReactPlugin';
import { SlateReactExtensionPlugin } from '../plugins/SlateReactExtensionPlugin';
import {
  createPlateRuntimeEditor,
  isPlateRuntimeEditor,
  type PlateRuntimeEditor,
  PlateRuntimeContent,
  PlateRuntimeEditable,
  PlateRuntimeSlate,
} from './createPlateRuntimeEditor';
import { usePlateEditor } from './usePlateEditor';
import { createPlateEditor } from './withPlate';

describe('createPlateRuntimeEditor', () => {
  const value: Value = [{ children: [{ text: 'runtime' }], type: 'p' }];
  const createIdFactory = (start = 1) => {
    let id = start;

    return () => `id-${id++}`;
  };

  type TxPluginTransforms = {
    txPlugin: {
      replace: () => void;
    };
  };

  type TransformPluginTransforms = {
    transform: {
      replace: () => void;
    };
  };

  type RuntimeDomTransforms = {
    withScrolling: (
      fn: () => void,
      options?: {
        operations?: { insert_text?: boolean };
      }
    ) => void;
  };

  type NodeIdRuntimeTransforms = {
    nodeId: {
      normalize: () => void;
    };
  };

  type ExtendedRuntimePlugin = {
    parsers: {
      html: {
        deserializer: {
          parse: () => { type: string | undefined };
        };
      };
    };
    options: {
      count: number;
    };
  };

  type NavigationRuntimeApi = {
    navigation: {
      activeTarget: () => {
        cycle: 0 | 1;
        duration: number;
        path: number[];
        pulse: number;
        type: 'node';
        variant: string;
      } | null;
      clear: () => void;
      isTarget: (path: number[]) => boolean;
    };
  };

  type NavigationRuntimeTransforms = {
    navigation: {
      clear: () => void;
      flashTarget: (options: {
        duration?: number;
        target: { path: number[]; type: 'node' };
        variant?: string;
      }) => boolean;
      navigate: (options: {
        flash?: false | { duration?: number; variant?: string };
        focus?: boolean;
        scroll?: boolean;
        select?: {
          anchor: { offset: number; path: number[] };
          focus: { offset: number; path: number[] };
        };
        target: { path: number[]; type: 'node' };
      }) => boolean;
    };
  };

  const createRuntimeBlockquotePlugin = () =>
    createSlatePlugin({
      key: 'blockquote',
      node: { isElement: true, type: 'blockquote' },
    }).overrideEditor(({ tf: { normalizeNode, tab } }) => ({
      transforms: { normalizeNode, tab },
    }));

  const createRuntimeCaptionPlugin = () =>
    createSlatePlugin({
      key: 'caption',
      options: {
        focusEndPath: null,
        focusStartPath: null,
        query: { allow: ['media'] },
        visibleId: null,
      },
    }).overrideEditor(({ tf: { apply, moveLine } }) => ({
      transforms: { apply, moveLine },
    }));

  const createRuntimeMultiSelectPlugin = () =>
    createSlatePlugin({
      key: 'tag',
      node: {
        isElement: true,
        isInline: true,
        isVoid: true,
        type: 'tag',
      },
    }).overrideEditor(
      ({ api: { onChange }, tf: { deleteBackward, normalizeNode } }) => ({
        api: { onChange },
        transforms: { deleteBackward, normalizeNode },
      })
    );

  const MediaPlugin = createSlatePlugin({
    key: 'media',
    node: { isElement: true, type: 'media' },
  });

  it('creates a Slate v2 React editor with Plate runtime identity state', () => {
    const editor = createPlateRuntimeEditor({
      id: 'plate-runtime',
      initialValue: value,
      readOnly: true,
      uid: 'uid-runtime',
      userId: 'user-runtime',
    });

    expect(editor.id).toBe('plate-runtime');
    expect(editor.meta.key).toBeDefined();
    expect(editor.meta.uid).toBe('uid-runtime');
    expect(editor.meta.userId).toBe('user-runtime');
    expect(editor.meta.isFallback).toBe(false);
    expect(editor.dom).toEqual({
      composing: false,
      currentKeyboardEvent: null,
      focused: false,
      prevSelection: null,
      readOnly: true,
    });
    expect(editor.plugins).toEqual({});

    expect(typeof editor.read).toBe('function');
    expect(typeof editor.update).toBe('function');
    expect(typeof editor.subscribeCommit).toBe('function');
    expect(editor.api.react).toBeDefined();
    expect(editor.read((state) => state.value.root())).toEqual(value);
  });

  it('routes ChunkingPlugin getChunkSize through the v2 runtime', () => {
    const editor = createPlateRuntimeEditor({
      initialValue: value,
      plugins: [ChunkingPlugin],
    });

    expect(editor.getChunkSize?.(editor)).toBe(1000);
    expect(
      editor.getChunkSize?.({
        children: [{ text: 'hello' }],
        type: 'p',
      })
    ).toBeNull();
  });

  it('routes configured ChunkingPlugin query through the v2 runtime', () => {
    let editor: PlateRuntimeEditor;
    const query = mock((ancestor: unknown) => ancestor === editor);

    editor = createPlateRuntimeEditor({
      initialValue: value,
      plugins: [
        ChunkingPlugin.configure({
          options: {
            chunkSize: 48,
            query,
          },
        }),
      ],
    });

    expect(editor.getChunkSize?.(editor)).toBe(48);
    expect(
      editor.getChunkSize?.({
        children: [{ text: 'hello' }],
        type: 'p',
      })
    ).toBeNull();
    expect(query).toHaveBeenCalledTimes(2);
  });

  it('routes NodeIdPlugin insert-node ID policy through the v2 runtime', () => {
    const editor = createPlateRuntimeEditor({
      initialValue: [
        { children: [{ text: 'existing' }], id: 'taken', type: 'p' },
      ],
      plugins: [
        NodeIdPlugin.configure({
          options: {
            idCreator: createIdFactory(),
            initialValueIds: false,
          },
        }),
      ],
    });

    editor.update((tx) => {
      tx.nodes.insert(
        { children: [{ text: 'duplicate' }], id: 'taken', type: 'p' },
        { at: [1] }
      );
      tx.nodes.insert(
        { children: [{ text: 'unique' }], id: 'unique', type: 'p' },
        { at: [2] }
      );
      tx.nodes.insert(
        { children: [{ text: 'missing' }], type: 'p' },
        { at: [3] }
      );
    });

    const ids = editor
      .read((state) => state.value.root())
      .map((node) => (node as { id?: string }).id);

    expect(ids).toEqual(['taken', 'id-1', 'unique', 'id-2']);
  });

  it('routes NodeIdPlugin inserted-node override IDs through the v2 runtime', () => {
    const editor = createPlateRuntimeEditor({
      initialValue: [
        { children: [{ text: 'existing' }], id: 'taken', type: 'p' },
      ],
      plugins: [
        NodeIdPlugin.configure({
          options: {
            idCreator: createIdFactory(),
            initialValueIds: false,
          },
        }),
      ],
    });

    editor.update((tx) => {
      tx.nodes.insert(
        { children: [{ text: 'override' }], id: 'safe', type: 'p' },
        { at: [1] }
      );
    });

    const inserted = editor.read((state) => state.value.root())[1] as {
      _id?: unknown;
      id?: string;
    };

    expect(inserted.id).toBe('safe');
    expect(inserted._id).toBeUndefined();
  });

  it('routes NodeIdPlugin split-node ID policy through the v2 runtime', () => {
    const editor = createPlateRuntimeEditor({
      initialValue: [
        { children: [{ text: 'one' }], id: 'split-id', type: 'p' },
      ],
      plugins: [
        NodeIdPlugin.configure({
          options: {
            idCreator: createIdFactory(),
            initialValueIds: false,
            reuseId: true,
          },
        }),
      ],
    });

    editor.update((tx) => {
      tx.nodes.split({ at: [0], position: 1 });
    });

    const ids = editor
      .read((state) => state.value.root())
      .map((node) => (node as { id?: string }).id);

    expect(ids).toEqual(['split-id', 'id-1']);
  });

  it('routes NodeIdPlugin normalize transform through the v2 runtime without history', () => {
    const editor = createPlateRuntimeEditor({
      initialValue: [
        { children: [{ text: 'missing' }], type: 'p' },
        {
          children: [{ children: [{ text: 'nested' }], type: 'p' }],
          type: 'blockquote',
        },
      ],
      plugins: [
        HistoryPlugin,
        NodeIdPlugin.configure({
          options: {
            idCreator: createIdFactory(),
            initialValueIds: false,
          },
        }),
      ],
    });

    editor
      .getTransforms<NodeIdRuntimeTransforms>(NodeIdPlugin)
      .nodeId.normalize();

    const root = editor.read((state) => state.value.root()) as Array<{
      children: Array<{ id?: string; text?: string; type?: string }>;
      id?: string;
      type: string;
    }>;

    expect(root[0].id).toBe('id-1');
    expect(root[0].children[0]).toEqual({ text: 'missing' });
    expect(root[1].id).toBe('id-2');
    expect(root[1].children[0].id).toBe('id-3');
    expect(editor.read((state) => state.history.undos())).toEqual([]);
  });

  it('routes createPlateEditor opt-in through the v2 runtime', () => {
    const editor = createPlateEditor({
      runtime: 'slate-v2',
      nodeId: {
        idCreator: createIdFactory(),
        initialValueIds: false,
      },
      value: [{ children: [{ text: 'existing' }], id: 'taken', type: 'p' }],
    });

    expect(isPlateRuntimeEditor(editor)).toBe(true);
    expect(editor.api.react).toBeDefined();
    expect(editor.plugins.dom).toBeDefined();
    expect(editor.plugins.nodeId).toBeDefined();
    expect(editor.plugins.slateExtension).toBeDefined();

    editor.update((tx) => {
      tx.nodes.insert(
        { children: [{ text: 'duplicate' }], id: 'taken', type: 'p' },
        { at: [1] }
      );
    });

    const ids = editor
      .read((state) => state.value.root())
      .map((node) => (node as { id?: string }).id);

    expect(ids).toEqual(['taken', 'id-1']);
  });

  it('routes createPlateEditor slate-v2 root initialization options', () => {
    const onReady = mock();
    const editor = createPlateEditor({
      autoSelect: 'end',
      onReady,
      runtime: 'slate-v2',
      shouldNormalizeEditor: true,
      transformInitialValue: ({ value: initialValue }) =>
        initialValue.map((node) => ({
          ...node,
          initialized: true,
        })),
      value: [{ children: [{ text: 'ready' }], type: 'p' }],
    });

    const nextValue = [
      { children: [{ text: 'ready' }], initialized: true, type: 'p' },
    ];

    expect(isPlateRuntimeEditor(editor)).toBe(true);
    expect(editor.read((state) => state.value.root())).toEqual(nextValue);
    expect(editor.read((state) => state.selection.get())).toEqual({
      anchor: { offset: 5, path: [0, 0] },
      focus: { offset: 5, path: [0, 0] },
    });
    expect(onReady).toHaveBeenCalledWith({
      editor,
      isAsync: false,
      value: nextValue,
    });
  });

  it('composes createPlateEditor slate-v2 root, plugin, and editable decorations', async () => {
    const decorateStart = (path: Path) => ({
      anchor: { offset: 0, path },
      focus: { offset: 3, path },
    });
    const RuntimePlugin = createSlatePlugin({
      key: 'runtimeDecorate',
      decorate: ({ entry, plugin }) => {
        const [node, path] = entry;

        if (!('text' in node)) return [];

        return [
          {
            ...decorateStart(path),
            pluginDecorated: plugin.key,
          },
        ];
      },
    });
    const editor = createPlateEditor({
      decorate: ({ entry }) => {
        const [node, path] = entry;

        if (!('text' in node)) return [];

        return [
          {
            ...decorateStart(path),
            rootDecorated: true,
          },
        ];
      },
      plugins: [RuntimePlugin],
      runtime: 'slate-v2',
      value: [{ children: [{ text: 'runtime' }], type: 'decorated' }],
    });
    const { container } = render(
      React.createElement(PlateRuntimeContent, {
        editableProps: {
          decorate: ([node, path]) => {
            if (!('text' in node)) return [];

            return [
              {
                data: { callerDecorated: true },
                range: decorateStart(path),
              },
            ];
          },
          renderElement: ({ attributes, children }) =>
            React.createElement('div', attributes, children),
          renderLeaf: ({ attributes, children, segment }) => {
            const data = Object.assign(
              {},
              ...segment.slices.map((slice) => slice.data ?? {})
            ) as {
              callerDecorated?: boolean;
              pluginDecorated?: string;
              rootDecorated?: boolean;
            };

            return React.createElement(
              'span',
              {
                ...attributes,
                'data-caller-decorated': String(Boolean(data.callerDecorated)),
                'data-plugin-decorated': data.pluginDecorated ?? '',
                'data-root-decorated': String(Boolean(data.rootDecorated)),
              },
              children
            );
          },
        },
        editor,
      })
    );

    await waitFor(() => {
      const decoratedLeaf = container.querySelector(
        '[data-root-decorated="true"][data-plugin-decorated="runtimeDecorate"][data-caller-decorated="true"]'
      );

      expect(decoratedLeaf?.textContent).toBe('run');
    });
  });

  it('routes createPlateEditor slate-v2 root and plugin inject nodeProps', async () => {
    const RuntimeBlockPlugin = createSlatePlugin({
      key: 'runtimeBlock',
      node: { isElement: true, type: 'runtime_block' },
      render: { as: 'section' },
    });
    const AlignInjectPlugin = createSlatePlugin({
      inject: {
        nodeProps: {
          classNames: { center: 'align-center' },
          nodeKey: 'align',
          styleKey: 'textAlign',
          validNodeValues: ['center'],
        },
        targetPlugins: [RuntimeBlockPlugin.key],
      },
      key: 'alignInject',
    });
    const editor = createPlateEditor({
      inject: {
        nodeProps: {
          nodeKey: 'indent',
          styleKey: 'marginLeft',
          transformNodeValue: ({ nodeValue }) => `${nodeValue}px`,
        },
        targetPlugins: [RuntimeBlockPlugin.key],
      },
      plugins: [RuntimeBlockPlugin, AlignInjectPlugin],
      runtime: 'slate-v2',
      value: [
        {
          align: 'center',
          children: [{ text: 'styled' }],
          indent: 24,
          type: 'runtime_block',
        },
      ],
    });
    const { container } = render(
      React.createElement(PlateRuntimeContent, { editor })
    );

    await waitFor(() => {
      const element = container.querySelector(
        'section[data-slate-node="element"]'
      ) as HTMLElement | null;

      expect(element?.className).toContain('align-center');
      expect(element?.style.textAlign).toBe('center');
      expect(element?.style.marginLeft).toBe('24px');
      expect(element?.textContent).toBe('styled');
    });
  });

  it('runs hook-backed createPlateEditor slate-v2 inject transformProps', async () => {
    const editor = createPlateEditor({
      runtime: 'slate-v2',
      value: [{ children: [{ text: 'target' }], type: 'p' }],
    });
    const navigationTf = editor.tf as typeof editor.tf &
      NavigationRuntimeTransforms;

    expect(
      navigationTf.navigation.flashTarget({
        duration: 1000,
        target: { path: [0], type: 'node' },
      })
    ).toBe(true);

    const { container } = render(
      React.createElement(PlateRuntimeContent, { editor })
    );

    await waitFor(() => {
      const element = container.querySelector(
        '[data-nav-target="true"]'
      ) as HTMLElement | null;

      expect(element?.getAttribute('data-nav-highlight')).toBe('navigated');
      expect(element?.getAttribute('data-nav-pulse')).toBe('1');
      expect(element?.textContent).toBe('target');
    });
  });

  it('routes createPlateEditor slate-v2 root options and useHooks', async () => {
    const hookCalls: Array<{
      answer: unknown;
      editorId: string;
      pluginKey: string;
    }> = [];
    const editor = createPlateEditor({
      options: { answer: 42 },
      runtime: 'slate-v2',
      useHooks: ({ editor: runtimeEditor, getOption, plugin }) => {
        hookCalls.push({
          answer: getOption('answer'),
          editorId: (runtimeEditor as PlateRuntimeEditor).id,
          pluginKey: plugin.key,
        });
      },
      value: [{ children: [{ text: 'hooked' }], type: 'p' }],
    });

    expect(editor.getOption({ key: 'root' }, 'answer')).toBe(42);

    render(React.createElement(PlateRuntimeContent, { editor }));

    await waitFor(() => {
      expect(hookCalls).toContainEqual({
        answer: 42,
        editorId: editor.id,
        pluginKey: 'root',
      });
    });
  });

  it('routes createPlateEditor slate-v2 root shortcuts through runtime hotkeys', async () => {
    const setHotkeyRef = mock();
    const shortcutHandler = mock();
    const useHotkeysSpy = spyOn(
      reactHotkeysModule,
      'useHotkeys'
    ).mockReturnValue(setHotkeyRef);

    try {
      const editor = createPlateEditor({
        runtime: 'slate-v2',
        shortcuts: {
          jump: {
            handler: shortcutHandler,
            keys: 'mod+j',
          },
        },
        value: [{ children: [{ text: 'shortcut' }], type: 'p' }],
      });
      const { container } = render(
        React.createElement(PlateRuntimeContent, { editor })
      );

      await waitFor(() => {
        expect(useHotkeysSpy).toHaveBeenCalledWith(
          'mod+j',
          expect.any(Function),
          expect.objectContaining({ enableOnContentEditable: true }),
          []
        );
        expect(setHotkeyRef).toHaveBeenCalled();

        const [hotkeyTarget] = setHotkeyRef.mock.calls.at(-1) ?? [];

        expect(hotkeyTarget).toBeInstanceOf(HTMLDivElement);
        expect(container.contains(hotkeyTarget as Node)).toBe(true);
        expect((hotkeyTarget as HTMLElement).isContentEditable).toBe(true);
        expect(
          (hotkeyTarget as HTMLElement).closest('[data-slate-editor="true"]')
        ).toBeTruthy();
      });

      const [, hotkeyCallback] = useHotkeysSpy.mock.calls[0];
      const event = {
        preventDefault: mock(),
        stopPropagation: mock(),
      };

      hotkeyCallback(event, {});

      expect(shortcutHandler).toHaveBeenCalledWith(
        expect.objectContaining({ editor })
      );
      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.stopPropagation).toHaveBeenCalled();
    } finally {
      useHotkeysSpy.mockRestore();
    }
  });

  it('routes createPlateEditor slate-v2 root render wrappers', () => {
    const AboveSlate = ({ children }: { children?: React.ReactNode }) =>
      React.createElement(
        'section',
        { 'data-testid': 'root-above-slate' },
        children
      );
    const AboveEditable = ({ children }: { children?: React.ReactNode }) =>
      React.createElement(
        'section',
        { 'data-testid': 'root-above-editable' },
        children
      );
    const BeforeEditable = ({ editor }: { editor: PlateRuntimeEditor }) =>
      React.createElement(
        'div',
        { 'data-testid': 'root-before-editable' },
        editor.id
      );
    const AfterEditable = ({ editor }: { editor: PlateRuntimeEditor }) =>
      React.createElement(
        'div',
        { 'data-testid': 'root-after-editable' },
        editor.id
      );
    const editor = createPlateEditor({
      id: 'root-render-runtime',
      render: {
        aboveEditable: AboveEditable,
        aboveSlate: AboveSlate,
        afterEditable: AfterEditable,
        beforeEditable: BeforeEditable,
      },
      runtime: 'slate-v2',
      value,
    });

    const { container, getByTestId } = render(
      React.createElement(PlateRuntimeContent, { editor })
    );

    expect(getByTestId('root-above-slate')).toBeDefined();
    expect(getByTestId('root-above-editable')).toBeDefined();
    expect(getByTestId('root-before-editable').textContent).toBe(editor.id);
    expect(getByTestId('root-after-editable').textContent).toBe(editor.id);
    expect(container.querySelector('[contenteditable="true"]')).toBeDefined();
  });

  it('routes createPlateEditor slate-v2 root node wrappers', () => {
    const RuntimePlugin = createSlatePlugin({
      key: 'runtimeElement',
      node: { isElement: true, type: 'runtime_element' },
      render: { as: 'section' },
    });
    const editor = createPlateEditor({
      plugins: [RuntimePlugin],
      render: {
        aboveNodes:
          ({ key, path, plugin }) =>
          ({ children }) =>
            React.createElement(
              'div',
              {
                'data-path': path.join('.'),
                'data-plugin-key': plugin.key,
                'data-testid': 'root-above-node',
                'data-wrapper-key': key,
              },
              children
            ),
        belowNodes:
          ({ key, path, plugin }) =>
          ({ children }) =>
            React.createElement(
              'span',
              {
                'data-path': path.join('.'),
                'data-plugin-key': plugin.key,
                'data-testid': 'root-below-node',
                'data-wrapper-key': key,
              },
              children
            ),
        belowRootNodes: ({ element, path }) =>
          React.createElement(
            'span',
            {
              contentEditable: false,
              'data-path': path.join('.'),
              'data-testid': 'root-below-root-node',
            },
            String(element.type)
          ),
      },
      runtime: 'slate-v2',
      value: [
        { children: [{ text: 'wrapped text' }], type: 'runtime_element' },
      ],
    });

    const { getByTestId } = render(
      React.createElement(PlateRuntimeContent, { editor })
    );
    const aboveNode = getByTestId('root-above-node');
    const belowNode = getByTestId('root-below-node');
    const belowRootNode = getByTestId('root-below-root-node');

    expect(aboveNode.getAttribute('data-path')).toBe('0');
    expect(aboveNode.getAttribute('data-plugin-key')).toBe('runtimeElement');
    expect(aboveNode.getAttribute('data-wrapper-key')).toBe('root');
    expect(belowNode.getAttribute('data-path')).toBe('0');
    expect(belowNode.getAttribute('data-plugin-key')).toBe('runtimeElement');
    expect(belowNode.getAttribute('data-wrapper-key')).toBe('root');
    expect(belowRootNode.getAttribute('data-path')).toBe('0');
    expect(belowRootNode.textContent).toBe('runtime_element');
    expect(aboveNode.textContent).toContain('wrapped text');
  });

  it('routes createPlateEditor slate-v2 root component overrides', () => {
    const RuntimePlugin = createSlatePlugin({
      key: 'runtimeElement',
      node: { isElement: true, type: 'runtime_element' },
      render: { as: 'section' },
    });
    const OverrideElement = ({
      attributes,
      children,
      path,
      plugin,
    }: {
      attributes: React.HTMLAttributes<HTMLElement> & {
        ref: React.RefCallback<HTMLElement>;
      };
      children?: React.ReactNode;
      path: Path;
      plugin: { key: string };
    }) =>
      React.createElement(
        'aside',
        {
          ...attributes,
          'data-path': path.join('.'),
          'data-plugin-key': plugin.key,
          'data-testid': 'component-override',
        },
        children
      );
    const editor = createPlateEditor({
      components: { runtimeElement: OverrideElement },
      plugins: [RuntimePlugin],
      runtime: 'slate-v2',
      value: [
        { children: [{ text: 'override text' }], type: 'runtime_element' },
      ],
    });

    const { getByTestId } = render(
      React.createElement(PlateRuntimeContent, { editor })
    );
    const element = getByTestId('component-override');

    expect(element.tagName).toBe('ASIDE');
    expect(element.getAttribute('data-path')).toBe('0');
    expect(element.getAttribute('data-plugin-key')).toBe('runtimeElement');
    expect(element.textContent).toBe('override text');
  });

  it('pipes runtime plugin onChange handlers through the v2 provider', async () => {
    const handledValues: Value[] = [];
    const propsOnChange = mock();
    const RuntimePlugin = createSlatePlugin({
      handlers: {
        onChange: ({ editor: runtimeEditor, value: currentValue }) => {
          expect((runtimeEditor as PlateRuntimeEditor).id).toBe(
            'runtime-change-handler'
          );
          handledValues.push(currentValue);

          return true;
        },
      },
      key: 'runtimeChangeHandler',
    });
    const editor = createPlateRuntimeEditor({
      id: 'runtime-change-handler',
      initialValue: value,
      plugins: [RuntimePlugin],
    });

    render(
      React.createElement(PlateRuntimeContent, {
        editor,
        onChange: propsOnChange,
      })
    );

    act(() => {
      editor.update((tx) => {
        tx.text.insert('!', { at: { offset: 7, path: [0, 0] } });
      });
    });

    await waitFor(() => {
      expect(handledValues.at(-1)).toEqual([
        { children: [{ text: 'runtime!' }], type: 'p' },
      ]);
    });
    expect(propsOnChange).not.toHaveBeenCalled();
  });

  it('routes createPlateEditor slate-v2 root onChange handlers', async () => {
    const handledValues: Value[] = [];
    const editor = createPlateEditor({
      handlers: {
        onChange: ({ value: currentValue }) => {
          handledValues.push(currentValue);

          return true;
        },
      },
      runtime: 'slate-v2',
      value,
    });

    render(React.createElement(PlateRuntimeContent, { editor }));

    act(() => {
      editor.update((tx) => {
        tx.text.insert('!', { at: { offset: 7, path: [0, 0] } });
      });
    });

    await waitFor(() => {
      expect(handledValues.at(-1)).toEqual([
        { children: [{ text: 'runtime!' }], type: 'p' },
      ]);
    });
  });

  it('routes usePlateEditor opt-in through the v2 runtime', () => {
    const nextValue: Value = [
      { children: [{ text: 'hook runtime tx' }], type: 'p' },
    ];
    const TxPlugin = createSlatePlugin({
      key: 'txPlugin',
    }).extendTx(() => ({
      txPlugin: (tx: EditorUpdateTransaction<Value>) => ({
        replace: () => tx.value.replace({ children: nextValue }),
      }),
    }));
    let replace: () => void = () => {
      throw new Error('runtime hook editor was not captured');
    };
    let readRoot: () => Value = () => {
      throw new Error('runtime hook editor was not captured');
    };

    const Probe = () => {
      const editor = usePlateEditor<Value, typeof TxPlugin>({
        plugins: [TxPlugin],
        runtime: 'slate-v2',
        value,
      });
      const assertHookTxInference = (
        tx: Parameters<Parameters<typeof editor.update>[0]>[0]
      ) => {
        tx.txPlugin.replace();
        // @ts-expect-error plugin tx groups should not degrade to any
        tx.txPlugin.missing();
      };

      expect(assertHookTxInference).toBeInstanceOf(Function);
      expect(isPlateRuntimeEditor(editor)).toBe(true);

      replace = () => {
        editor.update((tx) => {
          tx.txPlugin.replace();
        });
      };
      readRoot = () => editor.read((state) => state.value.root());

      return null;
    };

    render(React.createElement(Probe));
    replace();

    expect(readRoot()).toEqual(nextValue);
  });

  it('routes createPlateEditor slate-v2 rootPlugin configuration', () => {
    const RuntimePlugin = createSlatePlugin({
      key: 'runtimeElement',
      node: { isElement: true, type: 'runtime_element' },
      render: { as: 'section' },
    });
    const editor = createPlateEditor({
      plugins: [RuntimePlugin],
      rootPlugin: (plugin) =>
        plugin
          .configurePlugin(LengthPlugin, {
            options: { maxLength: 12 },
          })
          .configurePlugin(RuntimePlugin, {
            render: { as: 'article' },
          }),
      runtime: 'slate-v2',
      value: [{ children: [{ text: 'configured' }], type: 'runtime_element' }],
    });

    expect(editor.getOptions(LengthPlugin).maxLength).toBe(12);
    expect(editor.getPlugin(RuntimePlugin).render?.as).toBe('article');
  });

  it('rejects unsupported createPlateEditor slate-v2 root plugin mutations', () => {
    const unsupportedOptions = {
      runtime: 'slate-v2' as const,
      rootPlugin: (plugin) =>
        plugin.configure({
          extendEditor: () => ({}),
        }),
    };

    expect(() => createPlateEditor(unsupportedOptions)).toThrow(
      'Plugin "root" uses extendEditor, which is not supported by createPlateRuntimeEditor yet.'
    );
  });

  it('rejects root api and transforms on the explicit v2 route', () => {
    expect(() =>
      createPlateEditor({
        api: { root: { command: () => null } },
        runtime: 'slate-v2',
        transforms: { root: { command: () => null } },
        value,
      } as never)
    ).toThrow(
      "[Plate] createPlateEditor({ runtime: 'slate-v2' }) does not support these options yet: api, transforms."
    );
  });

  it('preserves legacy focus edge selection semantics on the runtime transform facade', () => {
    const editor = createPlateRuntimeEditor({
      initialValue: [
        { children: [{ text: 'first' }], type: 'p' },
        { children: [{ text: 'last' }], type: 'p' },
      ],
    });

    editor.tf.focus({ edge: 'endEditor', retries: 1 });
    expect(editor.read((state) => state.selection.get())).toEqual({
      anchor: { offset: 4, path: [1, 0] },
      focus: { offset: 4, path: [1, 0] },
    });

    editor.tf.focus({ edge: 'startEditor', retries: 1 });
    expect(editor.read((state) => state.selection.get())).toEqual({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    });

    editor.tf.focus({ at: [0], edge: 'end', retries: 1 });
    expect(editor.read((state) => state.selection.get())).toEqual({
      anchor: { offset: 5, path: [0, 0] },
      focus: { offset: 5, path: [0, 0] },
    });
  });

  it('mounts under the Slate v2 React provider without the legacy Slate facade', async () => {
    const nextValue: Value = [
      { children: [{ text: 'changed through provider' }], type: 'p' },
    ];
    const editor = createPlateRuntimeEditor({
      id: 'runtime-provider',
      initialValue: value,
    });
    const values: Value[] = [];

    const Probe = () => {
      const runtimeEditor = useEditor<PlateRuntimeEditor<Value>>();
      const readOnly = useEditorReadOnly();
      const text = useEditorState<string, PlateRuntimeEditor<Value>>(
        (state) => {
          const root = state.value.root() as Value;
          const firstLeaf = root[0]?.children[0] as
            | { text?: string }
            | undefined;

          return firstLeaf?.text ?? '';
        }
      );

      return React.createElement(
        'output',
        { 'data-testid': 'runtime-probe' },
        `${runtimeEditor.id}:${readOnly}:${text}`
      );
    };

    const { getByTestId } = render(
      React.createElement(
        Slate,
        {
          editor,
          onValueChange: (currentValue: Value) => values.push(currentValue),
          readOnly: true,
        },
        React.createElement(Probe)
      )
    );

    expect(getByTestId('runtime-probe').textContent).toBe(
      'runtime-provider:true:runtime'
    );

    act(() => {
      editor.update((tx) => {
        tx.value.replace({ children: nextValue });
      });
    });

    await waitFor(() => {
      expect(getByTestId('runtime-probe').textContent).toBe(
        'runtime-provider:true:changed through provider'
      );
    });
    expect(values.at(-1)).toEqual(nextValue);
  });

  it('mounts through the Plate runtime Slate adapter with aboveSlate wrappers', async () => {
    const nextValue: Value = [
      { children: [{ text: 'changed through adapter' }], type: 'p' },
    ];
    const values: Value[] = [];
    const AboveSlate = ({ children }: { children: React.ReactNode }) =>
      React.createElement(
        'section',
        { 'data-testid': 'above-slate' },
        children
      );
    const RuntimePlugin = createSlatePlugin({
      key: 'runtimeWrapper',
      render: { aboveSlate: AboveSlate },
    });
    const editor = createPlateRuntimeEditor({
      initialValue: value,
      plugins: [RuntimePlugin],
      readOnly: true,
    });

    const Probe = () => {
      const runtimeEditor = useEditor<PlateRuntimeEditor<Value>>();
      const readOnly = useEditorReadOnly();
      const text = useEditorState<string, PlateRuntimeEditor<Value>>(
        (state) => {
          const root = state.value.root() as Value;
          const firstLeaf = root[0]?.children[0] as
            | { text?: string }
            | undefined;

          return firstLeaf?.text ?? '';
        }
      );

      return React.createElement(
        'output',
        { 'data-testid': 'runtime-adapter-probe' },
        `${runtimeEditor.id}:${readOnly}:${text}`
      );
    };

    const { getByTestId } = render(
      React.createElement(
        PlateRuntimeSlate,
        {
          editor,
          onValueChange: (currentValue: Value) => values.push(currentValue),
        },
        React.createElement(Probe)
      )
    );

    expect(getByTestId('above-slate')).toBeDefined();
    expect(getByTestId('runtime-adapter-probe').textContent).toBe(
      `${editor.id}:true:runtime`
    );

    act(() => {
      editor.update((tx) => {
        tx.value.replace({ children: nextValue });
      });
    });

    await waitFor(() => {
      expect(getByTestId('runtime-adapter-probe').textContent).toBe(
        `${editor.id}:true:changed through adapter`
      );
    });
    expect(values.at(-1)).toEqual(nextValue);
  });

  it('mounts through the Plate runtime Editable adapter with editable wrappers', () => {
    const BeforeEditable = ({ editor }: { editor: PlateRuntimeEditor }) =>
      React.createElement(
        'div',
        { 'data-testid': 'before-editable' },
        editor.id
      );
    const AfterEditable = ({ editor }: { editor: PlateRuntimeEditor }) =>
      React.createElement(
        'div',
        { 'data-testid': 'after-editable' },
        editor.id
      );
    const AboveEditable = ({ children }: { children: React.ReactNode }) =>
      React.createElement(
        'section',
        { 'data-testid': 'above-editable' },
        children
      );
    const hookReadOnlyStates: boolean[] = [];
    const RuntimePlugin = createSlatePlugin({
      key: 'editableWrapper',
      render: {
        aboveEditable: AboveEditable,
        afterEditable: AfterEditable,
        beforeEditable: BeforeEditable,
      },
      useHooks: () => {
        hookReadOnlyStates.push(useEditorReadOnly());
      },
    });
    const editor = createPlateRuntimeEditor({
      id: 'runtime-editable',
      initialValue: value,
      plugins: [RuntimePlugin],
      readOnly: true,
    });

    const { container, getByTestId } = render(
      React.createElement(
        PlateRuntimeSlate,
        { editor },
        React.createElement(PlateRuntimeEditable, {
          editor,
          renderEditable: (editable) =>
            React.createElement(
              'div',
              { 'data-testid': 'render-editable' },
              editable
            ),
        })
      )
    );

    expect(getByTestId('before-editable').textContent).toBe(editor.id);
    expect(getByTestId('after-editable').textContent).toBe(editor.id);
    expect(getByTestId('above-editable')).toBeDefined();
    expect(getByTestId('render-editable')).toBeDefined();
    expect(container.querySelector('[contenteditable="true"]')).toBeDefined();
    expect(hookReadOnlyStates.at(-1)).toBe(true);
  });

  it('renders plugin element components through the v2 runtime Editable adapter', () => {
    const RuntimeElement = ({
      attributes,
      children,
      editor,
      element,
      path,
      plugin,
    }: {
      attributes: React.HTMLAttributes<HTMLElement> & {
        ref: React.RefCallback<HTMLElement>;
      };
      children?: React.ReactNode;
      editor: PlateRuntimeEditor;
      element: SlateElement;
      path: Path;
      plugin: { key: string };
    }) =>
      React.createElement(
        'article',
        {
          ...attributes,
          'data-editor-id': editor.id,
          'data-element-type': String(element.type),
          'data-path': path.join('.'),
          'data-plugin-key': plugin.key,
          'data-testid': 'runtime-element',
        },
        children
      );
    const RuntimePlugin = createSlatePlugin({
      key: 'runtimeElement',
      node: { isElement: true, type: 'runtime_element' },
      render: { node: RuntimeElement },
    });
    const editor = createPlateRuntimeEditor({
      id: 'runtime-render-element',
      initialValue: [
        { children: [{ text: 'element text' }], type: 'runtime_element' },
      ],
      plugins: [RuntimePlugin],
    });

    const { getByTestId } = render(
      React.createElement(PlateRuntimeContent, { editor })
    );
    const element = getByTestId('runtime-element');

    expect(element.tagName).toBe('ARTICLE');
    expect(element.getAttribute('data-editor-id')).toBe(editor.id);
    expect(element.getAttribute('data-element-type')).toBe('runtime_element');
    expect(element.getAttribute('data-path')).toBe('0');
    expect(element.getAttribute('data-plugin-key')).toBe('runtimeElement');
    expect(element.textContent).toBe('element text');
  });

  it('mounts through the Plate runtime Content adapter with provider and editable wrappers', async () => {
    const nextValue: Value = [
      { children: [{ text: 'changed through content' }], type: 'p' },
    ];
    const values: Value[] = [];
    const hookEditorIds: string[] = [];
    const AboveSlate = ({ children }: { children: React.ReactNode }) =>
      React.createElement(
        'section',
        { 'data-testid': 'content-above-slate' },
        children
      );
    const AboveEditable = ({ children }: { children: React.ReactNode }) =>
      React.createElement(
        'section',
        { 'data-testid': 'content-above-editable' },
        children
      );
    const BeforeEditable = ({ editor }: { editor: PlateRuntimeEditor }) =>
      React.createElement(
        'div',
        { 'data-testid': 'content-before-editable' },
        editor.id
      );
    const AfterEditable = ({ editor }: { editor: PlateRuntimeEditor }) =>
      React.createElement(
        'div',
        { 'data-testid': 'content-after-editable' },
        editor.id
      );
    const RuntimePlugin = createSlatePlugin({
      key: 'contentWrapper',
      render: {
        aboveEditable: AboveEditable,
        aboveSlate: AboveSlate,
        afterEditable: AfterEditable,
        beforeEditable: BeforeEditable,
      },
      useHooks: ({ editor: runtimeEditor }) => {
        hookEditorIds.push((runtimeEditor as PlateRuntimeEditor).id);
      },
    });
    const editor = createPlateRuntimeEditor({
      id: 'runtime-content',
      initialValue: value,
      plugins: [RuntimePlugin],
      readOnly: true,
    });

    const { container, getByTestId } = render(
      React.createElement(PlateRuntimeContent, {
        editor,
        editableProps: {
          renderEditable: (editable) =>
            React.createElement(
              'div',
              { 'data-testid': 'content-render-editable' },
              editable
            ),
        },
        onValueChange: (currentValue: Value) => values.push(currentValue),
      })
    );

    expect(getByTestId('content-above-slate')).toBeDefined();
    expect(getByTestId('content-before-editable').textContent).toBe(editor.id);
    expect(getByTestId('content-after-editable').textContent).toBe(editor.id);
    expect(getByTestId('content-above-editable')).toBeDefined();
    expect(getByTestId('content-render-editable')).toBeDefined();
    expect(container.querySelector('[contenteditable="true"]')).toBeDefined();
    expect(hookEditorIds.at(-1)).toBe(editor.id);

    act(() => {
      editor.update((tx) => {
        tx.value.replace({ children: nextValue });
      });
    });

    await waitFor(() => {
      expect(values.at(-1)).toEqual(nextValue);
    });
  });

  it('keeps plugin caches empty without plugins', () => {
    const editor = createPlateRuntimeEditor({ initialValue: value });

    expect(editor.meta.pluginList).toEqual([]);
    expect(editor.meta.pluginCache.render.aboveEditable).toEqual([]);
    expect(editor.meta.inputRules.insertText.byTrigger).toEqual({});
  });

  it('resolves plugin metadata without mutating the Slate v2 api proxy', () => {
    const Leaf = () => null;
    const Toolbar = ({ children }: { children: React.ReactNode }) => children;
    const RuntimePlugin = createSlatePlugin({
      key: 'runtimePlugin',
      api: { runtimeMethod: () => 'runtime' },
      handlers: { onChange: () => {} },
      inject: { nodeProps: { nodeKey: 'runtime' } },
      node: {
        isDecoration: false,
        isLeaf: true,
        leafProps: { className: 'runtime-leaf' },
        type: 'runtime_leaf',
      },
      options: { enabled: true },
      priority: 200,
      render: {
        aboveEditable: Toolbar,
        node: Leaf,
      },
      shortcuts: {
        toggle: { keys: 'mod+r' },
      },
      useHooks: () => null,
    });

    const editor = createPlateRuntimeEditor({
      initialValue: value,
      plugins: [RuntimePlugin],
    });

    expect(editor.meta.pluginList.map((plugin) => plugin.key)).toEqual([
      'runtimePlugin',
    ]);
    expect(Object.keys(editor.plugins)).toEqual(['runtimePlugin']);
    expect(editor.getPlugin(RuntimePlugin).api.runtimeMethod()).toBe('runtime');
    expect(
      (editor.api as { runtimeMethod: () => string }).runtimeMethod()
    ).toBe('runtime');
    expect(editor.getType('runtimePlugin')).toBe('runtime_leaf');
    expect(editor.meta.components.runtimePlugin).toBe(Leaf);
    expect(editor.meta.pluginCache.node.isLeaf).toEqual(['runtimePlugin']);
    expect(editor.meta.pluginCache.node.isText).toEqual(['runtimePlugin']);
    expect(editor.meta.pluginCache.inject.nodeProps).toEqual(['runtimePlugin']);
    expect(editor.meta.pluginCache.render.aboveEditable).toEqual([
      'runtimePlugin',
    ]);
    expect(editor.meta.pluginCache.handlers.onChange).toEqual([
      'runtimePlugin',
    ]);
    expect(editor.meta.pluginCache.useHooks).toEqual(['runtimePlugin']);
    expect(editor.meta.shortcuts['runtimePlugin.toggle']).toEqual({
      keys: 'mod+r',
    });

    expect(editor.getOption(RuntimePlugin, 'enabled')).toBe(true);
    editor.setOption(RuntimePlugin, 'enabled', false);
    expect(editor.getOption(RuntimePlugin, 'enabled')).toBe(false);
    editor.setOptions(RuntimePlugin, { count: 2 });
    expect(editor.getOptions(RuntimePlugin)).toMatchObject({
      count: 2,
      enabled: false,
    });

    expect(Object.hasOwn(editor.api as object, 'runtimeMethod')).toBe(false);
  });

  it('orders dependencies and applies plugin overrides', () => {
    const FirstPlugin = createSlatePlugin({
      key: 'first',
      priority: 10,
    });
    const SecondPlugin = createSlatePlugin({
      key: 'second',
      dependencies: ['first'],
      priority: 100,
    });
    const HiddenPlugin = createSlatePlugin({
      key: 'hidden',
    });
    const OverridePlugin = createSlatePlugin({
      key: 'override',
      override: {
        enabled: { hidden: false },
        plugins: {
          first: { node: { type: 'first_override' } },
        },
      },
    });

    const editor = createPlateRuntimeEditor({
      initialValue: value,
      plugins: [SecondPlugin, HiddenPlugin, OverridePlugin, FirstPlugin],
    });

    expect(editor.meta.pluginList.map((plugin) => plugin.key)).toEqual([
      'first',
      'second',
      'override',
    ]);
    expect(editor.plugins.hidden).toBeUndefined();
    expect(editor.getType('first')).toBe('first_override');
  });

  it('installs plugin node flags as Slate v2 element specs', () => {
    const InlinePlugin = createSlatePlugin({
      key: 'mention',
      node: { isElement: true, isInline: true, type: 'mention' },
    });
    const VoidPlugin = createSlatePlugin({
      key: 'image',
      node: { isElement: true, isVoid: true, type: 'image' },
    });
    const MarkableVoidPlugin = createSlatePlugin({
      key: 'emoji',
      node: {
        isElement: true,
        isInline: true,
        isMarkableVoid: true,
        isVoid: true,
        type: 'emoji',
      },
    });
    const NonSelectablePlugin = createSlatePlugin({
      key: 'caption',
      node: { isElement: true, isSelectable: false, type: 'caption' },
    });
    const editor = createPlateRuntimeEditor({
      initialValue: value,
      plugins: [
        InlinePlugin,
        VoidPlugin,
        MarkableVoidPlugin,
        NonSelectablePlugin,
      ],
    });
    const mention = {
      children: [{ text: '' }],
      type: 'mention',
    } as SlateElement;
    const image = { children: [{ text: '' }], type: 'image' } as SlateElement;
    const emoji = { children: [{ text: '' }], type: 'emoji' } as SlateElement;
    const caption = {
      children: [{ text: '' }],
      type: 'caption',
    } as SlateElement;

    expect(editor.read((state) => state.schema.isInline(mention))).toBe(true);
    expect(editor.read((state) => state.schema.isVoid(image))).toBe(true);
    expect(editor.read((state) => state.schema.isInline(emoji))).toBe(true);
    expect(editor.read((state) => state.schema.isVoid(emoji))).toBe(true);
    expect(editor.read((state) => state.schema.markableVoid(emoji))).toBe(true);
    expect(editor.read((state) => state.schema.isSelectable(caption))).toBe(
      false
    );
  });

  it('resolves configure and functional extension metadata', () => {
    const configuredRule = { target: 'insertText', trigger: '!' };
    const ExtendedPlugin = createSlatePlugin({
      key: 'extended',
      node: { type: 'default_type' },
      options: { count: 1 },
    })
      .configure(({ plugin }) => ({
        inputRules: [configuredRule],
        node: { type: `${plugin.node.type}_configured` },
        options: { count: (plugin.options.count as number) + 1 },
      }))
      .extend(({ plugin }) => ({
        parsers: {
          html: {
            deserializer: {
              parse: () => ({ type: plugin.node.type }),
            },
          },
        },
      }));

    const editor = createPlateRuntimeEditor({
      initialValue: value,
      plugins: [ExtendedPlugin],
    });
    const plugin = editor.getPlugin<ExtendedRuntimePlugin>(ExtendedPlugin);

    expect(plugin.options.count).toBe(2);
    expect(editor.getType('extended')).toBe('default_type_configured');
    expect(plugin.parsers.html.deserializer.parse()).toEqual({
      type: 'default_type_configured',
    });
    expect(editor.meta.inputRules.plugins.extended.rules).toMatchObject([
      {
        id: 'extended.0',
        pluginIndex: 0,
        pluginKey: 'extended',
        priority: 100,
        ruleIndex: 0,
        target: 'insertText',
        trigger: '!',
      },
    ]);
    expect(editor.meta.inputRules.insertText.byTrigger['!']).toMatchObject([
      {
        id: 'extended.0',
        pluginKey: 'extended',
      },
    ]);
    expect((editor.api as { extended?: unknown }).extended).toBeUndefined();
  });

  it('routes InputRulesPlugin insert transforms through runtime rule buckets', () => {
    const calls: string[] = [];
    const RulePlugin = createSlatePlugin({
      key: 'runtimeRules',
      inputRules: [
        {
          apply: (context, before) => {
            calls.push(`text:${before}`);
            context.insertText('?');
          },
          resolve: (context) => context.getBlockTextBeforeSelection(),
          target: 'insertText',
          trigger: '!',
        },
        {
          apply: (context, before) => {
            calls.push(`break:${before}`);
            context.insertBreak();
          },
          resolve: (context) => context.getBlockStartText(),
          target: 'insertBreak',
        },
        {
          apply: (context, text) => {
            calls.push(`data:${text}`);
            context.editor.update((tx) => {
              tx.text.insert(String(text));
            });
          },
          mimeTypes: ['text/plain'],
          resolve: (context) => context.text,
          target: 'insertData',
        },
      ],
    });
    const editor = createPlateRuntimeEditor({
      initialValue: [{ children: [{ text: 'hi' }], type: 'p' }],
      plugins: [InputRulesPlugin, RulePlugin],
    });
    const dataTransfer = {
      files: [] as unknown as FileList,
      getData: mock((mimeType: string) =>
        mimeType === 'text/plain' ? 'paste' : ''
      ),
    } satisfies Pick<DataTransfer, 'files' | 'getData'>;

    editor.tf.focus({ edge: 'endEditor', retries: 1 });

    expect(editor.tf.insertText('!')).toBe(true);
    expect(editor.tf.insertBreak()).toBe(true);
    expect(editor.tf.insertData(dataTransfer as DataTransfer)).toBe(true);

    expect(calls).toEqual(['text:hi', 'break:hi?', 'data:paste']);
    expect(editor.read((state) => state.value.root())).toEqual([
      { children: [{ text: 'hi?' }], type: 'p' },
      { children: [{ text: 'paste' }], type: 'p' },
    ]);
  });

  it('routes LengthPlugin overflow trimming through v2 operations', () => {
    const editor = createPlateRuntimeEditor({
      initialValue: [{ children: [{ text: '' }], type: 'p' }],
      plugins: [LengthPlugin.configure({ options: { maxLength: 5 } })],
    });

    editor.tf.focus({ edge: 'endEditor', retries: 1 });
    editor.tf.insertText('Hello, World!');

    expect(editor.read((state) => state.value.root())).toEqual([
      { children: [{ text: 'Hello' }], type: 'p' },
    ]);

    editor.tf.setValue([{ children: [{ text: '' }], type: 'p' }]);
    editor.tf.focus({ edge: 'endEditor', retries: 1 });
    editor.tf.insertFragment([
      { children: [{ text: 'This is a long pasted text' }], type: 'p' },
    ]);

    expect(editor.read((state) => state.value.root())).toEqual([
      { children: [{ text: 'This ' }], type: 'p' },
    ]);
  });

  it('routes AffinityPlugin outward insertText marks through v2 transactions', () => {
    const BoldPlugin = createSlatePlugin({
      key: 'bold',
      node: { isLeaf: true, type: 'bold' },
      rules: { selection: { affinity: 'outward' } },
    });
    const editor = createPlateRuntimeEditor({
      initialValue: [
        {
          children: [{ bold: true, text: 'bold' }, { text: 'plain' }],
          type: 'p',
        },
      ],
      plugins: [AffinityPlugin, BoldPlugin],
    });

    editor.update((tx) => {
      tx.selection.set({ offset: 4, path: [0, 0] });
    });

    expect(editor.tf.insertText('x')).toBe(true);
    expect(editor.read((state) => state.value.root())).toEqual([
      {
        children: [
          { bold: true, text: 'bold' },
          { text: 'x' },
          { text: 'plain' },
        ],
        type: 'p',
      },
    ]);
  });

  it('routes AffinityPlugin directional deleteBackward marks through v2 transactions', () => {
    const BoldPlugin = createSlatePlugin({
      key: 'bold',
      node: { isLeaf: true, type: 'bold' },
      rules: { selection: { affinity: 'directional' } },
    });
    const editor = createPlateRuntimeEditor({
      initialValue: [
        {
          children: [{ bold: true, text: 'ab' }, { text: 'cd' }],
          type: 'p',
        },
      ],
      plugins: [AffinityPlugin, BoldPlugin],
    });

    editor.update((tx) => {
      tx.selection.set({ offset: 0, path: [0, 1] });
    });

    expect(editor.tf.deleteBackward('character')).toBe(true);
    expect(editor.tf.insertText('x')).toBe(true);
    expect(editor.read((state) => state.value.root())).toEqual([
      {
        children: [{ bold: true, text: 'ax' }, { text: 'cd' }],
        type: 'p',
      },
    ]);
  });

  it('routes AffinityPlugin directional move marks through v2 transactions', () => {
    const BoldPlugin = createSlatePlugin({
      key: 'bold',
      node: { isLeaf: true, type: 'bold' },
      rules: { selection: { affinity: 'directional' } },
    });
    const editor = createPlateRuntimeEditor({
      initialValue: [
        {
          children: [{ bold: true, text: 'a' }, { text: 'b' }],
          type: 'p',
        },
      ],
      plugins: [AffinityPlugin, BoldPlugin],
    });

    editor.update((tx) => {
      tx.selection.set({ offset: 1, path: [0, 0] });
    });

    expect(editor.tf.move({ distance: 1, unit: 'character' })).toBe(true);
    expect(editor.tf.insertText('x')).toBe(true);
    expect(editor.read((state) => state.value.root())).toEqual([
      {
        children: [{ bold: true, text: 'ax' }, { text: 'b' }],
        type: 'p',
      },
    ]);
  });

  it('registers plugin api capabilities without legacy api mutation', () => {
    const ApiPlugin = createSlatePlugin({
      key: 'apiPlugin',
      options: { answer: 42 },
      node: { type: 'api-node' },
    }).extendApi(({ getOption, setOption }) => ({
      answer: () => getOption('answer'),
      setAnswer: (answer: number) => {
        setOption('answer', answer);
      },
    }));

    const editor = createPlateRuntimeEditor({
      initialValue: value,
      plugins: [ApiPlugin],
    });

    type ApiPluginApi = {
      apiPlugin: {
        answer: () => number;
        setAnswer: (answer: number) => void;
      };
    };

    expect((editor.api as ApiPluginApi).apiPlugin.answer()).toBe(42);
    expect(
      editor.getPluginApi<ApiPluginApi>(ApiPlugin).apiPlugin.answer()
    ).toBe(42);
    editor.getPluginApi<ApiPluginApi>(ApiPlugin).apiPlugin.setAnswer(43);
    expect(
      editor.getPluginApi<ApiPluginApi>(ApiPlugin).apiPlugin.answer()
    ).toBe(43);
    expect(editor.getOption(ApiPlugin, 'answer')).toBe(43);
    expect(Object.hasOwn(editor.api as object, 'apiPlugin')).toBe(false);
    expect(editor.getType('apiPlugin')).toBe('api-node');
    expect(editor.getType('missingPlugin')).toBe('missingPlugin');
  });

  it('registers HTML api capabilities on the v2 runtime route', () => {
    const editor = createPlateRuntimeEditor({
      initialValue: value,
      plugins: [HtmlPlugin, BaseParagraphPlugin],
    });
    const api = editor.getPluginApi<{
      html: {
        deserialize: (options: { element: HTMLElement | string }) => Value;
      };
    }>(HtmlPlugin);

    expect(api.html.deserialize({ element: '<p>Hello</p>' })).toEqual([
      { children: [{ text: 'Hello' }], type: 'p' },
    ]);

    editor.tf.setValue('<p>Changed</p>');

    expect(editor.read((state) => state.value.root())).toEqual([
      { children: [{ text: 'Changed' }], type: 'p' },
    ]);
  });

  it('registers global editor api capabilities through Slate v2 extensions', () => {
    const DebugPlugin = createSlatePlugin({
      key: 'debugRuntime',
      options: { prefix: 'runtime' },
    }).extendEditorApi(({ getOption }) => ({
      debug: {
        label: () => `${getOption('prefix')}:debug`,
      },
    }));

    const editor = createPlateRuntimeEditor({
      initialValue: value,
      plugins: [DebugPlugin],
    });

    expect(
      (editor.api as { debug: { label: () => string } }).debug.label()
    ).toBe('runtime:debug');
    expect(
      editor
        .getPluginApi<{ debug: { label: () => string } }>(DebugPlugin)
        .debug.label()
    ).toBe('runtime:debug');
    expect(Object.hasOwn(editor.api as object, 'debug')).toBe(false);
  });

  it('routes DebugPlugin through the global runtime api capability path', () => {
    const warn = mock();
    const editor = createPlateRuntimeEditor({
      initialValue: value,
      plugins: [
        DebugPlugin.configure({
          options: {
            isProduction: false,
            logger: { warn },
            logLevel: 'warn',
            throwErrors: false,
          },
        }),
      ],
    });
    const debugApi = editor.getPluginApi<{
      debug: { warn: (message: string, type?: string) => void };
    }>(DebugPlugin);

    debugApi.debug.warn('runtime warning', 'OVERRIDE_MISSING');

    expect(warn).toHaveBeenCalledWith(
      'runtime warning',
      'OVERRIDE_MISSING',
      undefined
    );
  });

  it('uses Slate v2 history for the legacy Plate history plugin route', () => {
    const editor = createPlateRuntimeEditor({
      initialValue: value,
      plugins: [HistoryPlugin],
    });

    expect(editor.getPlugin(HistoryPlugin).extendEditor).toBeUndefined();
    expect(editor.read((state) => state.history.undos())).toEqual([]);

    editor.update(
      (tx) => {
        tx.text.insert(' changed', { at: { path: [0, 0], offset: 7 } });
      },
      { tag: 'history-push' }
    );

    expect(editor.read((state) => state.history.undos()).length).toBe(1);
    expect(editor.read((state) => state.value.root())).toEqual([
      { children: [{ text: 'runtime changed' }], type: 'p' },
    ]);

    editor.update((tx) => {
      tx.history.undo();
    });

    expect(editor.read((state) => state.value.root())).toEqual(value);
  });

  it('maps the legacy Plate React enhancer through the v2 DOM runtime route', () => {
    const initialSelection = {
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    };

    expect(ReactPlugin.extendEditor).toBeDefined();

    const editor = createPlateRuntimeEditor({
      initialSelection,
      initialValue: value,
      plugins: [ReactPlugin],
    });

    expect(editor.getPlugin(ReactPlugin).extendEditor).toBeUndefined();
    expect(
      typeof (editor.api as { isScrolling: () => boolean }).isScrolling
    ).toBe('function');
    expect(
      typeof (editor.api as { scrollIntoView: unknown }).scrollIntoView
    ).toBe('function');

    let wasScrolling = false;
    editor.getTransforms<RuntimeDomTransforms>(DOMPlugin).withScrolling(
      () => {
        wasScrolling = (
          editor.api as { isScrolling: () => boolean }
        ).isScrolling();

        editor.update((tx) => {
          tx.text.insert('!', { at: { path: [0, 0], offset: 7 } });
        });
      },
      { operations: { insert_text: false } }
    );

    expect(wasScrolling).toBe(true);
    expect((editor.api as { isScrolling: () => boolean }).isScrolling()).toBe(
      false
    );
    expect(editor.read((state) => state.value.root())).toEqual([
      { children: [{ text: 'runtime!' }], type: 'p' },
    ]);

    editor.dom.currentKeyboardEvent = { key: 'ArrowRight' } as never;
    editor.update((tx) => {
      tx.selection.set({ path: [0, 0], offset: 2 });
    });

    expect(editor.dom.prevSelection).toEqual(initialSelection);
    expect(editor.dom.currentKeyboardEvent).toBeNull();
  });

  it('pipes SlateReactExtension keyboard handlers through the runtime editable route', async () => {
    const moveLine = mock().mockReturnValue(true);
    const editor = createPlateRuntimeEditor({
      initialValue: value,
      plugins: [SlateReactExtensionPlugin],
    });

    editor.tf.moveLine = moveLine;

    const { container } = render(
      React.createElement(PlateRuntimeContent, { editor })
    );
    const editable = container.querySelector('[contenteditable="true"]');

    expect(editable).toBeDefined();

    await act(async () => {
      fireEvent.keyDown(editable!, { key: 'ArrowUp' });
      await Promise.resolve();
    });

    expect(moveLine).toHaveBeenCalledWith({ reverse: true });
    expect(editor.dom.currentKeyboardEvent?.key).toBe('ArrowUp');
  });

  it('keeps runtime reset as a v2 value replacement without legacy transform metadata', () => {
    const editor = createPlateRuntimeEditor({
      initialValue: [{ children: [{ text: 'custom' }], type: 'heading' }],
      plugins: [SlateReactExtensionPlugin],
    });

    act(() => {
      editor.tf.reset();
    });

    expect(editor.read((state) => state.value.root())).toEqual([
      { children: [{ text: '' }], type: 'p' },
    ]);
    expect(editor.read((state) => state.selection.get())).toBeNull();
  });

  it('cleans SlateReactExtension _memo markers through a v2 normalizer', () => {
    const editor = createPlateRuntimeEditor({
      initialValue: [
        { _memo: 'cached', children: [{ text: 'memoized' }], type: 'p' },
      ],
      plugins: [SlateReactExtensionPlugin],
    });

    editor.update((tx) => {
      tx.normalize({ force: true });
    });

    expect(editor.read((state) => state.value.root())).toEqual([
      { children: [{ text: 'memoized' }], type: 'p' },
    ]);
  });

  it('pipes SlateExtension node-change callbacks through v2 operations', () => {
    const onNodeChange = mock();
    const editor = createPlateRuntimeEditor({
      initialValue: [{ children: [{ text: 'runtime' }], type: 'p' }],
      plugins: [
        SlateExtensionPlugin.configure({
          options: { onNodeChange },
        }),
      ],
    });

    editor.update((tx) => {
      tx.nodes.set({ type: 'heading' }, { at: [0] });
    });

    expect(onNodeChange).toHaveBeenCalledWith({
      editor,
      node: expect.objectContaining({ type: 'heading' }),
      operation: expect.objectContaining({ type: 'set_node' }),
      prevNode: expect.objectContaining({ type: 'p' }),
    });
  });

  it('pipes SlateExtension text-change callbacks through v2 operations', () => {
    const onTextChange = mock();
    const editor = createPlateRuntimeEditor({
      initialValue: [{ children: [{ text: 'hello' }], type: 'p' }],
      plugins: [
        SlateExtensionPlugin.configure({
          options: { onTextChange },
        }),
      ],
    });

    editor.update((tx) => {
      tx.text.insert(' world', { at: { offset: 5, path: [0, 0] } });
    });

    expect(onTextChange).toHaveBeenCalledWith({
      editor,
      node: expect.objectContaining({ type: 'p' }),
      operation: expect.objectContaining({ type: 'insert_text' }),
      prevText: 'hello',
      text: 'hello world',
    });
  });

  it('keeps runtime setValue as a v2 value replacement', () => {
    const editor = createPlateRuntimeEditor({
      initialValue: [{ children: [{ text: 'old' }], type: 'p' }],
      plugins: [SlateExtensionPlugin],
    });

    editor.tf.setValue([{ children: [{ text: 'new' }], type: 'p' }]);

    expect(editor.read((state) => state.value.root())).toEqual([
      { children: [{ text: 'new' }], type: 'p' },
    ]);

    editor.tf.setValue([]);

    expect(editor.read((state) => state.value.root())).toEqual([
      { children: [{ text: '' }], type: 'p' },
    ]);
  });

  it('keeps runtime resetBlock as a v2 node transaction', () => {
    const editor = createPlateRuntimeEditor({
      initialValue: [
        {
          children: [{ text: 'custom' }],
          foo: 'remove',
          id: 'keep',
          type: 'heading',
        },
      ],
      plugins: [SlateExtensionPlugin],
    });

    expect(editor.tf.resetBlock({ at: [0] })).toBe(true);
    expect(editor.read((state) => state.value.root())).toEqual([
      { children: [{ text: 'custom' }], id: 'keep', type: 'p' },
    ]);

    editor.update((tx) => {
      tx.nodes.set({ foo: 'remove', type: 'heading' }, { at: [0] });
      tx.selection.set({ offset: 0, path: [0, 0] });
    });

    expect(editor.tf.resetBlock()).toBe(true);
    expect(editor.read((state) => state.value.root())).toEqual([
      { children: [{ text: 'custom' }], id: 'keep', type: 'p' },
    ]);
  });

  it('keeps runtime liftBlock as a v2 unwrap transaction', () => {
    const editor = createPlateRuntimeEditor({
      initialValue: [
        {
          children: [{ children: [{ text: 'Quote' }], type: 'p' }],
          type: 'blockquote',
        },
      ],
      plugins: [SlateExtensionPlugin],
    });

    editor.update((tx) => {
      tx.selection.set({ offset: 0, path: [0, 0, 0] });
    });

    expect(editor.tf.liftBlock({ match: { type: 'blockquote' } })).toBe(true);
    expect(editor.read((state) => state.value.root())).toEqual([
      { children: [{ text: 'Quote' }], type: 'p' },
    ]);
  });

  it('routes blockquote child normalization through v2 node normalizers', () => {
    const editor = createPlateRuntimeEditor({
      initialValue: [
        {
          children: [
            { text: 'Lead' },
            { children: [{ text: 'Nested' }], type: 'p' },
            { text: 'Tail' },
          ],
          type: 'blockquote',
        },
      ],
      plugins: [createRuntimeBlockquotePlugin()],
    });

    editor.update((tx) => {
      tx.normalize({ force: true });
    });

    expect(editor.read((state) => state.value.root())).toEqual([
      {
        children: [
          { children: [{ text: 'Lead' }], type: 'p' },
          { children: [{ text: 'Nested' }], type: 'p' },
          { children: [{ text: 'Tail' }], type: 'p' },
        ],
        type: 'blockquote',
      },
    ]);
  });

  it('routes blockquote reverse-tab through the v2 liftBlock transform', () => {
    const editor = createPlateRuntimeEditor({
      initialValue: [
        {
          children: [{ children: [{ text: 'Quote' }], type: 'p' }],
          type: 'blockquote',
        },
        {
          children: [{ children: [{ text: 'Other' }], type: 'p' }],
          type: 'blockquote',
        },
      ],
      plugins: [createRuntimeBlockquotePlugin()],
    });

    editor.update((tx) => {
      tx.selection.set({ offset: 0, path: [0, 0, 0] });
    });

    expect(editor.tf.tab({ reverse: true })).toBe(true);
    expect(editor.read((state) => state.value.root())).toEqual([
      { children: [{ text: 'Quote' }], type: 'p' },
      {
        children: [{ children: [{ text: 'Other' }], type: 'p' }],
        type: 'blockquote',
      },
    ]);
  });

  it('routes caption arrow-up focus through the v2 operation pipeline', async () => {
    const CaptionPlugin = createRuntimeCaptionPlugin();
    const editor = createPlateRuntimeEditor({
      initialValue: [
        {
          caption: [{ text: 'caption' }],
          children: [{ text: '' }],
          type: 'media',
        },
      ],
      plugins: [MediaPlugin, CaptionPlugin],
    });

    editor.dom.currentKeyboardEvent = { key: 'ArrowUp' } as never;
    editor.update((tx) => {
      tx.selection.set({ offset: 0, path: [0, 0] });
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(editor.getOption(CaptionPlugin, 'focusEndPath')).toEqual([0]);
  });

  it('routes caption down movement through the v2 moveLine transform', () => {
    const CaptionPlugin = createRuntimeCaptionPlugin();
    const editor = createPlateRuntimeEditor({
      initialSelection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      initialValue: [
        {
          caption: [{ text: '' }],
          children: [{ text: '' }],
          type: 'media',
        },
      ],
      plugins: [MediaPlugin, CaptionPlugin],
    });

    expect(editor.tf.moveLine({ reverse: false })).toBe(true);
    expect(editor.getOption(CaptionPlugin, 'focusEndPath')).toEqual([0]);
  });

  it('routes trigger-combobox overrides through v2 insertText', () => {
    const withTriggerCombobox = () => ({ transforms: {} });
    const TriggerInputPlugin = createSlatePlugin({
      key: 'trigger_input',
      node: { isElement: true, isInline: true, isVoid: true },
    });
    const TriggerComboboxPlugin = createSlatePlugin({
      key: 'triggerCombobox',
      options: {
        trigger: '@',
        triggerPreviousCharPattern: /^$|^\s$/,
        createComboboxInput: (trigger: string) => ({
          children: [{ text: '' }],
          trigger,
          type: 'trigger_input',
        }),
      },
      plugins: [TriggerInputPlugin],
    }).overrideEditor(withTriggerCombobox);
    const editor = createPlateRuntimeEditor({
      initialValue: [{ children: [{ text: 'hello ' }], type: 'p' }],
      plugins: [TriggerComboboxPlugin],
      userId: 'user-1',
    });

    editor.update((tx) => {
      tx.selection.set({
        anchor: { offset: 6, path: [0, 0] },
        focus: { offset: 6, path: [0, 0] },
      });
    });

    expect(editor.tf.insertText('@')).toBe(true);
    expect(editor.read((state) => state.value.root())).toEqual([
      {
        children: [
          { text: 'hello ' },
          {
            children: [{ text: '' }],
            trigger: '@',
            type: 'trigger_input',
            userId: 'user-1',
          },
          { text: '' },
        ],
        type: 'p',
      },
    ]);
  });

  it('falls back to plain text when trigger-combobox gates reject input', () => {
    const withTriggerCombobox = () => ({ transforms: {} });
    const TriggerComboboxPlugin = createSlatePlugin({
      key: 'triggerCombobox',
      options: {
        trigger: '@',
        triggerPreviousCharPattern: /^$|^\s$/,
      },
    }).overrideEditor(withTriggerCombobox);
    const QueryComboboxPlugin = createSlatePlugin({
      key: 'queryCombobox',
      options: {
        trigger: '@',
        triggerPreviousCharPattern: /^$|^\s$/,
        triggerQuery: () => false,
      },
    }).overrideEditor(withTriggerCombobox);
    const wordEditor = createPlateRuntimeEditor({
      initialValue: [{ children: [{ text: 'hello' }], type: 'p' }],
      plugins: [TriggerComboboxPlugin],
    });
    const queryEditor = createPlateRuntimeEditor({
      initialValue: [{ children: [{ text: '' }], type: 'p' }],
      plugins: [QueryComboboxPlugin],
    });
    const atEditor = createPlateRuntimeEditor({
      initialValue: [{ children: [{ text: 'hello' }], type: 'p' }],
      plugins: [TriggerComboboxPlugin],
    });

    wordEditor.update((tx) => {
      tx.selection.set({
        anchor: { offset: 5, path: [0, 0] },
        focus: { offset: 5, path: [0, 0] },
      });
    });
    queryEditor.update((tx) => {
      tx.selection.set({
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      });
    });

    expect(wordEditor.tf.insertText('@')).toBe(true);
    expect(queryEditor.tf.insertText('@')).toBe(true);
    expect(
      atEditor.tf.insertText('@', { at: { offset: 0, path: [0, 0] } })
    ).toBe(true);

    expect(wordEditor.read((state) => state.value.root())).toEqual([
      { children: [{ text: 'hello@' }], type: 'p' },
    ]);
    expect(queryEditor.read((state) => state.value.root())).toEqual([
      { children: [{ text: '@' }], type: 'p' },
    ]);
    expect(atEditor.read((state) => state.value.root())).toEqual([
      { children: [{ text: '@hello' }], type: 'p' },
    ]);
  });

  it('routes multiselect tag cleanup through a v2 commit hook', () => {
    const MultiSelectPlugin = createRuntimeMultiSelectPlugin();
    const editor = createPlateRuntimeEditor({
      initialValue: [
        {
          children: [
            { text: '  query' },
            { children: [{ text: '' }], type: 'tag', value: 'alpha' },
            { text: '' },
            { children: [{ text: '' }], type: 'tag', value: 'alpha' },
            { text: '' },
          ],
          type: 'p',
        },
      ],
      plugins: [MultiSelectPlugin],
    });

    editor.update((tx) => {
      tx.normalize({ force: true });
    });

    const children = editor.read((state) => state.value.root())[0]
      .children as Record<string, unknown>[];
    const tags = children.filter((node) => node.type === 'tag');
    const nonEmptyTexts = children.filter(
      (node) => typeof node.text === 'string' && node.text.length > 0
    );

    expect(tags).toHaveLength(1);
    expect(tags[0]).toMatchObject({ type: 'tag', value: 'alpha' });
    expect(nonEmptyTexts).toEqual([]);
  });

  it('keeps selected multiselect search text and trims leading whitespace', () => {
    const MultiSelectPlugin = createRuntimeMultiSelectPlugin();
    const editor = createPlateRuntimeEditor({
      initialSelection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 7, path: [0, 0] },
      },
      initialValue: [
        {
          children: [{ text: '  query' }],
          type: 'p',
        },
        {
          children: [{ text: ' stale' }],
          type: 'p',
        },
      ],
      plugins: [MultiSelectPlugin],
    });

    editor.update((tx) => {
      tx.text.insert('!', { at: { offset: 7, path: [0, 0] } });
    });

    expect(editor.read((state) => state.value.root())).toEqual([
      { children: [{ text: 'query!' }], type: 'p' },
      { children: [{ text: '' }], type: 'p' },
    ]);
  });

  it('routes multiselect deleteBackward cursor repair through v2 transforms', () => {
    const MultiSelectPlugin = createRuntimeMultiSelectPlugin();
    const editor = createPlateRuntimeEditor({
      initialSelection: {
        anchor: { offset: 1, path: [0, 1] },
        focus: { offset: 1, path: [0, 1] },
      },
      initialValue: [
        {
          children: [
            { children: [{ text: '' }], type: 'tag', value: 'alpha' },
            { text: 'x' },
            { text: '' },
          ],
          type: 'p',
        },
      ],
      plugins: [MultiSelectPlugin],
    });

    expect(editor.tf.deleteBackward('character')).toBe(true);
    expect(editor.read((state) => state.selection.get())).not.toEqual({
      anchor: { offset: 0, path: [0, 1] },
      focus: { offset: 0, path: [0, 1] },
    });
  });

  it('keeps runtime insertExitBreak as a v2 insert transaction', () => {
    const editor = createPlateRuntimeEditor({
      initialValue: [{ children: [{ text: 'test' }], type: 'p' }],
      plugins: [SlateExtensionPlugin],
    });

    editor.update((tx) => {
      tx.selection.set({ offset: 4, path: [0, 0] });
    });

    expect(editor.tf.insertExitBreak()).toBe(true);
    expect(editor.read((state) => state.value.root())).toEqual([
      { children: [{ text: 'test' }], type: 'p' },
      { children: [{ text: '' }], type: 'p' },
    ]);
    expect(editor.read((state) => state.selection.get())).toEqual({
      anchor: { offset: 0, path: [1, 0] },
      focus: { offset: 0, path: [1, 0] },
    });
  });

  it('keeps runtime insertExitBreak reverse insertion', () => {
    const editor = createPlateRuntimeEditor({
      initialValue: [{ children: [{ text: 'test' }], type: 'p' }],
      plugins: [SlateExtensionPlugin],
    });

    editor.update((tx) => {
      tx.selection.set({ offset: 0, path: [0, 0] });
    });

    expect(editor.tf.insertExitBreak({ reverse: true })).toBe(true);
    expect(editor.read((state) => state.value.root())).toEqual([
      { children: [{ text: '' }], type: 'p' },
      { children: [{ text: 'test' }], type: 'p' },
    ]);
    expect(editor.read((state) => state.selection.get())).toEqual({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    });
  });

  it('keeps runtime insertExitBreak strict-sibling ancestor targeting', () => {
    const editor = createPlateRuntimeEditor({
      initialValue: [
        {
          children: [
            {
              children: [{ text: 'code' }],
              type: 'codeline',
            },
          ],
          type: 'codeblock',
        },
      ],
      plugins: [
        SlateExtensionPlugin,
        createSlatePlugin({
          key: 'codeblock',
          node: {
            isElement: true,
            isStrictSiblings: false,
            type: 'codeblock',
          },
        }),
        createSlatePlugin({
          key: 'codeline',
          node: {
            isElement: true,
            isStrictSiblings: true,
            type: 'codeline',
          },
        }),
      ],
    });

    editor.update((tx) => {
      tx.selection.set({ offset: 4, path: [0, 0, 0] });
    });

    expect(editor.tf.insertExitBreak()).toBe(true);
    expect(editor.read((state) => state.value.root())).toEqual([
      {
        children: [
          {
            children: [{ text: 'code' }],
            type: 'codeline',
          },
        ],
        type: 'codeblock',
      },
      { children: [{ text: '' }], type: 'p' },
    ]);
  });

  it('keeps runtime insertBreak as a Slate v2 break transaction', () => {
    const editor = createPlateRuntimeEditor({
      initialValue: [{ children: [{ text: 'runtime' }], type: 'p' }],
    });

    editor.update((tx) => {
      tx.selection.set({ offset: 3, path: [0, 0] });
    });

    expect(editor.tf.insertBreak()).toBe(true);
    expect(editor.read((state) => state.value.root())).toEqual([
      { children: [{ text: 'run' }], type: 'p' },
      { children: [{ text: 'time' }], type: 'p' },
    ]);
    expect(editor.read((state) => state.selection.get())).toEqual({
      anchor: { offset: 0, path: [1, 0] },
      focus: { offset: 0, path: [1, 0] },
    });
  });

  it('routes OverridePlugin empty break reset through runtime node transactions', () => {
    const RuntimeOverrideBreakPlugin = createSlatePlugin({
      key: 'override',
    })
      .overrideEditor(withOverrides)
      .overrideEditor(withBreakRules);
    const HeadingPlugin = createSlatePlugin({
      key: 'heading',
      node: { isElement: true, type: 'heading' },
      rules: { break: { empty: 'reset' } },
    });
    const editor = createPlateRuntimeEditor({
      initialValue: [{ children: [{ text: '' }], type: 'heading' }],
      plugins: [RuntimeOverrideBreakPlugin, HeadingPlugin],
    });

    editor.update((tx) => {
      tx.selection.set({ offset: 0, path: [0, 0] });
    });

    expect(editor.tf.insertBreak()).toBe(true);
    expect(editor.read((state) => state.value.root())).toEqual([
      { children: [{ text: '' }], type: 'p' },
    ]);
  });

  it('preserves Plate lineBreak rules as newline insertion', () => {
    const RuntimeOverrideBreakPlugin = createSlatePlugin({
      key: 'override',
    })
      .overrideEditor(withOverrides)
      .overrideEditor(withBreakRules);
    const CalloutPlugin = createSlatePlugin({
      key: 'callout',
      node: { isElement: true, type: 'callout' },
      rules: { break: { default: 'lineBreak' } },
    });
    const editor = createPlateRuntimeEditor({
      initialValue: [{ children: [{ text: 'onetwo' }], type: 'callout' }],
      plugins: [RuntimeOverrideBreakPlugin, CalloutPlugin],
    });

    editor.update((tx) => {
      tx.selection.set({ offset: 3, path: [0, 0] });
    });

    expect(editor.tf.insertBreak()).toBe(true);
    expect(editor.read((state) => state.value.root())).toEqual([
      { children: [{ text: 'one\ntwo' }], type: 'callout' },
    ]);
    expect(editor.read((state) => state.selection.get())).toEqual({
      anchor: { offset: 4, path: [0, 0] },
      focus: { offset: 4, path: [0, 0] },
    });
  });

  it('routes emptyLineEnd deleteExit break rules through v2 delete and insert transactions', () => {
    const RuntimeOverrideBreakPlugin = createSlatePlugin({
      key: 'override',
    })
      .overrideEditor(withOverrides)
      .overrideEditor(withBreakRules);
    const CalloutPlugin = createSlatePlugin({
      key: 'callout',
      node: { isElement: true, type: 'callout' },
      rules: { break: { emptyLineEnd: 'deleteExit' } },
    });
    const editor = createPlateRuntimeEditor({
      initialValue: [{ children: [{ text: 'one\n' }], type: 'callout' }],
      plugins: [RuntimeOverrideBreakPlugin, CalloutPlugin],
    });

    editor.update((tx) => {
      tx.selection.set({ offset: 4, path: [0, 0] });
    });

    expect(editor.tf.insertBreak()).toBe(true);
    expect(editor.read((state) => state.value.root())).toEqual([
      { children: [{ text: 'one' }], type: 'callout' },
      { children: [{ text: '' }], type: 'p' },
    ]);
    expect(editor.read((state) => state.selection.get())).toEqual({
      anchor: { offset: 0, path: [1, 0] },
      focus: { offset: 0, path: [1, 0] },
    });
  });

  it('resets splitReset continuations after the v2 break transaction', () => {
    const RuntimeOverrideBreakPlugin = createSlatePlugin({
      key: 'override',
    })
      .overrideEditor(withOverrides)
      .overrideEditor(withBreakRules);
    const HeadingPlugin = createSlatePlugin({
      key: 'heading',
      node: { isElement: true, type: 'heading' },
      rules: { break: { splitReset: true } },
    });
    const editor = createPlateRuntimeEditor({
      initialValue: [{ children: [{ text: 'Title' }], type: 'heading' }],
      plugins: [RuntimeOverrideBreakPlugin, HeadingPlugin],
    });

    editor.update((tx) => {
      tx.selection.set({ offset: 2, path: [0, 0] });
    });

    expect(editor.tf.insertBreak()).toBe(true);
    expect(editor.read((state) => state.value.root())).toEqual([
      { children: [{ text: 'Ti' }], type: 'heading' },
      { children: [{ text: 'tle' }], type: 'p' },
    ]);
  });

  it('routes OverridePlugin start delete reset through runtime node transactions', () => {
    const RuntimeOverrideDeletePlugin = createSlatePlugin({
      key: 'override',
    })
      .overrideEditor(withOverrides)
      .overrideEditor(withBreakRules)
      .overrideEditor(withDeleteRules);
    const CalloutPlugin = createSlatePlugin({
      key: 'callout',
      node: { isElement: true, type: 'callout' },
      rules: { delete: { start: 'reset' } },
    });
    const editor = createPlateRuntimeEditor({
      initialValue: [{ children: [{ text: 'Callout' }], type: 'callout' }],
      plugins: [RuntimeOverrideDeletePlugin, CalloutPlugin],
    });

    editor.update((tx) => {
      tx.selection.set({ offset: 0, path: [0, 0] });
    });

    expect(editor.tf.deleteBackward()).toBe(true);
    expect(editor.read((state) => state.value.root())).toEqual([
      { children: [{ text: 'Callout' }], type: 'p' },
    ]);
  });

  it('routes OverridePlugin empty delete reset after start falls through', () => {
    const RuntimeOverrideDeletePlugin = createSlatePlugin({
      key: 'override',
    })
      .overrideEditor(withOverrides)
      .overrideEditor(withBreakRules)
      .overrideEditor(withDeleteRules);
    const EmptyPlugin = createSlatePlugin({
      key: 'emptyBlock',
      node: { isElement: true, type: 'emptyBlock' },
      rules: { delete: { empty: 'reset' } },
    });
    const editor = createPlateRuntimeEditor({
      initialValue: [{ children: [{ text: '' }], type: 'emptyBlock' }],
      plugins: [RuntimeOverrideDeletePlugin, EmptyPlugin],
    });

    editor.update((tx) => {
      tx.selection.set({ offset: 0, path: [0, 0] });
    });

    expect(editor.tf.deleteBackward()).toBe(true);
    expect(editor.read((state) => state.value.root())).toEqual([
      { children: [{ text: '' }], type: 'p' },
    ]);
  });

  it('lifts matched delete rules through the runtime liftBlock route', () => {
    const RuntimeOverrideDeletePlugin = createSlatePlugin({
      key: 'override',
    })
      .overrideEditor(withOverrides)
      .overrideEditor(withBreakRules)
      .overrideEditor(withDeleteRules);
    const BlockquotePlugin = createSlatePlugin({
      key: 'blockquote',
      node: { isElement: true, type: 'blockquote' },
      rules: {
        delete: { start: 'lift' },
        match: ({ rule }) => rule === 'delete.start',
      },
    });
    const editor = createPlateRuntimeEditor({
      initialValue: [
        {
          children: [{ children: [{ text: 'Quote' }], type: 'p' }],
          type: 'blockquote',
        },
      ],
      plugins: [RuntimeOverrideDeletePlugin, BlockquotePlugin],
    });

    editor.update((tx) => {
      tx.selection.set({ offset: 0, path: [0, 0, 0] });
    });

    expect(editor.tf.deleteBackward()).toBe(true);
    expect(editor.read((state) => state.value.root())).toEqual([
      { children: [{ text: 'Quote' }], type: 'p' },
    ]);
  });

  it('resets the first block when deleting at the editor start', () => {
    const editor = createPlateRuntimeEditor({
      initialValue: [{ children: [{ text: 'Heading' }], type: 'heading' }],
    });

    editor.update((tx) => {
      tx.selection.set({ offset: 0, path: [0, 0] });
    });

    expect(editor.tf.deleteBackward()).toBe(true);
    expect(editor.read((state) => state.value.root())).toEqual([
      { children: [{ text: 'Heading' }], type: 'p' },
    ]);
  });

  it('uses normal v2 backward deletion away from the block start', () => {
    const RuntimeOverrideDeletePlugin = createSlatePlugin({
      key: 'override',
    })
      .overrideEditor(withOverrides)
      .overrideEditor(withBreakRules)
      .overrideEditor(withDeleteRules);
    const HeadingPlugin = createSlatePlugin({
      key: 'heading',
      node: { isElement: true, type: 'heading' },
      rules: { delete: { start: 'reset' } },
    });
    const editor = createPlateRuntimeEditor({
      initialValue: [{ children: [{ text: 'Heading' }], type: 'heading' }],
      plugins: [RuntimeOverrideDeletePlugin, HeadingPlugin],
    });

    editor.update((tx) => {
      tx.selection.set({ offset: 4, path: [0, 0] });
    });

    expect(editor.tf.deleteBackward()).toBe(true);
    expect(editor.read((state) => state.value.root())).toEqual([
      { children: [{ text: 'Heaing' }], type: 'heading' },
    ]);
    expect(editor.read((state) => state.selection.get())).toEqual({
      anchor: { offset: 3, path: [0, 0] },
      focus: { offset: 3, path: [0, 0] },
    });
  });

  it('resets the editor after deleting the full document fragment', () => {
    const editor = createPlateRuntimeEditor({
      initialValue: [
        { custom: true, children: [{ text: 'one' }], type: 'p' },
        { children: [{ text: 'two' }], type: 'p' },
      ],
    });

    editor.update((tx) => {
      tx.selection.set({
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 3, path: [1, 0] },
      });
    });

    expect(editor.tf.deleteFragment()).toBe(true);
    expect(editor.read((state) => state.value.root())).toEqual([
      { children: [{ text: '' }], type: 'p' },
    ]);
    expect(editor.read((state) => state.selection.get())).toEqual({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    });
  });

  it('routes OverridePlugin merge removeEmpty rules through the Slate v2 merge query', () => {
    const RuntimeOverrideMergePlugin = createSlatePlugin({
      key: 'override',
    })
      .overrideEditor(withOverrides)
      .overrideEditor(withMergeRules);
    const ParagraphPlugin = createSlatePlugin({
      key: 'paragraph',
      node: { isElement: true, type: 'p' },
      rules: { merge: { removeEmpty: true } },
    });
    const editor = createPlateRuntimeEditor({
      initialValue: [
        { children: [{ text: '' }], type: 'p' },
        { children: [{ text: 'content' }], type: 'p' },
      ],
      plugins: [RuntimeOverrideMergePlugin, ParagraphPlugin],
    });

    editor.update((tx) => {
      tx.selection.set({ offset: 0, path: [1, 0] });
    });

    expect(editor.tf.deleteBackward()).toBe(true);
    expect(editor.read((state) => state.value.root())).toEqual([
      { children: [{ text: 'content' }], type: 'p' },
    ]);
    expect(editor.read((state) => state.selection.get())).toEqual({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    });
  });

  it('keeps empty custom merge targets by default in the runtime merge query', () => {
    const RuntimeOverrideMergePlugin = createSlatePlugin({
      key: 'override',
    })
      .overrideEditor(withOverrides)
      .overrideEditor(withMergeRules);
    const CustomPlugin = createSlatePlugin({
      key: 'custom',
      node: { isElement: true, type: 'custom' },
    });
    const editor = createPlateRuntimeEditor({
      initialValue: [
        { children: [{ text: '' }], type: 'custom' },
        { children: [{ text: 'content' }], type: 'custom' },
      ],
      plugins: [RuntimeOverrideMergePlugin, CustomPlugin],
    });

    editor.update((tx) => {
      tx.selection.set({ offset: 0, path: [1, 0] });
    });

    expect(editor.tf.deleteBackward()).toBe(true);
    expect(editor.read((state) => state.value.root())).toEqual([
      { children: [{ text: 'content' }], type: 'custom' },
    ]);
    expect(editor.read((state) => state.selection.get())).toEqual({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    });
  });

  it('lets match override rules veto runtime empty-target merge removal', () => {
    const RuntimeOverrideMergePlugin = createSlatePlugin({
      key: 'override',
    })
      .overrideEditor(withOverrides)
      .overrideEditor(withMergeRules);
    const ParagraphPlugin = createSlatePlugin({
      key: 'paragraph',
      node: { isElement: true, type: 'p' },
      rules: { merge: { removeEmpty: true } },
    });
    const MatchOverridePlugin = createSlatePlugin({
      key: 'matchOverride',
      node: { isElement: true, type: 'matchOverride' },
      rules: {
        match: ({ node, rule }) =>
          rule === 'merge.removeEmpty' &&
          typeof node === 'object' &&
          node !== null &&
          'customProperty' in node,
        merge: { removeEmpty: false },
      },
    });
    const editor = createPlateRuntimeEditor({
      initialValue: [
        {
          children: [{ text: '' }],
          customProperty: true,
          type: 'p',
        },
        { children: [{ text: 'content' }], type: 'p' },
      ],
      plugins: [
        RuntimeOverrideMergePlugin,
        ParagraphPlugin,
        MatchOverridePlugin,
      ],
    });

    editor.update((tx) => {
      tx.selection.set({ offset: 0, path: [1, 0] });
    });

    expect(editor.tf.deleteBackward()).toBe(true);
    expect(editor.read((state) => state.value.root())).toEqual([
      {
        children: [{ text: 'content' }],
        customProperty: true,
        type: 'p',
      },
    ]);
    expect(editor.read((state) => state.selection.get())).toEqual({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    });
  });

  it('routes OverridePlugin normalize removeEmpty rules through v2 node normalizers', () => {
    const RuntimeOverrideNormalizePlugin = createSlatePlugin({
      key: 'override',
    })
      .overrideEditor(withOverrides)
      .overrideEditor(withNormalizeRules);
    const EmptyBlockPlugin = createSlatePlugin({
      key: 'emptyBlock',
      node: { isElement: true, type: 'emptyBlock' },
      rules: { normalize: { removeEmpty: true } },
    });
    const editor = createPlateRuntimeEditor({
      initialValue: [
        { children: [{ text: '' }], type: 'emptyBlock' },
        { children: [{ text: 'after' }], type: 'p' },
      ],
      plugins: [RuntimeOverrideNormalizePlugin, EmptyBlockPlugin],
    });

    editor.update((tx) => {
      tx.normalize({ force: true });
    });

    expect(editor.read((state) => state.value.root())).toEqual([
      { children: [{ text: 'after' }], type: 'p' },
    ]);
  });

  it('keeps empty normalized targets by default on the runtime route', () => {
    const RuntimeOverrideNormalizePlugin = createSlatePlugin({
      key: 'override',
    })
      .overrideEditor(withOverrides)
      .overrideEditor(withNormalizeRules);
    const EmptyBlockPlugin = createSlatePlugin({
      key: 'emptyBlock',
      node: { isElement: true, type: 'emptyBlock' },
    });
    const editor = createPlateRuntimeEditor({
      initialValue: [
        { children: [{ text: '' }], type: 'emptyBlock' },
        { children: [{ text: 'after' }], type: 'p' },
      ],
      plugins: [RuntimeOverrideNormalizePlugin, EmptyBlockPlugin],
    });

    editor.update((tx) => {
      tx.normalize({ force: true });
    });

    expect(editor.read((state) => state.value.root())).toEqual([
      { children: [{ text: '' }], type: 'emptyBlock' },
      { children: [{ text: 'after' }], type: 'p' },
    ]);
  });

  it('lets match override rules force runtime empty-target normalization', () => {
    const RuntimeOverrideNormalizePlugin = createSlatePlugin({
      key: 'override',
    })
      .overrideEditor(withOverrides)
      .overrideEditor(withNormalizeRules);
    const ParagraphPlugin = createSlatePlugin({
      key: 'paragraph',
      node: { isElement: true, type: 'paragraph' },
    });
    const MatchOverridePlugin = createSlatePlugin({
      key: 'matchOverride',
      node: { isElement: true, type: 'matchOverride' },
      rules: {
        match: ({ node, rule }) =>
          rule === 'normalize.removeEmpty' &&
          typeof node === 'object' &&
          node !== null &&
          'customProperty' in node,
        normalize: { removeEmpty: true },
      },
    });
    const editor = createPlateRuntimeEditor({
      initialValue: [
        { children: [{ text: '' }], customProperty: true, type: 'paragraph' },
        { children: [{ text: 'after' }], type: 'p' },
      ],
      plugins: [
        RuntimeOverrideNormalizePlugin,
        ParagraphPlugin,
        MatchOverridePlugin,
      ],
    });

    editor.update((tx) => {
      tx.normalize({ force: true });
    });

    expect(editor.read((state) => state.value.root())).toEqual([
      { children: [{ text: 'after' }], type: 'p' },
    ]);
  });

  it('lets match override rules veto runtime empty-target normalization', () => {
    const RuntimeOverrideNormalizePlugin = createSlatePlugin({
      key: 'override',
    })
      .overrideEditor(withOverrides)
      .overrideEditor(withNormalizeRules);
    const ParagraphPlugin = createSlatePlugin({
      key: 'paragraph',
      node: { isElement: true, type: 'paragraph' },
      rules: { normalize: { removeEmpty: true } },
    });
    const MatchOverridePlugin = createSlatePlugin({
      key: 'matchOverride',
      node: { isElement: true, type: 'matchOverride' },
      rules: {
        match: ({ node, rule }) =>
          rule === 'normalize.removeEmpty' &&
          typeof node === 'object' &&
          node !== null &&
          'customProperty' in node,
        normalize: { removeEmpty: false },
      },
    });
    const editor = createPlateRuntimeEditor({
      initialValue: [
        { children: [{ text: '' }], customProperty: true, type: 'paragraph' },
        { children: [{ text: 'after' }], type: 'p' },
      ],
      plugins: [
        RuntimeOverrideNormalizePlugin,
        ParagraphPlugin,
        MatchOverridePlugin,
      ],
    });

    editor.update((tx) => {
      tx.normalize({ force: true });
    });

    expect(editor.read((state) => state.value.root())).toEqual([
      { children: [{ text: '' }], customProperty: true, type: 'paragraph' },
      { children: [{ text: 'after' }], type: 'p' },
    ]);
  });

  it('routes NavigationFeedbackPlugin api and transforms through the runtime facade', () => {
    const editor = createPlateRuntimeEditor({
      initialValue: [{ children: [{ text: 'one' }], type: 'p' }],
      plugins: [NavigationFeedbackPlugin],
    });
    const navigationApi = editor.api as typeof editor.api &
      NavigationRuntimeApi;
    const navigationTf = editor.tf as typeof editor.tf &
      NavigationRuntimeTransforms;

    expect(navigationApi.navigation.activeTarget()).toBeNull();

    expect(
      navigationTf.navigation.flashTarget({
        duration: 1000,
        target: { path: [0], type: 'node' },
      })
    ).toBe(true);
    expect(navigationApi.navigation.activeTarget()).toEqual({
      cycle: 1,
      duration: 1000,
      path: [0],
      pulse: 1,
      type: 'node',
      variant: 'navigated',
    });

    editor.update((tx) => {
      tx.nodes.insert({ children: [{ text: 'zero' }], type: 'p' }, { at: [0] });
    });

    expect(navigationApi.navigation.activeTarget()?.path).toEqual([1]);
    expect(navigationApi.navigation.isTarget([1])).toBe(true);
    expect(navigationApi.navigation.isTarget([0])).toBe(false);

    expect(
      navigationTf.navigation.navigate({
        flash: false,
        focus: false,
        scroll: false,
        select: {
          anchor: { offset: 1, path: [1, 0] },
          focus: { offset: 1, path: [1, 0] },
        },
        target: { path: [1], type: 'node' },
      })
    ).toBe(true);
    expect(editor.read((state) => state.selection.get())).toEqual({
      anchor: { offset: 1, path: [1, 0] },
      focus: { offset: 1, path: [1, 0] },
    });

    navigationTf.navigation.clear();
    expect(navigationApi.navigation.activeTarget()).toBeNull();
  });

  it('routes ParserPlugin insertData through parser hooks and v2 fragment insertion', () => {
    const preInsert = mock(() => false);
    const createParagraph = (text: string): SlateElement => ({
      children: [{ text }],
      type: 'p',
    });
    const PlainPlugin = createSlatePlugin({
      key: 'plain',
      parser: {
        format: 'plain',
        query: ({ data }) => data === 'hello',
        deserialize: ({ data }) => [createParagraph(data)],
      },
    });
    const InjectedParserPlugin = createSlatePlugin({
      key: 'plainInjector',
      inject: {
        plugins: {
          plain: {
            parser: {
              preInsert,
              transformData: ({ data }) => `${data}-world`,
              transformFragment: ({ fragment }) => [
                ...fragment,
                createParagraph('tail'),
              ],
            },
          },
        },
      },
    });
    const editor = createPlateRuntimeEditor({
      initialValue: [{ children: [{ text: '' }], type: 'p' }],
      plugins: [ParserPlugin, PlainPlugin, InjectedParserPlugin],
    });
    const dataTransfer = {
      files: [] as unknown as FileList,
      getData: mock((mimeType: string) =>
        mimeType === 'text/plain' ? 'hello' : ''
      ),
    } satisfies Pick<DataTransfer, 'files' | 'getData'>;

    expect(editor.tf.insertData(dataTransfer as DataTransfer)).toBe(true);
    expect(preInsert).toHaveBeenCalledOnce();
    expect(editor.read((state) => state.value.root())).toEqual([
      createParagraph('hello-world'),
      createParagraph('tail'),
    ]);
  });

  it('registers plugin tx groups and the Plate transform facade', () => {
    const nextValue: Value = [
      { children: [{ text: 'changed through tx' }], type: 'p' },
    ];
    const TxPlugin = createSlatePlugin({
      key: 'txPlugin',
    })
      .extendTx(() => ({
        txPlugin: (tx: EditorUpdateTransaction<Value>) => ({
          replace: () => tx.value.replace({ children: nextValue }),
        }),
      }))
      .extendTransforms(({ editor }) => ({
        replace: () => editor.update((tx) => tx.txPlugin.replace()),
      }));
    const DirectTxPlugin = {
      key: 'directTxPlugin',
      tx: {
        txPlugin: (tx: EditorUpdateTransaction<Value>) => ({
          replace: () => tx.value.replace({ children: nextValue }),
        }),
      },
    };

    const editor = createPlateRuntimeEditor({
      initialValue: value,
      plugins: [TxPlugin],
    });
    const assertTxInference = (
      tx: Parameters<Parameters<typeof editor.update>[0]>[0]
    ) => {
      tx.txPlugin.replace();
      // @ts-expect-error plugin tx groups should not degrade to any
      tx.txPlugin.missing();
    };

    expect(assertTxInference).toBeInstanceOf(Function);

    editor.update((tx) => {
      tx.txPlugin.replace();
    });

    expect(editor.read((state) => state.value.root())).toEqual(nextValue);
    expect(editor.tf.txPlugin.replace).toBe(
      editor.getTransforms<TxPluginTransforms>(TxPlugin).txPlugin.replace
    );

    editor.update((tx) => {
      tx.value.replace({ children: value });
    });
    editor.getTransforms<TxPluginTransforms>(TxPlugin).txPlugin.replace();
    expect(editor.read((state) => state.value.root())).toEqual(nextValue);

    const publicEditor = createPlateEditor<Value, typeof TxPlugin>({
      plugins: [TxPlugin],
      runtime: 'slate-v2',
      value,
    });
    const assertPublicTxInference = (
      tx: Parameters<Parameters<typeof publicEditor.update>[0]>[0]
    ) => {
      tx.txPlugin.replace();
      // @ts-expect-error plugin tx groups should not degrade to any
      tx.txPlugin.missing();
    };

    expect(assertPublicTxInference).toBeInstanceOf(Function);

    publicEditor.update((tx) => {
      tx.txPlugin.replace();
    });

    expect(publicEditor.read((state) => state.value.root())).toEqual(nextValue);

    const directEditor = createPlateRuntimeEditor({
      initialValue: value,
      plugins: [DirectTxPlugin],
    });

    directEditor.update((tx) => {
      tx.txPlugin.replace();
    });

    expect(directEditor.read((state) => state.value.root())).toEqual(nextValue);
  });

  it('resolves nested configurePlugin metadata', () => {
    const ChildPlugin = createSlatePlugin({
      key: 'child',
      options: { count: 1, label: 'child' },
    });
    const ParentPlugin = createSlatePlugin({
      key: 'parent',
      plugins: [ChildPlugin],
    }).configurePlugin(ChildPlugin, {
      options: { count: 2 },
    });

    const editor = createPlateRuntimeEditor({
      initialValue: value,
      plugins: [ParentPlugin],
    });

    expect(editor.getOptions({ key: 'child' })).toEqual({
      count: 2,
      label: 'child',
    });
  });

  it('applies runtime transformInitialValue plugins in plugin order', () => {
    const FirstPlugin = createSlatePlugin({
      key: 'firstInitialValue',
      transformInitialValue: ({ value: initialValue }) =>
        initialValue.map((node) => ({
          ...node,
          count: ((node as { count?: number }).count ?? 0) + 1,
        })),
    });
    const SecondPlugin = createSlatePlugin({
      key: 'secondInitialValue',
      transformInitialValue: ({ value: initialValue }) =>
        initialValue.map((node) => ({
          ...node,
          count: ((node as { count?: number }).count ?? 0) + 1,
        })),
    });
    const editor = createPlateRuntimeEditor({
      initialValue: [{ children: [{ text: 'runtime' }], count: 0, type: 'p' }],
      plugins: [FirstPlugin, SecondPlugin],
    });

    expect(editor.read((state) => state.value.root())).toEqual([
      { children: [{ text: 'runtime' }], count: 2, type: 'p' },
    ]);
  });

  it('skips runtime transformInitialValue for read-only editOnly plugins', () => {
    const callCount = mock();
    const RuntimePlugin = createSlatePlugin({
      key: 'skipInitialValue',
      editOnly: { transformInitialValue: true },
      transformInitialValue: ({ value: initialValue }) => {
        callCount();

        return initialValue.map((node) => ({
          ...node,
          count: ((node as { count?: number }).count ?? 0) + 1,
        }));
      },
    });
    const editor = createPlateRuntimeEditor({
      initialValue: [{ children: [{ text: 'runtime' }], count: 0, type: 'p' }],
      plugins: [RuntimePlugin],
      readOnly: true,
    });

    expect(callCount).not.toHaveBeenCalled();
    expect(editor.read((state) => state.value.root())).toEqual([
      { children: [{ text: 'runtime' }], count: 0, type: 'p' },
    ]);
  });

  it('throws when a runtime transformInitialValue plugin returns undefined', () => {
    const RuntimePlugin = createSlatePlugin({
      key: 'badInitialValue',
      transformInitialValue: (() => {}) as never,
    });

    expect(() =>
      createPlateRuntimeEditor({
        initialValue: value,
        plugins: [RuntimePlugin],
      })
    ).toThrow('Plugin "badInitialValue" transformInitialValue must return');
  });

  it('keeps runtime init as a v2 lifecycle value replacement', () => {
    const onReady = mock();
    const RuntimePlugin = createSlatePlugin({
      key: 'runtimeInitValue',
      transformInitialValue: ({ value: initialValue }) =>
        initialValue.map((node) => ({
          ...node,
          initialized: true,
        })),
    });
    const editor = createPlateRuntimeEditor({
      initialValue: [{ children: [{ text: 'seed' }], type: 'p' }],
      plugins: [SlateExtensionPlugin, RuntimePlugin],
    });

    expect(
      editor.tf.init({
        autoSelect: 'end',
        onReady,
        shouldNormalizeEditor: true,
        value: [{ children: [{ text: 'ready' }], type: 'p' }],
      })
    ).toBe(true);

    const nextValue = [
      { children: [{ text: 'ready' }], initialized: true, type: 'p' },
    ];

    expect(editor.read((state) => state.value.root())).toEqual(nextValue);
    expect(editor.read((state) => state.selection.get())).toEqual({
      anchor: { offset: 5, path: [0, 0] },
      focus: { offset: 5, path: [0, 0] },
    });
    expect(onReady).toHaveBeenCalledWith({
      editor,
      isAsync: false,
      value: nextValue,
    });
  });

  it('keeps runtime init async value and explicit selection semantics', async () => {
    const onReady = mock();
    const selection = {
      anchor: { offset: 1, path: [0, 0] },
      focus: { offset: 3, path: [0, 0] },
    };
    const nextValue = [{ children: [{ text: 'async' }], type: 'p' }];
    const editor = createPlateRuntimeEditor({
      initialValue: [{ children: [{ text: 'seed' }], type: 'p' }],
      plugins: [SlateExtensionPlugin],
    });

    expect(
      editor.tf.init({
        autoSelect: 'end',
        onReady,
        selection,
        value: () => Promise.resolve(nextValue),
      })
    ).toBe(true);

    await new Promise(process.nextTick);

    expect(editor.read((state) => state.value.root())).toEqual(nextValue);
    expect(editor.read((state) => state.selection.get())).toEqual(selection);
    expect(onReady).toHaveBeenCalledWith({
      editor,
      isAsync: true,
      value: nextValue,
    });
  });

  it('rejects plugins that need global command-surface packets', () => {
    const CommandPlugin = createSlatePlugin({
      key: 'command',
    }).extendEditorTransforms(() => ({
      command: () => false,
    }));

    expect(() =>
      createPlateRuntimeEditor({
        initialValue: value,
        plugins: [CommandPlugin],
      })
    ).toThrow('extends editor api/transforms');

    const ExtensionPlugin = createSlatePlugin({
      key: 'extension',
    }).extend(() => ({
      extendEditor: (editor: unknown) => editor,
    }));

    expect(() =>
      createPlateRuntimeEditor({
        initialValue: value,
        plugins: [ExtensionPlugin],
      })
    ).toThrow('uses extendEditor');

    const TransformPlugin = createSlatePlugin({
      key: 'transform',
    }).extendTransforms(({ editor }) => ({
      replace: () =>
        editor.update((tx) =>
          tx.value.replace({
            children: [{ children: [{ text: 'ok' }], type: 'p' }],
          })
        ),
    }));

    const transformEditor = createPlateRuntimeEditor({
      initialValue: value,
      plugins: [TransformPlugin],
    });

    transformEditor
      .getTransforms<TransformPluginTransforms>(TransformPlugin)
      .transform.replace();
    expect(transformEditor.read((state) => state.value.root())).toEqual([
      { children: [{ text: 'ok' }], type: 'p' },
    ]);
  });
});
