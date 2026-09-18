import { runInNewContext } from 'node:vm';

import React from 'react';

import { createEditorView, editorCommands, property, schema } from '../../core';
import { createEditor } from '../../lib/editor';
import type { AnyBasePlugin } from '../../lib/plugin/BasePlugin';
import { definePlugin as defineHeadlessPlugin } from '../../lib/plugin/definePlugin';
import { DebugPlugin } from '../../lib/plugins/debug/DebugPlugin';
import { BaseParagraphPlugin } from '../../lib/plugins/paragraph/BaseParagraphPlugin';
import { createEditor as createReactEditor } from '../../react/editor/withPlate';
import { definePlugin } from '../../react/plugin/definePlugin';
import { brandPluginDescriptor } from '../utils/mergePlugins';
import { getCompiledPlatePlugin, getPlateRuntime } from './compilePlateModel';
import { getPluginStore } from './pluginStore';
import { resolveAndSortPlugins, resolvePlugins } from './resolvePlugins';

const getSortedKeys = (plugins: readonly AnyBasePlugin[]) => {
  const editor = createEditor();

  return resolveAndSortPlugins(editor, plugins).map((plugin) => plugin.name);
};

describe('resolvePlugins', () => {
  it('compiles input-rule declarations once into the published runtime', () => {
    let calls = 0;
    const Plugin = defineHeadlessPlugin('singleInputRuleCompilation', {
      inputRules: () => {
        calls += 1;

        return [];
      },
    });

    createEditor({ plugins: [Plugin] });

    expect(calls).toBe(1);
  });

  it('installs required dependencies', () => {
    const names = getSortedKeys([
      defineHeadlessPlugin('parent', {
        dependencies: [
          defineHeadlessPlugin('dependency1', {}),
          defineHeadlessPlugin('dependency2', {}),
        ],
      }),
    ]);

    expect(names).toContain('parent');
    expect(names).toContain('dependency1');
    expect(names).toContain('dependency2');
  });

  it('exposes required dependency schema identity while author callbacks resolve', () => {
    const Dependency = defineHeadlessPlugin('schemaDependency', {
      schema: () => ({
        element: {
          ...schema.element.textBlock(),
        },
      }),
    });
    const Plugin = defineHeadlessPlugin('schemaConsumer', {
      dependencies: [Dependency],
    }).extend(({ editor }) => {
      const dependencyType = editor.plugin(Dependency).schema.type;

      return { api: () => ({ dependencyType: () => dependencyType }) };
    });
    const editor = createEditor({ plugins: [Plugin] });

    expect(editor.plugin(Plugin).api.dependencyType()).toBe('schemaDependency');
  });

  it('lowers node query descriptors through the final application schema', () => {
    const LinkPlugin = defineHeadlessPlugin('descriptorQueryLink', {
      schema: {
        element: {
          ...schema.element.textBlock(),
          properties: { url: property.string() },
        },
      },
    });
    const MarkPlugin = defineHeadlessPlugin('descriptorQueryMark', {
      schema: { mark: property.boolean() },
    });
    let correctionVisits = 0;
    let setCommandCalls = 0;
    const CorrectionPlugin = defineHeadlessPlugin('descriptorQueryCorrection', {
      commands: ({ around }) => [
        around(editorCommands.setNodes, ({ next }) => {
          setCommandCalls += 1;

          return next();
        }),
      ],
      corrections: [
        {
          correct: () => {
            correctionVisits += 1;
          },
          event: 'properties',
          query: { type: LinkPlugin },
        },
      ],
      dependencies: [LinkPlugin],
    });
    const editor = createEditor({
      initialValue: [
        {
          children: [{ text: 'Plate' }],
          type: 'persistedDescriptorQueryLink',
          url: '/docs',
        },
      ],
      plugins: [CorrectionPlugin, MarkPlugin],
      schema: {
        overrides: [
          schema.override(LinkPlugin, {
            element: { type: 'persistedDescriptorQueryLink' },
          }),
        ],
      },
    });

    expect(editor.plugin(LinkPlugin).schema.type).toBe(
      'persistedDescriptorQueryLink'
    );
    expect(
      editor.read.nodes.find({ at: [], type: 'persistedDescriptorQueryLink' })
    ).toBeDefined();
    expect(
      editor.read.nodes.find({
        at: [],
        match: (link) => link.url === '/docs',
        type: LinkPlugin,
      })
    ).toEqual([
      expect.objectContaining({
        type: 'persistedDescriptorQueryLink',
        url: '/docs',
      }),
      [0],
    ]);
    expect(editor.read.nodes.get([0], { type: LinkPlugin })?.[0]).toMatchObject(
      {
        type: 'persistedDescriptorQueryLink',
        url: '/docs',
      }
    );
    expect(
      editor.read.nodes.parent([0, 0], { type: LinkPlugin })?.[0]
    ).toMatchObject({
      type: 'persistedDescriptorQueryLink',
      url: '/docs',
    });

    setCommandCalls = 0;
    editor.update((tx) => {
      expect(tx.nodes.find({ at: [], type: LinkPlugin })?.[1]).toEqual([0]);
    });
    editor.update.nodes.set({ url: '/next' }, { at: [], type: LinkPlugin });

    expect(
      editor.read.nodes.find({ at: [], type: LinkPlugin })?.[0]
    ).toMatchObject({
      type: 'persistedDescriptorQueryLink',
      url: '/next',
    });
    expect(setCommandCalls).toBe(1);
    expect(correctionVisits).toBeGreaterThan(0);
    expect(() =>
      editor.read.nodes.find({
        at: [],
        type: MarkPlugin as unknown as typeof LinkPlugin,
      })
    ).toThrow(
      'Plate plugin "descriptorQueryMark" does not declare schema.element.'
    );
  });

  it('does not include disabled plugins', () => {
    const names = getSortedKeys([
      defineHeadlessPlugin('enabled', {}),
      defineHeadlessPlugin('disabled', { enabled: false }),
    ]);

    expect(names).toContain('enabled');
    expect(names).not.toContain('disabled');
  });

  it('publishes plugin APIs by name and descriptor portal', () => {
    const Plugin1 = defineHeadlessPlugin('plugin1', {
      api: () => ({ methodA: () => 'A' }),
    });
    const Plugin2 = defineHeadlessPlugin('plugin2', {
      api: () => ({ methodB: () => 'B' }),
    });
    const editor = createEditor({
      plugins: [Plugin1, Plugin2],
    });

    expect(editor.api.plugin1.methodA()).toBe('A');
    expect(editor.api.plugin2.methodB()).toBe('B');
    expect(editor.plugin(Plugin1).api.methodA()).toBe('A');
    expect(editor.plugin(Plugin2).api.methodB()).toBe('B');
  });

  it('compiles staged read, update, and editor-plugin contributions', () => {
    let stageCalls = 0;
    const Plugin = defineHeadlessPlugin('unifiedRuntime', {
      initialState: { label: 'unified' },
    })
      .extend(({ store }) => {
        stageCalls += 1;

        return {
          api: () => ({
            label: () => store.get().label,
          }),
          read: ({ state }) => ({
            hasSelection: () => state.selection() !== null,
          }),
          selectors: {
            selected: () => false,
          },
        };
      })
      .extend(({ api, read }) => {
        stageCalls += 1;
        const { hasSelection } = read;

        void hasSelection;

        return {
          update: ({ tx }) => ({
            apiLabel: () => api.label(),
            select: () => {
              tx.selection.set({ offset: 0, path: [0, 0] });
            },
          }),
        };
      });
    const editor = createEditor({
      initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
      plugins: [Plugin],
    });

    expect(stageCalls).toBe(2);
    expect(editor.plugin(Plugin).api.label()).toBe('unified');
    expect(editor.plugin(Plugin).store.get('selected')).toBe(false);
    expect(editor.read.unifiedRuntime.hasSelection()).toBe(false);
    expect(editor.plugin(Plugin).read.hasSelection()).toBe(false);
    expect(editor.update.unifiedRuntime.apiLabel()).toBe('unified');
    const directRead = Reflect.get(
      editor.update.unifiedRuntime,
      'hasSelection'
    );

    expect(() => Reflect.apply(directRead, undefined, [])).toThrow('read-only');
    editor.update.unifiedRuntime.select();
    expect(editor.plugin(Plugin).read.hasSelection()).toBe(true);
  });

  it('compiles nested capability trees without descriptor merge machinery', () => {
    const Plugin = defineHeadlessPlugin('nestedCapabilities', {
      api: () => ({ nested: { first: () => 'first' }, values: ['first'] }),
      read: () => ({ nested: { first: () => 'first' } }),
      update: () => ({ nested: { first: () => 'first' } }),
    }).extend(() => ({
      api: () => ({ nested: { second: () => 'second' }, values: ['second'] }),
      read: () => ({ nested: { second: () => 'second' } }),
      update: () => ({ nested: { second: () => 'second' } }),
    }));
    const editor = createEditor({ plugins: [Plugin] });

    expect(editor.api.nestedCapabilities.nested.first()).toBe('first');
    expect(editor.api.nestedCapabilities.nested.second()).toBe('second');
    expect(editor.api.nestedCapabilities.values).toEqual(['second']);
    expect(editor.read.nestedCapabilities.nested.first()).toBe('first');
    expect(editor.read.nestedCapabilities.nested.second()).toBe('second');
    expect(editor.update.nestedCapabilities.nested.first()).toBe('first');
    expect(editor.update.nestedCapabilities.nested.second()).toBe('second');
    expect(
      editor.read((state) => Object.isFrozen(state.nestedCapabilities.nested))
    ).toBe(true);
  });

  it('canonicalizes ordinary cross-realm read records locally', () => {
    const crossRealmRead = runInNewContext(
      '({ nested: { ready() { return true; } } })'
    ) as { nested: { ready(): boolean } };
    const Plugin = defineHeadlessPlugin('crossRealmRead', {
      read: () => crossRealmRead,
    });
    const editor = createEditor({ plugins: [Plugin] });

    expect(editor.read.crossRealmRead.nested.ready()).toBe(true);
    editor.read((state) => {
      expect(Object.getPrototypeOf(state.crossRealmRead)).toBe(
        Object.prototype
      );
    });
  });

  it('lets later read stages replace callable roots and nested methods', () => {
    const CallablePlugin = defineHeadlessPlugin('callableOverride', {
      read: () => () => 'first',
    }).extend(() => ({
      read: () => () => 'second',
    }));
    const MethodPlugin = defineHeadlessPlugin('methodOverride', {
      read: () => ({ nested: { value: () => 'first' } }),
    }).extend(() => ({
      read: () => ({ nested: { value: () => 'second' } }),
    }));
    const editor = createEditor({
      plugins: [CallablePlugin, MethodPlugin],
    });

    expect(editor.plugin(CallablePlugin).read()).toBe('second');
    expect(editor.read.methodOverride.nested.value()).toBe('second');
  });

  it('rejects mixed callable and record read-root contributions', () => {
    const Plugin = defineHeadlessPlugin('mixedReadRoot', {
      read: () => Object.assign(() => true, { ready: () => true }),
    }).extend(() => ({
      read: () => ({ nested: { ready: () => true } }),
    }));

    expect(() => createEditor({ plugins: [Plugin] })).toThrow(
      /cannot merge callable and record roots/
    );
  });

  it('defines prototype-named capability keys as exact own methods', () => {
    const Plugin = defineHeadlessPlugin('prototypeCapability', {
      read: () => ({ ['__proto__']: () => 'own' }),
    });
    const editor = createEditor({ plugins: [Plugin] });

    editor.read((state) => {
      const group = state.prototypeCapability;
      const method = Reflect.get(group, '__proto__');

      expect(Object.hasOwn(group, '__proto__')).toBe(true);
      expect(Reflect.apply(method, group, [])).toBe('own');
    });
    const directGroup = editor.read.prototypeCapability;
    const directMethod = Reflect.get(directGroup, '__proto__');

    expect(Reflect.apply(directMethod, directGroup, [])).toBe('own');
  });

  it('rejects Plate read capability data properties', () => {
    const Plugin = defineHeadlessPlugin('invalidReadCapability', {
      read: (() => ({ count: 1 })) as never,
    });
    expect(() => createEditor({ plugins: [Plugin] })).toThrow(
      /read capability "count" must be a method/
    );
  });

  it('rejects Plate read capability accessors without invoking them', () => {
    let getterCalls = 0;
    const Plugin = defineHeadlessPlugin('invalidReadAccessor', {
      read: (() =>
        Object.defineProperty({}, 'method', {
          enumerable: true,
          get: () => {
            getterCalls += 1;

            return () => true;
          },
        })) as never,
    });

    expect(() => createEditor({ plugins: [Plugin] })).toThrow(
      /read capability "method" must not use an accessor/
    );
    expect(getterCalls).toBe(0);
  });

  it('rejects hidden Plate read accessors without invoking them', () => {
    let getterCalls = 0;
    const Plugin = defineHeadlessPlugin('invalidHiddenReadAccessor', {
      read: (() =>
        Object.defineProperty({}, 'method', {
          get: () => {
            getterCalls += 1;

            return () => true;
          },
        })) as never,
    });

    expect(() => createEditor({ plugins: [Plugin] })).toThrow(
      /read capability "method" must not use an accessor/
    );
    expect(getterCalls).toBe(0);
  });

  it('rejects hidden and symbol Plate read methods', () => {
    const HiddenPlugin = defineHeadlessPlugin('invalidHiddenReadMethod', {
      read: (() =>
        Object.defineProperty({}, 'method', {
          value: () => true,
        })) as never,
    });
    const SymbolPlugin = defineHeadlessPlugin('invalidSymbolReadMethod', {
      read: (() => ({ [Symbol('method')]: () => true })) as never,
    });

    expect(() => createEditor({ plugins: [HiddenPlugin] })).toThrow(
      /read capability "method" must be enumerable/
    );
    expect(() => createEditor({ plugins: [SymbolPlugin] })).toThrow(
      /read capability symbols are not supported/
    );
  });

  it('rejects redefined Plate read function intrinsics', () => {
    const method = () => true;

    Object.defineProperty(method, 'name', {
      configurable: true,
      enumerable: true,
      get: () => 'method',
    });
    const Plugin = defineHeadlessPlugin('invalidReadFunctionIntrinsic', {
      read: () => ({ method }),
    });

    expect(() => createEditor({ plugins: [Plugin] })).toThrow(
      /read capability function intrinsic "name" was redefined/
    );
  });

  it('registers constructor-authored unified contributions', () => {
    const Plugin = defineHeadlessPlugin('objectUnifiedRuntime', {
      api: () => ({
        label: () => 'object',
      }),
      read: () => ({
        ready: () => true,
      }),
      selectors: {
        selected: () => true,
      },
      update: () => ({
        label: () => 'update',
      }),
    });
    const editor = createEditor({ plugins: [Plugin] });

    expect(editor.plugin(Plugin).api.label()).toBe('object');
    expect(editor.api.objectUnifiedRuntime.label()).toBe('object');
    expect(editor.read.objectUnifiedRuntime.ready()).toBe(true);
    expect(editor.plugin(Plugin).store.get('selected')).toBe(true);
    expect(editor.update.objectUnifiedRuntime.label()).toBe('update');
  });

  it('overwrite API methods with the same name', () => {
    const Plugin = defineHeadlessPlugin('apiOverride', {
      api: () => ({ method: (_: string) => 'first' }),
    }).extend(() => ({
      api: () => ({ method: (_: number) => 'second' }),
    }));
    const editor = createEditor({
      plugins: [Plugin],
    });

    expect(Reflect.apply(editor.api.apiOverride.method, undefined, [1])).toBe(
      'second'
    );
  });

  it('fills plugin cache buckets for node, render, view attributes, rule, and handler metadata', () => {
    const editor = createEditor({
      plugins: [
        definePlugin('cachey', {
          schema: {
            mark: property.boolean({ default: false, omitDefault: true }),
          },
          decorate: { read: () => [] },
          on: {
            nodeChange: () => {},
            textChange: () => {},
          },
          render: {
            mark: {
              leafAttributes: { 'data-leaf': 'x' } as any,
              placement: 'text',
              textAttributes: { 'data-text': 'y' } as any,
            },
            useViewElementAttributes: () => [],
          },
          slots: {
            afterContainer: () => null,
            afterEditable: () => null,
            afterNodeChildren: () => null,
            beforeContainer: () => null,
            beforeEditable: () => null,
            wrapContent: () => null,
            wrapNode: () => () => null,
            wrapNodeChildren: () => () => null,
            wrapRoot: () => null,
          },
          rules: {
            match: () => true,
          },
        }),
      ],
    });

    expect(getPlateRuntime(editor).pluginCache.decorate).toContain('cachey');
    expect(getPlateRuntime(editor).pluginCache.on.nodeChange).toContain(
      'cachey'
    );
    expect(getPlateRuntime(editor).pluginCache.on.textChange).toContain(
      'cachey'
    );
    expect(getPlateRuntime(editor).pluginCache.node.textRenderers).toContain(
      'cachey'
    );
    expect(
      getPlateRuntime(editor).pluginCache.node.leafAttributeMarks
    ).toContain('cachey');
    expect(
      getPlateRuntime(editor).pluginCache.node.textAttributeMarks
    ).toContain('cachey');
    expect(getPlateRuntime(editor).pluginCache.slots.wrapContent).toContain(
      'cachey'
    );
    expect(getPlateRuntime(editor).pluginCache.slots.wrapNode).toContain(
      'cachey'
    );
    expect(getPlateRuntime(editor).pluginCache.slots.wrapRoot).toContain(
      'cachey'
    );
    expect(getPlateRuntime(editor).pluginCache.slots.afterContainer).toContain(
      'cachey'
    );
    expect(getPlateRuntime(editor).pluginCache.slots.afterEditable).toContain(
      'cachey'
    );
    expect(getPlateRuntime(editor).pluginCache.slots.beforeContainer).toContain(
      'cachey'
    );
    expect(getPlateRuntime(editor).pluginCache.slots.beforeEditable).toContain(
      'cachey'
    );
    expect(
      getPlateRuntime(editor).pluginCache.slots.wrapNodeChildren
    ).toContain('cachey');
    expect(
      getPlateRuntime(editor).pluginCache.slots.afterNodeChildren
    ).toContain('cachey');
    expect(getPlateRuntime(editor).pluginCache.rules.match).toContain('cachey');
    expect(
      getPlateRuntime(editor).pluginCache.useViewElementAttributes
    ).toContain('cachey');
  });

  it('compiles node-prop injection by node kind', () => {
    const ElementTargetedPlugin = defineHeadlessPlugin('elementTargeted', {
      inject: { nodeProps: {} },
      targetPlugins: [BaseParagraphPlugin],
    });
    const BlockPlugin = defineHeadlessPlugin('blockInjection', {
      inject: { isBlock: true, nodeProps: {} },
    });
    const LeafPlugin = defineHeadlessPlugin('leafInjection', {
      inject: { isLeaf: true, nodeProps: {} },
    });
    const GeneralPlugin = defineHeadlessPlugin('generalInjection', {
      inject: { nodeProps: {} },
    });
    const editor = createEditor({
      plugins: [
        BaseParagraphPlugin,
        ElementTargetedPlugin,
        BlockPlugin,
        LeafPlugin,
        GeneralPlugin,
      ],
    });
    const { nodeProps } = getPlateRuntime(editor).pluginCache.inject;

    expect(nodeProps.element).toEqual([
      'elementTargeted',
      'blockInjection',
      'generalInjection',
    ]);
    expect(nodeProps.text).toEqual(['leafInjection', 'generalInjection']);
  });

  it('creates a shortcut handler from plugin-specific tx commands', () => {
    const toggle = mock();
    const editor = createEditor({
      plugins: [
        defineHeadlessPlugin('shortcutTx', {
          update: () => ({ toggle }),
        }).extend({ shortcuts: { toggle: { keys: 'mod+k' } } }),
      ],
    });

    getPlateRuntime(editor).shortcuts['shortcutTx.toggle']?.handler?.({
      editor,
    } as any);

    expect(toggle).toHaveBeenCalledTimes(1);
  });

  it('routes a keys-only text-block shortcut to its generic toggle', () => {
    const TextBlockPlugin = defineHeadlessPlugin('shortcutTextBlock', {
      schema: { element: schema.element.textBlock() },
    }).extend({
      shortcuts: { toggle: { keys: 'mod+k' } },
    });
    const editor = createEditor({
      initialValue: [{ children: [{ text: 'text' }], type: 'paragraph' }],
      plugins: [TextBlockPlugin],
    });
    editor.update.selection.set({ offset: 0, path: [0, 0] });

    getPlateRuntime(editor).shortcuts['shortcutTextBlock.toggle']?.handler?.({
      editor,
    } as any);

    expect(editor.read.children()[0]).toMatchObject({
      type: 'shortcutTextBlock',
    });
  });

  it('does not invent a generic toggle for structural elements', () => {
    const StructuralPlugin = defineHeadlessPlugin('shortcutStructural', {
      schema: { element: { void: 'block' } },
    });
    const editor = createEditor({ plugins: [StructuralPlugin] });

    expect(editor.plugin(StructuralPlugin).update).not.toHaveProperty('toggle');
    expect(() =>
      createEditor({
        plugins: [
          StructuralPlugin.extend({
            shortcuts: { toggle: { keys: 'mod+k' } } as any,
          }),
        ],
      })
    ).toThrow(
      'Plate shortcut "shortcutStructural.toggle" does not match a public update or API command.'
    );
  });

  it('does not invent a generic toggle for text blocks with required construction properties', () => {
    const RequiredPlugin = defineHeadlessPlugin('shortcutRequiredTextBlock', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
          properties: { tone: property.string({ required: true }) },
        },
      },
    });
    const editor = createEditor({ plugins: [RequiredPlugin] });

    expect(editor.plugin(RequiredPlugin).update).not.toHaveProperty('toggle');
    expect(() =>
      createEditor({
        plugins: [
          RequiredPlugin.extend({
            shortcuts: { toggle: { keys: 'mod+k' } } as any,
          }),
        ],
      })
    ).toThrow(
      'Plate shortcut "shortcutRequiredTextBlock.toggle" does not match a public update or API command.'
    );
  });

  it('does not invent a generic toggle for nested-only text blocks', () => {
    const NestedTextBlockPlugin = defineHeadlessPlugin('nestedTextBlock', {
      schema: {
        element: {
          blockContent: false,
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
    });
    const editor = createEditor({ plugins: [NestedTextBlockPlugin] });

    expect(editor.plugin(NestedTextBlockPlugin).update).not.toHaveProperty(
      'toggle'
    );
  });

  it('does not infer the text-block capability from arbitrary text content', () => {
    const TextContentPlugin = defineHeadlessPlugin('shortcutTextContent', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
    });
    const editor = createEditor({ plugins: [TextContentPlugin] });

    expect(editor.plugin(TextContentPlugin).update).not.toHaveProperty(
      'toggle'
    );
  });

  it('keeps authored text-block toggle semantics instead of synthesizing the generic command', () => {
    const toggle = mock();
    const Plugin = defineHeadlessPlugin('shortcutAuthoredTextBlock', {
      schema: { element: schema.element.textBlock() },
      shortcuts: { toggle: { keys: 'mod+k' } },
      update: () => ({ toggle }),
    });
    const editor = createEditor({ plugins: [Plugin] });

    getPlateRuntime(editor).shortcuts[
      'shortcutAuthoredTextBlock.toggle'
    ]?.handler?.({ editor } as any);

    expect(toggle).toHaveBeenCalledTimes(1);
  });

  it('uses the final application schema when publishing generic toggles', () => {
    const ChildPlugin = defineHeadlessPlugin('overriddenTextBlockChild', {
      schema: { element: schema.element.textBlock() },
    });
    const TextBlockPlugin = defineHeadlessPlugin('overriddenTextBlock', {
      schema: { element: schema.element.textBlock() },
    }).extend({ shortcuts: { toggle: { keys: 'mod+k' } } });
    expect(() =>
      createEditor({
        plugins: [ChildPlugin, TextBlockPlugin],
        schema: {
          overrides: [
            schema.override(TextBlockPlugin, {
              element: { content: schema.content.element(ChildPlugin) },
            }),
          ],
        },
      })
    ).toThrow(
      'Plate shortcut "overriddenTextBlock.toggle" does not match a public update or API command.'
    );
  });

  it('creates a shortcut handler from a configured owner update', () => {
    const insert = mock();
    const plugin = defineHeadlessPlugin('shortcutRootTx', {
      update: () => ({ insert }),
    });
    const editor = createEditor({
      plugins: [
        plugin.configure({
          shortcuts: { insert: { keys: 'mod+enter' } },
        }),
      ],
    });

    getPlateRuntime(editor).shortcuts['shortcutRootTx.insert']?.handler?.({
      editor,
    } as any);

    expect(insert).toHaveBeenCalledTimes(1);
  });

  it('infers plugin-specific api when update has no matching command', () => {
    const other = mock();
    const toggle = mock() as any;
    const editor = createEditor({
      plugins: [
        defineHeadlessPlugin('shortcutMixed', { update: () => ({ other }) })
          .extend(() => ({ api: () => ({ toggle }) }))
          .extend({ shortcuts: { toggle: { keys: 'mod+k' } } }),
      ],
    });

    getPlateRuntime(editor).shortcuts['shortcutMixed.toggle']?.handler?.({
      editor,
    } as any);

    expect(other).not.toHaveBeenCalled();
    expect(toggle).toHaveBeenCalledTimes(1);
  });

  it('rejects shortcuts with no matching update or api command', () => {
    const other = mock();
    const create = () =>
      createEditor({
        plugins: [
          defineHeadlessPlugin('shortcutMissing', {
            update: () => ({ other }),
          }).extend({
            shortcuts: {
              toggle: { keys: 'mod+k' },
            } as any,
          }),
        ],
      });

    expect(create).toThrow(
      'Plate shortcut "shortcutMissing.toggle" does not match a public update or API command.'
    );
    expect(other).not.toHaveBeenCalled();
  });

  it('does not prevent default when a tx shortcut command returns false', () => {
    const untab = mock(() => false);
    const editor = createEditor({
      plugins: [
        defineHeadlessPlugin('shortcutTxFalse', {
          update: () => ({ untab }),
        }).extend({ shortcuts: { untab: { keys: 'shift+tab' } } }),
      ],
    });

    const result = getPlateRuntime(editor).shortcuts[
      'shortcutTxFalse.untab'
    ]?.handler?.({ editor } as any);

    expect(untab).toHaveBeenCalledTimes(1);
    expect(result).toBe(false);
  });

  it('requires target only when update and api commands collide', () => {
    const apiToggle = mock();
    const updateToggle = mock();
    const AmbiguousPlugin = defineHeadlessPlugin('shortcutAmbiguous', {
      api: () => ({ toggle: apiToggle }),
    })
      .extend(() => ({ update: () => ({ toggle: updateToggle }) }))
      .extend({
        shortcuts: { toggle: { keys: 'mod+k' } } as any,
      });

    expect(() => createEditor({ plugins: [AmbiguousPlugin] })).toThrow(
      'Plate shortcut "shortcutAmbiguous.toggle" matches both update and API commands.'
    );

    const ApiPlugin = AmbiguousPlugin.configure({
      shortcuts: { toggle: { keys: 'mod+k', target: 'api' } },
    });
    const apiEditor = createEditor({ plugins: [ApiPlugin] });

    expect(
      getPlateRuntime(apiEditor).shortcuts['shortcutAmbiguous.toggle']
    ).not.toHaveProperty('target');
    getPlateRuntime(apiEditor).shortcuts['shortcutAmbiguous.toggle']?.handler?.(
      { editor: apiEditor } as any
    );
    expect(apiToggle).toHaveBeenCalledTimes(1);
    expect(updateToggle).not.toHaveBeenCalled();

    const UpdatePlugin = AmbiguousPlugin.configure({
      shortcuts: { toggle: { keys: 'mod+k', target: 'update' } },
    });
    const updateEditor = createEditor({ plugins: [UpdatePlugin] });

    getPlateRuntime(updateEditor).shortcuts[
      'shortcutAmbiguous.toggle'
    ]?.handler?.({ editor: updateEditor } as any);
    expect(updateToggle).toHaveBeenCalledTimes(1);
  });

  it('forbids target together with a custom shortcut handler', () => {
    const create = () =>
      createEditor({
        plugins: [
          defineHeadlessPlugin('shortcutHandlerTarget', {
            shortcuts: {
              invalid: {
                handler: () => true,
                keys: 'mod+k',
                target: 'api',
              } as any,
            },
          }),
        ],
      });

    expect(create).toThrow(
      'Plate shortcut "shortcutHandlerTarget.invalid" cannot define `target` together with a custom handler.'
    );
  });

  it('creates a shortcut handler from plugin-specific api methods', () => {
    const toggle = mock();
    const editor = createEditor({
      plugins: [
        defineHeadlessPlugin('shortcutApi', {
          api: () => ({ toggle }),
        }).extend({
          shortcuts: { toggle: { keys: 'mod+k' } },
        }),
      ],
    });

    getPlateRuntime(editor).shortcuts['shortcutApi.toggle']?.handler?.({
      editor,
    } as any);

    expect(toggle).toHaveBeenCalledTimes(1);
  });

  it('invokes API shortcuts on the event editor view', () => {
    const Plugin = defineHeadlessPlugin('shortcutView', {
      api: ({ editor }) => ({ current: () => editor }),
    }).extend({ shortcuts: { current: { keys: 'mod+k' } } });
    const editor = createEditor({ plugins: [Plugin] });
    const view = createEditorView(editor);

    expect(
      getPlateRuntime(editor).shortcuts['shortcutView.current']?.handler?.({
        editor: view,
      } as any)
    ).toBe(view);
  });

  it('rejects plugin-set mutation after atomic model publication', () => {
    const PluginApi = defineHeadlessPlugin('pluginApi', {
      api: () => ({
        run: () => 'run',
      }),
    });
    const editor = createEditor({
      plugins: [PluginApi],
    });

    expect(editor.plugin(PluginApi).api.run()).toBe('run');
    expect(editor.api.pluginApi.run()).toBe('run');
    expect(editor.plugin(PluginApi).api).toBe(editor.api.pluginApi);

    expect(() => resolvePlugins(editor, [])).toThrow(
      'Plate plugins are fixed after model publication. Configure plugin `initialState` before creating the editor.'
    );
    expect(editor.plugin(PluginApi).api.run()).toBe('run');
  });

  it('throws when inputRules is configured as a boolean map', () => {
    expect(() =>
      createEditor({
        plugins: [
          defineHeadlessPlugin('marks', {}).configure({
            inputRules: { markdown: true } as any,
          }),
        ],
      })
    ).toThrow(
      'inputRules must be an array of explicit rule instances or a factory.'
    );
  });
});

describe('resolveAndSortPlugins', () => {
  it('keeps independent roots in application order', () => {
    expect(
      getSortedKeys([
        defineHeadlessPlugin('a', {}),
        defineHeadlessPlugin('b', {}),
        defineHeadlessPlugin('c', {}),
      ])
    ).toEqual(['a', 'b', 'c']);
  });

  it('installs direct and transitive dependencies once', () => {
    const c = defineHeadlessPlugin('c', {});
    const b = defineHeadlessPlugin('b', { dependencies: [c] });
    const a = defineHeadlessPlugin('a', { dependencies: [b, c] });

    expect(getSortedKeys([a])).toEqual(['c', 'b', 'a']);
  });

  it('resolves one configured descriptor once across dependency and root paths', () => {
    let calls = 0;
    const dependency = defineHeadlessPlugin('configuredDependency', {
      initialState: { source: 'base' },
    }).configure(() => {
      calls += 1;

      return { initialState: { source: 'configured' } };
    });
    const dependent = defineHeadlessPlugin('dependent', {
      dependencies: [dependency],
    });
    const editor = createEditor();
    const resolved = resolveAndSortPlugins(editor, [dependent, dependency]);

    expect(calls).toBe(1);
    expect(
      resolved.find((plugin) => plugin.name === dependency.name)?.initialState
    ).toEqual({ source: 'configured' });
  });

  it('rejects a same-name root that does not share dependency identity', () => {
    const dependency = defineHeadlessPlugin('extendedDependency', {
      api: () => ({
        dependencyRead: () => 'dependency',
      }),
    });
    const explicitDependency = defineHeadlessPlugin(dependency.name, {
      api: () => ({
        explicitRead: () => 'explicit',
      }),
    });
    const dependent = defineHeadlessPlugin('dependent', {
      dependencies: [dependency],
    });
    expect(() =>
      createEditor({ plugins: [dependent, explicitDependency] })
    ).toThrow(
      'dependency "extendedDependency" resolves to a different descriptor'
    );
  });

  it('keeps application order around dependency ordering', () => {
    const c = defineHeadlessPlugin('c', {});
    const b = defineHeadlessPlugin('b', {
      dependencies: [c],
    });
    const a = defineHeadlessPlugin('a', {});

    expect(getSortedKeys([a, b])).toEqual(['a', 'c', 'b']);
  });

  it('uses explicit root configuration regardless of root position', () => {
    const dependency = defineHeadlessPlugin('dependency', {
      initialState: { source: 'implicit' },
    });
    const explicitDependency = dependency.configure({
      initialState: { source: 'explicit' },
    });
    const dependent = defineHeadlessPlugin('dependent', {
      dependencies: [dependency],
    });
    const editor = createEditor();

    for (const roots of [
      [explicitDependency, dependent],
      [dependent, explicitDependency],
    ]) {
      const resolved = resolveAndSortPlugins(editor, roots);

      expect(
        resolved.find((plugin) => plugin.name === 'dependency')?.initialState
      ).toEqual({ source: 'explicit' });
    }
  });

  it('rejects an explicitly disabled required dependency', () => {
    const dependency = defineHeadlessPlugin('dependency', {});
    const dependent = defineHeadlessPlugin('dependent', {
      dependencies: [dependency],
    });

    expect(() =>
      getSortedKeys([dependent, dependency.configure({ enabled: false })])
    ).toThrow(/dependent.*requires disabled plugin "dependency"/);
  });

  it('omits dependencies owned only by a disabled dependent', () => {
    const dependency = defineHeadlessPlugin('dependency', {});
    const dependent = defineHeadlessPlugin('dependent', {
      dependencies: [dependency],
      enabled: false,
    });

    expect(getSortedKeys([dependent])).toEqual([]);
  });

  it('rejects named dependency cycles', () => {
    const a = brandPluginDescriptor({
      ...defineHeadlessPlugin('a', {}),
    }) as AnyBasePlugin;
    const b = brandPluginDescriptor({
      ...defineHeadlessPlugin('b', {}),
      dependencies: [a],
    }) as AnyBasePlugin;

    Object.assign(a, { dependencies: [b] });

    expect(() => getSortedKeys([a])).toThrow(
      'Circular plugin dependency: a -> b -> a'
    );
  });

  it('rejects string dependency names', () => {
    const dependent = defineHeadlessPlugin('dependent', {
      dependencies: ['missing'] as never,
    });

    expect(() => getSortedKeys([dependent])).toThrow(
      'Pass a plugin descriptor, not its name.'
    );
  });
});

describe('applyPluginOverrides', () => {
  it('applies flat peer components in source order', () => {
    const OriginalComponent = () => null;
    const OverrideComponent = () => null;
    const HighPriorityComponent = () => null;
    const PreservedOriginalComponent = () => null;
    const PluginA = definePlugin('a', {
      override: {
        b: { component: OverrideComponent },
        c: { component: OverrideComponent },
        d: { component: OverrideComponent },
        e: { component: OverrideComponent },
      },
    });
    const PluginB = definePlugin('b', {
      component: OriginalComponent,
    });
    const PluginC = defineHeadlessPlugin('c', {});
    const PluginD = definePlugin('d', {
      component: OriginalComponent,
    });
    const PluginE = definePlugin('e', {
      override: {
        b: { component: HighPriorityComponent },
        d: { component: HighPriorityComponent },
      },
    });
    const PluginF = definePlugin('f', {
      component: PreservedOriginalComponent,
    });
    const Missing = definePlugin('missing', {});

    const editor = createReactEditor({
      plugins: [PluginA, PluginB, PluginC, PluginD, PluginE, PluginF],
    });

    expect(editor.plugin(PluginB).component).toBe(OverrideComponent);
    expect(editor.plugin(PluginC).component).toBe(OverrideComponent);
    expect(editor.plugin(PluginD).component).toBe(OverrideComponent);
    expect(editor.plugin(PluginE).component).toBe(OverrideComponent);
    expect(editor.plugin(PluginF).component).toBe(PreservedOriginalComponent);
    expect(() => editor.plugin(Missing).name).toThrow(
      'Plate plugin "missing" is not installed.'
    );
  });

  it('does not fabricate a descriptor for a disabled plugin', () => {
    const Disabled = definePlugin('disabledPlugin', {
      enabled: false,
    });
    const editor = createEditor({ plugins: [Disabled] });

    expect(editor.plugin(Disabled).installed).toBe(false);
    expect(() => editor.plugin(Disabled).name).toThrow(
      'Plate plugin "disabledPlugin" is not installed.'
    );
  });

  describe('weak plugin overrides', () => {
    it('replaces a present target component and yields to terminal target configuration', () => {
      const Original = () => null;
      const Weak = () => null;
      const Terminal = () => null;
      const Target = defineHeadlessPlugin('componentOverrideTarget', {
        component: Original,
      });
      const Contributor = defineHeadlessPlugin('componentOverrideContributor', {
        override: {
          [Target.name]: { component: Weak },
        },
      });

      expect(
        getCompiledPlatePlugin(
          createEditor({ plugins: [Contributor, Target] }),
          Target.name
        )?.component
      ).toBe(Weak);
      expect(
        getCompiledPlatePlugin(
          createEditor({
            plugins: [Contributor, Target.configure({ component: Terminal })],
          }),
          Target.name
        )?.component
      ).toBe(Terminal);
      expect(
        createEditor({ plugins: [Contributor] }).plugin(Target).installed
      ).toBe(false);
    });

    it('ignores missing targets without installing them', () => {
      const Contributor = defineHeadlessPlugin('missingTargetContributor', {
        override: {
          missingTarget: {
            dependencies: [],
            enabled: false,
          } as any,
        },
      });
      const editor = createEditor({ plugins: [Contributor] });

      expect(
        getPlateRuntime(editor).pluginList.map((plugin) => plugin.name)
      ).not.toContain('missingTarget');
    });

    it('keeps direct target configuration terminal and executes it once', () => {
      let calls = 0;
      const Target = defineHeadlessPlugin('strongTarget', {
        initialState: {
          peerOnly: 'base',
          source: 'base',
        },
      }).configure(() => {
        calls += 1;

        return {
          initialState: {
            source: 'strong',
          },
        };
      });
      const Contributor = defineHeadlessPlugin('strongTargetContributor', {
        override: {
          [Target.name]: {
            initialState: {
              peerOnly: 'weak',
              source: 'weak',
            },
          },
        },
      });
      const editor = createEditor({
        plugins: [Contributor, Target],
      });

      expect(editor.plugin(Target).initialState).toEqual({
        peerOnly: 'weak',
        source: 'strong',
      });
      expect(calls).toBe(1);
    });

    it('uses earlier application order for overlapping fields', () => {
      const Target = defineHeadlessPlugin('orderedWeakTarget', {
        initialState: { priorityWinner: 'base', sourceWinner: 'base' },
      });
      const Low = defineHeadlessPlugin('lowWeakContributor', {
        override: {
          [Target.name]: {
            initialState: { priorityWinner: 'low' },
          },
        },
      });
      const High = defineHeadlessPlugin('highWeakContributor', {
        override: {
          [Target.name]: {
            initialState: { priorityWinner: 'high' },
          },
        },
      });
      const First = defineHeadlessPlugin('firstWeakContributor', {
        override: {
          [Target.name]: {
            initialState: { sourceWinner: 'first' },
          },
        },
      });
      const Second = defineHeadlessPlugin('secondWeakContributor', {
        override: {
          [Target.name]: {
            initialState: { sourceWinner: 'second' },
          },
        },
      });
      const editor = createEditor({
        plugins: [Low, High, First, Second, Target],
      });

      expect(editor.plugin(Target).initialState).toEqual({
        priorityWinner: 'low',
        sourceWinner: 'first',
      });
    });

    it('skips disabled contributors', () => {
      const Target = defineHeadlessPlugin('disabledContributorTarget', {
        initialState: { source: 'target' },
      });
      const Contributor = defineHeadlessPlugin('disabledWeakContributor', {
        enabled: false,
        override: {
          [Target.name]: {
            initialState: { source: 'disabled contributor' },
          },
        },
      });
      const editor = createEditor({
        plugins: [Contributor, Target],
      });

      expect(editor.plugin(Target).initialState.source).toBe('target');
    });

    it('rejects topology fields even through erased input', () => {
      const Target = defineHeadlessPlugin('topologyTarget', {});
      const Contributor = defineHeadlessPlugin('topologyContributor', {
        override: {
          [Target.name]: {
            dependencies: [],
          } as any,
        },
      });

      expect(() => createEditor({ plugins: [Contributor, Target] })).toThrow(
        'weak override for "topologyTarget" cannot define "dependencies"'
      );
    });

    it('rejects schema replacement through erased weak overrides', () => {
      const Target = defineHeadlessPlugin('weakSchemaTarget', {});
      const Contributor = defineHeadlessPlugin('weakSchemaContributor', {
        override: {
          [Target.name]: {
            schema: { mark: property.boolean() },
          } as any,
        },
      });

      expect(() => createEditor({ plugins: [Contributor, Target] })).toThrow(
        'weak override for "weakSchemaTarget" cannot define "schema"'
      );
    });

    it('cannot disable a required dependency', () => {
      const Dependency = defineHeadlessPlugin('weakRequiredDependency', {});
      const Dependent = defineHeadlessPlugin('weakRequiredDependent', {
        dependencies: [Dependency],
      });
      const Contributor = defineHeadlessPlugin('weakRequiredContributor', {
        override: {
          [Dependency.name]: { enabled: false },
        },
      });

      expect(() => createEditor({ plugins: [Contributor, Dependent] })).toThrow(
        /weakRequiredDependent.*requires disabled plugin "weakRequiredDependency"/
      );
    });

    it('cannot beat an explicit target enablement', () => {
      const Target = defineHeadlessPlugin('strongEnabledTarget', {
        enabled: false,
      }).configure({ enabled: true });
      const Contributor = defineHeadlessPlugin('strongEnabledContributor', {
        override: {
          [Target.name]: { enabled: false },
        },
      });
      const editor = createEditor({
        plugins: [Contributor, Target],
      });

      expect(editor.plugin(Target)).toHaveProperty('enabled', true);
    });
  });

  it('allow overriding core plugins like DebugPlugin', () => {
    const customLogger = mock();

    const editor = createEditor({
      plugins: [
        DebugPlugin.configure({
          initialState: {
            logger: { log: customLogger },
          },
        }),
      ],
    });

    editor.plugin(DebugPlugin).api.log('Test message', 'TEST');

    expect(customLogger).toHaveBeenCalledWith(
      'Test message',
      'TEST',
      undefined
    );
  });
});

describe('mergePlugins behavior in resolvePlugins', () => {
  it('keeps the empty initial state default when authoring omits it', () => {
    const plugin = defineHeadlessPlugin('emptyInitialState', {});
    const editor = createEditor({ plugins: [plugin] });

    expect(
      getPlateRuntime(editor).plugins.emptyInitialState.initialState
    ).toEqual({});
  });

  it('preserves configured initialState when an overlay uses undefined', () => {
    const plugin = defineHeadlessPlugin('test', {
      initialState: {
        contextValue: 'kept',
        nullValue: 'kept',
        objectValue: 'kept',
      },
    }).configure(() => ({
      initialState: {
        contextValue: undefined as unknown as string,
        nullValue: null as unknown as string,
        objectValue: undefined as unknown as string,
      },
    }));

    const editor = createEditor({ plugins: [plugin] });

    expect(getPlateRuntime(editor).plugins.test.initialState).toEqual({
      contextValue: 'kept',
      nullValue: null,
      objectValue: 'kept',
    });
  });

  it('freezes the initialState record without cloning runtime resources', () => {
    class RuntimeResource {
      value = 'original';
    }
    const runtimeResource = new RuntimeResource();
    const plugin = defineHeadlessPlugin('test', {
      initialState: { resource: runtimeResource },
    });

    const editor = createEditor({
      plugins: [plugin],
    });

    const published = editor.plugin(plugin);

    expect(published.initialState).not.toBe(plugin.initialState);
    expect(Object.isFrozen(published.initialState)).toBe(true);
    expect(published.initialState.resource).toBe(runtimeResource);
    expect(editor.plugin(plugin).store.get('resource')).toBe(runtimeResource);
    expect(Object.isFrozen(published.initialState.resource)).toBe(false);
  });

  it('snapshots nested plain initialState away from caller-owned mutation', () => {
    const nested = { label: 'one' };
    const entries = [nested];
    const plugin = defineHeadlessPlugin('test', {
      initialState: { entries, nested },
    });
    const editor = createEditor({ plugins: [plugin] });
    const published = editor.plugin(plugin);
    const listener = vi.fn();
    const unsubscribe = getPluginStore(editor, plugin.name)!.public.subscribe(
      listener
    );

    nested.label = 'mutated';
    entries.push({ label: 'two' });

    expect(published.initialState.nested).toEqual({ label: 'one' });
    expect(published.initialState.nested).not.toBe(nested);
    expect(Object.isFrozen(published.initialState.nested)).toBe(true);
    expect(published.initialState.entries).toEqual([{ label: 'one' }]);
    expect(published.initialState.entries).not.toBe(entries);
    expect(published.initialState.entries[0]).toBe(
      published.initialState.nested
    );
    expect(Object.isFrozen(published.initialState.entries)).toBe(true);
    expect(editor.plugin(plugin).store.get('nested')).toEqual({
      label: 'one',
    });
    expect(listener).not.toHaveBeenCalled();

    editor.plugin(plugin).store.set({ nested: { label: 'updated' } });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(editor.plugin(plugin).store.get('nested')).toEqual({
      label: 'updated',
    });
    expect(published.initialState.nested).toEqual({ label: 'one' });
    unsubscribe();
  });

  it('preserves shared and cyclic identity inside snapshotted plain initialState', () => {
    const shared = { label: 'shared' };
    const cycle: { self?: typeof cycle } = {};

    cycle.self = cycle;
    const plugin = defineHeadlessPlugin('test', {
      initialState: { cycle, first: shared, second: shared },
    });
    const editor = createEditor({ plugins: [plugin] });
    const { initialState } = editor.plugin(plugin);

    expect(initialState.first).toBe(initialState.second);
    expect(initialState.first).not.toBe(shared);
    expect(Object.isFrozen(initialState.first)).toBe(true);
    expect(initialState.cycle).not.toBe(cycle);
    expect(initialState.cycle.self).toBe(initialState.cycle);
    expect(Object.isFrozen(initialState.cycle)).toBe(true);
  });

  it('rejects accessor properties in plain plugin state graphs', () => {
    const nested = {} as { value: number };

    Object.defineProperty(nested, 'value', {
      get: () => 1,
      set: () => {},
    });
    const plugin = defineHeadlessPlugin('test', {
      initialState: { nested },
    });

    expect(() => createEditor({ plugins: [plugin] })).toThrow(
      'Plate plugin `initialState` must be data-only. Accessor properties are not supported; declare computed values as pure plugin selectors.'
    );
  });

  it('rejects accessor properties in plain plugin descriptor graphs', () => {
    const rootDescriptor = brandPluginDescriptor({
      name: 'rootAccessor',
    }) as AnyBasePlugin;
    const nested = brandPluginDescriptor({
      name: 'nestedAccessor',
    }) as AnyBasePlugin;

    Object.defineProperty(rootDescriptor, 'priority', {
      enumerable: true,
      get: () => 100,
    });
    Object.defineProperty(nested, 'component', {
      enumerable: true,
      get: () => () => null,
    });

    expect(() => createEditor({ plugins: [rootDescriptor] })).toThrow(
      'Plate plugin "rootAccessor" descriptor path "priority" must be data-only. Accessor properties are not supported.'
    );
    expect(() => createEditor({ plugins: [nested] })).toThrow(
      'Plate plugin "nestedAccessor" descriptor path "component" must be data-only. Accessor properties are not supported.'
    );
  });

  it('preserves React components as opaque render-slot resources', () => {
    const DirectNode = React.forwardRef<HTMLDivElement>(() => null);
    const Node = React.forwardRef<HTMLDivElement>(() => null);
    const OverrideNode = React.forwardRef<HTMLDivElement>(() => null);
    const directPlugin = definePlugin('directForwardRefHost', {
      component: DirectNode,
    });
    const plugin = definePlugin('forwardRefHost', {
      component: Node,
    }).configure({
      override: { paragraph: { component: OverrideNode } },
    });
    const editor = createReactEditor({ plugins: [directPlugin, plugin] });
    const published = getPlateRuntime(editor).plugins.forwardRefHost;

    expect(getPlateRuntime(editor).plugins.directForwardRefHost.component).toBe(
      DirectNode
    );
    expect(published.component).toBe(Node);
    expect(published.override.paragraph?.component).toBe(OverrideNode);
    expect(Object.isFrozen(Node)).toBe(false);
    expect(Object.isFrozen(OverrideNode)).toBe(false);
  });

  it('snapshots plugin-valued initialState as frozen nominal references', () => {
    const Target = defineHeadlessPlugin('stateTarget', {});
    const cycle: { self?: typeof cycle; target: typeof Target } = {
      target: Target,
    };

    cycle.self = cycle;
    const Owner = defineHeadlessPlugin('stateOwner', {
      initialState: {
        cycle,
        entries: [{ target: Target }],
        first: Target,
        second: Target,
      },
    });
    const editor = createEditor({ plugins: [Target, Owner] });
    const publishedState = editor.plugin(Owner).initialState;
    const targetReference = publishedState.first;

    expect(targetReference).toEqual({
      name: 'stateTarget',
    });
    expect(targetReference).toBe(publishedState.second);
    expect(targetReference).toBe(publishedState.cycle.target);
    expect(targetReference).toBe(publishedState.entries[0].target);
    expect(publishedState.cycle.self).toBe(publishedState.cycle);
    expect(targetReference).not.toBe(Target);
    expect(Object.isFrozen(targetReference)).toBe(true);
    expect(editor.plugin(Owner).store.get('first')).toBe(targetReference);
    const secondEditor = createEditor({ plugins: [Target, Owner] });
    const secondReference =
      secondEditor.plugin(Owner).initialState.entries[0].target;
    expect(secondReference).not.toBe(targetReference);
    expect(secondReference).toBe(
      secondEditor.plugin(Owner).store.get('entries')[0].target
    );

    const ContextOwner = defineHeadlessPlugin('contextStateOwner', {
      initialState: { target: null as unknown as typeof Target },
    }).extend(() => ({ initialState: { target: Target } }));
    const contextEditor = createEditor({
      plugins: [Target, ContextOwner],
    });
    const contextPublished =
      contextEditor.plugin(ContextOwner).initialState.target;

    expect(contextPublished).toBe(
      contextEditor.plugin(ContextOwner).store.get('target')
    );
    expect(contextPublished).not.toBe(Target);
    expect(contextPublished).not.toBe(targetReference);
    expect(Object.isFrozen(contextPublished)).toBe(true);

    expect(targetReference).toEqual({
      name: 'stateTarget',
    });
    expect(getPlateRuntime(editor).plugins.stateTarget).toMatchObject({
      name: 'stateTarget',
    });
  });

  it('keeps mutable store state outside the published plugin descriptor', () => {
    const plugin = defineHeadlessPlugin('test', {
      initialState: { value: 'original' },
    });

    const editor = createEditor({
      plugins: [plugin],
    });

    editor.plugin(plugin).store.set({ value: 'modified' });

    expect(editor.plugin(plugin).store.get('value')).toBe('modified');
    expect(editor.plugin(plugin).initialState.value).toBe('original');
    expect(plugin.initialState.value).toBe('original');
  });

  it('keeps stage-derived defaults separate from mutable store state', () => {
    const plugin = defineHeadlessPlugin('test', {
      initialState: { value: 'original' },
    }).extend(({ store }) => ({
      initialState: {
        ...store.get(),
        value: 'modified',
      },
    }));

    const editor = createEditor({
      plugins: [plugin],
    });

    expect(editor.plugin(plugin).initialState.value).toBe('modified');

    editor.plugin(plugin).store.set({ value: 'runtime' });

    expect(editor.plugin(plugin).store.get('value')).toBe('runtime');
    expect(editor.plugin(plugin).initialState.value).toBe('modified');
    expect(plugin.initialState.value).toBe('original');
  });
});
