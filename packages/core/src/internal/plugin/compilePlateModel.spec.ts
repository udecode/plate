import {
  createEditor,
  definePropertyPolicy,
  property,
  schema,
  target,
} from '@platejs/plite';

import type { PluginConfig, PluginReference } from '../../lib/plugin';

import { createBaseEditor } from '../../lib/editor';
import { createBasePlugin } from '../../lib/plugin';
import { BaseParagraphPlugin } from '../../lib/plugins';
import { getPlateModelPublication } from './compilePlateModel';
import { prepareParserRegistry } from './prepareParserRegistry';

const createElementPlugin = (key: string, type = key) =>
  createBasePlugin({
    key,
    schema: {
      element: {
        content: schema.content.text({ default: 'text', min: 1 }),
      },
    },
    type,
  });

describe('compilePlateModel', () => {
  it('derives deterministic identities and changes them only with semantics', () => {
    const first = createBaseEditor();
    const second = createBaseEditor();
    const semantic = createBaseEditor({
      plugins: [
        createBasePlugin({
          key: 'derivedSemanticMark',
          schema: {
            mark: property.boolean({ default: false, omitDefault: true }),
          },
        }),
      ],
    });

    expect(first.read.schema.identity()).toEqual(second.read.schema.identity());
    expect(first.read.schema.identity()?.kind).toBe('derived');
    expect(semantic.read.schema.identity()?.kind).toBe('derived');
    expect(semantic.read.schema.identity()?.fingerprint).not.toBe(
      first.read.schema.identity()?.fingerprint
    );
  });

  it('publishes semantic and parser projections from one descriptor', () => {
    const BlockPlugin = createElementPlugin('modelBlock', 'model-block');
    const MarkPlugin = createBasePlugin({
      key: 'modelMark',
      render: { isDecoration: false },
      schema: {
        mark: {
          inclusive: false,
          property: property.string(),
          split: 'preserve',
        },
      },
      type: 'model-mark',
    });
    const PropertyPlugin = createBasePlugin({
      config: { targets: [BlockPlugin] as const },
      key: 'modelProperty',
      schema: ({ config, own, plugins }) => ({
        properties: [
          own.elementProperty(property.string(), {
            target: target.types(plugins.elementTypes(config.targets)),
            typeChange: 'preserve-if-allowed',
          }),
        ],
      }),
      type: 'model-property',
    });
    const editor = createBaseEditor({
      plugins: [BlockPlugin, MarkPlugin, PropertyPlugin],
    });
    const model = getPlateModelPublication(editor)!.model;
    const parserByKey = Object.fromEntries(
      prepareParserRegistry(editor).plugins.map((plugin) => [
        plugin.key,
        plugin,
      ])
    );

    expect(model.byKey.modelBlock).toMatchObject({
      elementType: 'model-block',
      kind: 'element',
      pluginKey: 'modelBlock',
      type: 'model-block',
    });
    expect(model.byKey.modelMark?.textPropertyId).toMatch(/^text:model-mark@/);
    expect(model.byKey.modelProperty?.propertyIds[0]).toMatch(
      /^element:model-property@/
    );
    expect(model.byKey.modelProperty?.elementPropertyKeys).toEqual([
      'model-property',
    ]);
    expect(parserByKey.modelBlock).toMatchObject({
      isElement: true,
      isLeaf: false,
    });
    expect(parserByKey.modelMark).toMatchObject({
      isElement: false,
      isLeaf: true,
    });
  });

  it('accepts installed plugin descriptors as typed schema handles', () => {
    const BlockPlugin = createElementPlugin('descriptorBlock', 'descriptor');
    const ElementPropertyPlugin = createBasePlugin({
      key: 'descriptorElementProperty',
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
          properties: { variant: property.string() },
        },
      },
      type: 'descriptor-element-property',
    });
    const PropertyPlugin = createBasePlugin({
      key: 'descriptorTone',
      schema: ({ own }) => ({
        properties: [
          own.elementProperty(property.string(), {
            target: target.type('descriptor'),
          }),
        ],
      }),
      type: 'tone',
    });
    const MarkPlugin = createBasePlugin({
      key: 'descriptorMark',
      schema: {
        mark: {
          inclusive: false,
          property: property.string(),
          split: 'preserve',
        },
      },
      type: 'descriptor-mark',
    });
    const AmbiguousPlugin = createBasePlugin({
      key: 'descriptorAmbiguous',
      schema: {
        properties: [
          schema.elementProperty('first', property.string(), {
            target: target.type('descriptor'),
          }),
          schema.elementProperty('second', property.number(), {
            target: target.type('descriptor'),
          }),
        ],
      },
      type: 'ambiguous',
    });
    const editor = createBaseEditor({
      plugins: [
        BlockPlugin,
        ElementPropertyPlugin,
        MarkPlugin,
        PropertyPlugin,
        AmbiguousPlugin,
      ],
    });
    const element = editor.read.schema.createAndFill(BlockPlugin, {
      tone: 'warm',
    });

    expect(element).toEqual({
      children: [{ text: '' }],
      tone: 'warm',
      type: 'descriptor',
    });
    expect(editor.read.schema.element(BlockPlugin)?.type).toBe('descriptor');
    expect(
      editor.read.schema.createAndFill(editor.read.schema.handle(BlockPlugin))
    ).toEqual({ children: [{ text: '' }], type: 'descriptor' });
    expect(editor.read.schema.getElementProperty(element, PropertyPlugin)).toBe(
      'warm'
    );
    expect(editor.read.schema.property(PropertyPlugin)).toMatchObject({
      key: 'tone',
      placement: 'element',
    });
    expect(editor.read.schema.property(ElementPropertyPlugin)).toMatchObject({
      key: 'variant',
      placement: 'element',
    });
    expect(editor.read.schema.property(MarkPlugin)).toMatchObject({
      key: 'descriptor-mark',
      placement: 'text',
    });
    expect(() => editor.read.schema.property(AmbiguousPlugin as never)).toThrow(
      'cannot identify one schema property'
    );
    expect(() => editor.read.schema.property(BlockPlugin as never)).toThrow(
      'cannot identify one schema property'
    );
    expect(() =>
      editor.read.schema.getElementProperty(element, AmbiguousPlugin as never)
    ).toThrow('cannot identify one element property');
    expect(() =>
      editor.read.schema.createAndFill(PropertyPlugin as never)
    ).toThrow('does not declare schema.element');

    const UninstalledElementPropertyPlugin = createBasePlugin({
      key: 'uninstalledDescriptorElementProperty',
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
          properties: { tone: property.string() },
        },
      },
      type: 'uninstalled-descriptor-element-property',
    });

    expect(() =>
      editor.read.schema.getElementProperty(
        element,
        UninstalledElementPropertyPlugin as never
      )
    ).toThrow('is not installed');
    expect(() =>
      editor.read.schema.property(UninstalledElementPropertyPlugin as never)
    ).toThrow('is not installed');
    expect(() =>
      editor.read.schema.handle(UninstalledElementPropertyPlugin as never)
    ).toThrow('is not installed');

    const forgedDescriptor = {
      key: BlockPlugin.key,
      type: BlockPlugin.type,
    };

    expect(() =>
      editor.read.schema.createAndFill(forgedDescriptor as never)
    ).toThrow('invalid plugin descriptor');
    expect(() => editor.read.schema.element(forgedDescriptor as never)).toThrow(
      'invalid plugin descriptor'
    );
    expect(() => editor.read.schema.handle(forgedDescriptor as never)).toThrow(
      'invalid plugin descriptor'
    );
    expect(() =>
      editor.read.schema.element(Object.create(BlockPlugin) as never)
    ).toThrow('invalid plugin descriptor');

    let accessorReads = 0;
    const accessorDescriptor = Object.defineProperties(
      {},
      {
        key: {
          get: () => {
            accessorReads++;

            return BlockPlugin.key;
          },
        },
        type: { value: BlockPlugin.type },
      }
    );

    expect(() =>
      editor.read.schema.element(accessorDescriptor as never)
    ).toThrow('invalid plugin descriptor');
    expect(accessorReads).toBe(0);

    const StaleBlockPlugin = createElementPlugin(
      BlockPlugin.key,
      'stale-descriptor'
    );
    const staleEditor = createBaseEditor({
      plugins: [StaleBlockPlugin],
    });

    expect(() => staleEditor.read.schema.element(BlockPlugin as never)).toThrow(
      `expects type "${BlockPlugin.type}" but the installed plugin owns "${StaleBlockPlugin.type}"`
    );
  });

  it('publishes render indexes only for schema-owned types', () => {
    const ElementComponent = () => null;
    const MarkComponent = () => null;
    const ElementPlugin = createElementPlugin(
      'renderElement',
      'render-element'
    ).withComponent(ElementComponent);
    const MarkPlugin = createBasePlugin({
      key: 'renderMark',
      render: {
        isDecoration: false,
        leafProps: { 'data-leaf': 'mark' },
        node: MarkComponent,
        textProps: { 'data-text': 'mark' },
      },
      schema: {
        mark: property.boolean({ default: false, omitDefault: true }),
      },
      type: 'render-mark',
    });
    const RuntimeOnlyPlugin = createBasePlugin({
      key: 'runtimeOnly',
      render: { node: () => null },
      type: 'runtime-only',
    });
    const editor = createBaseEditor({
      plugins: [ElementPlugin, MarkPlugin, RuntimeOnlyPlugin],
    });

    expect(editor.runtime.components).toEqual({
      renderElement: ElementComponent,
      renderMark: MarkComponent,
    });
    expect(editor.runtime.pluginCache.node.leafProps).toEqual(['renderMark']);
    expect(editor.runtime.pluginCache.node.textProps).toEqual(['renderMark']);
    expect(editor.runtime.pluginCache.node.types).toMatchObject({
      'render-element': 'renderElement',
      'render-mark': 'renderMark',
    });
    expect(
      editor.runtime.pluginCache.node.types['runtime-only']
    ).toBeUndefined();
  });

  it('classifies block containers from compiled child relations', () => {
    const BlockChildPlugin = createElementPlugin(
      'containerBlockChild',
      'container-block-child'
    );
    const InlineChildPlugin = createBasePlugin({
      key: 'containerInlineChild',
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
          inline: true,
        },
      },
      type: 'container-inline-child',
    });
    const DirectContainerPlugin = createBasePlugin({
      key: 'directBlockContainer',
      schema: {
        element: {
          content: schema.content.type(BlockChildPlugin.type, {
            default: { type: BlockChildPlugin.type },
            min: 1,
          }),
        },
      },
    });
    const GroupContainerPlugin = createBasePlugin({
      key: 'groupBlockContainer',
      schema: ({ plugins }) => ({
        element: {
          content: plugins.blockContent({
            default: { type: BlockChildPlugin.type },
            min: 1,
          }),
        },
      }),
    });
    const InlineContainerPlugin = createBasePlugin({
      key: 'inlineOnlyContainer',
      schema: {
        element: {
          content: schema.content.any(
            [
              schema.content.text(),
              schema.content.type(InlineChildPlugin.type),
            ],
            { default: 'text', min: 1 }
          ),
        },
      },
    });
    const TextOnlyPlugin = createElementPlugin(
      'textOnlyContainerCandidate',
      'text-only-container-candidate'
    );
    const editor = createBaseEditor({
      plugins: [
        BlockChildPlugin,
        InlineChildPlugin,
        DirectContainerPlugin,
        GroupContainerPlugin,
        InlineContainerPlugin,
        TextOnlyPlugin,
      ],
    });
    const customContainerTypes =
      editor.runtime.pluginCache.node.containerTypes.filter((key) =>
        [
          DirectContainerPlugin.key,
          GroupContainerPlugin.key,
          InlineContainerPlugin.key,
          TextOnlyPlugin.key,
        ].includes(key)
      );

    expect(customContainerTypes).toEqual([
      DirectContainerPlugin.key,
      GroupContainerPlugin.key,
    ]);
  });

  it('snapshots plugin references into frozen descriptor identities', () => {
    type Config = PluginConfig<
      'configuredModel',
      {},
      {},
      {},
      {},
      {},
      readonly [],
      {
        label: string;
        nested: { value: number };
        targets: readonly [ReturnType<typeof createElementPlugin>];
      }
    >;

    const TargetPlugin = createElementPlugin('configuredTarget');
    const plugin = createBasePlugin<Config>({
      config: {
        label: 'initial',
        nested: { value: 1 },
        targets: [TargetPlugin],
      },
      key: 'configuredModel',
      schema: ({ config, own, plugins }) => ({
        properties: [
          own.elementProperty(property.string(), {
            target: target.types(plugins.elementTypes(config.targets)),
          }),
        ],
      }),
    }).configure({ config: { label: 'configured' } });
    const editor = createBaseEditor({
      plugins: [TargetPlugin, plugin],
    });
    const resolved = editor.getPlugin(plugin);

    expect(resolved.config).toEqual({
      label: 'configured',
      nested: { value: 1 },
      targets: [{ key: 'configuredTarget', type: 'configuredTarget' }],
    });
    expect(Object.isFrozen(resolved.config)).toBe(true);
    expect(Object.isFrozen(resolved.config.nested)).toBe(true);
    expect(Object.isFrozen(resolved.config.targets)).toBe(true);
    expect(Object.isFrozen(resolved.config.targets[0])).toBe(true);
    expect(resolved.config.targets[0]).not.toBe(TargetPlugin);
    expect(Object.isFrozen(TargetPlugin)).toBe(false);
    expect(() => {
      (resolved.config.targets[0] as { key: string }).key = 'changed';
    }).toThrow();
  });

  it('rejects mutable prototype objects in immutable plugin config', () => {
    expect(() =>
      createBasePlugin({
        // @ts-expect-error immutable config rejects mutable prototype objects
        config: { value: new Date(0) },
        key: 'dateConfig',
      })
    ).toThrow('Move Date, Map, class instances');
    expect(() =>
      createBasePlugin({
        // @ts-expect-error immutable config rejects mutable prototype objects
        config: { value: new Map([['key', 'value']]) },
        key: 'mapConfig',
      })
    ).toThrow('Move Date, Map, class instances');
  });

  it('recognizes plugin references nominally without evaluating impostors', () => {
    let accessorReads = 0;
    const accessor = {};

    Object.defineProperty(accessor, 'key', {
      enumerable: true,
      get() {
        accessorReads++;

        return 'configuredTarget';
      },
    });
    Object.defineProperties(accessor, {
      clone: { enumerable: true, value: () => accessor },
      configure: { enumerable: true, value: () => accessor },
    });

    class FakePluginReference {
      get key() {
        accessorReads++;

        return 'configuredTarget';
      }

      clone() {
        return this;
      }

      configure() {
        return this;
      }
    }

    expect(() =>
      createBasePlugin({ config: { target: accessor }, key: 'accessorRef' })
    ).toThrow('property accessors');
    expect(() =>
      createBasePlugin({
        config: { target: new FakePluginReference() } as never,
        key: 'classRef',
      })
    ).toThrow('Move Date, Map, class instances');
    expect(() =>
      createBasePlugin({
        config: {
          target: {
            clone: () => undefined,
            configure: () => undefined,
            key: 'configuredTarget',
          },
        } as never,
        key: 'forgedRef',
      })
    ).toThrow('Move functions and runtime resources to options');
    expect(accessorReads).toBe(0);
  });

  it('keeps canonical plugin clones nominal with frozen configuration', () => {
    const target = createBasePlugin({
      config: { nested: { value: 1 } },
      key: 'clonedTarget',
    });
    const clone = target.clone();
    const owner = createBasePlugin({
      config: { target: clone },
      key: 'cloneOwner',
    });

    expect(clone).not.toBe(target);
    expect(Object.isFrozen(clone.config)).toBe(true);
    expect(Object.isFrozen(clone.config.nested)).toBe(true);
    expect(owner.config.target).toEqual({
      key: 'clonedTarget',
      type: 'clonedTarget',
    });
    expect(Object.isFrozen(owner.config.target)).toBe(true);
  });

  it('accepts genuine property policies in immutable plugin config', () => {
    const policy = definePropertyPolicy({
      id: 'plate-plugin-config-policy',
      validate: (value): value is string => typeof value === 'string',
      version: 1,
    });
    type PolicyConfig = PluginConfig<
      'policyConfig',
      {},
      {},
      {},
      {},
      {},
      readonly [],
      { policy: typeof policy }
    >;
    const plugin = createBasePlugin<PolicyConfig>({
      config: { policy },
      key: 'policyConfig',
    });

    expect(plugin.config.policy).toBe(policy);
  });

  it('rejects forged schema-token symbols without mutating the input', () => {
    const nested = { value: 1 };
    const forged = {
      [Symbol.for('platejs.plite.editorSchemaConfigToken')]: true,
      nested,
    };

    expect(() =>
      createBasePlugin({
        config: { token: forged } as never,
        key: 'forgedSchemaToken',
      })
    ).toThrow('only string-keyed plain data');
    expect(Object.isFrozen(forged)).toBe(false);
    expect(Object.isFrozen(nested)).toBe(false);

    nested.value = 2;
    expect(nested.value).toBe(2);
  });

  it('bootstraps only untouched supplied editors', () => {
    const plugin = createElementPlugin('suppliedElement');
    const untouched = createEditor();
    const editor = createBaseEditor({
      editor: untouched,
      plugins: [plugin],
    });

    expect(editor).toBe(untouched);
    expect(editor.read.children()).toEqual([
      { children: [{ text: '' }], type: 'p' },
    ]);

    const explicitValue = [{ children: [{ text: 'keep me' }], type: 'legacy' }];
    const explicit = createEditor({ initialValue: explicitValue });

    expect(() =>
      createBaseEditor({
        editor: explicit,
        plugins: [plugin],
      })
    ).toThrow('untouched editor without an explicit initial document');
    expect(explicit.read.children()).toEqual(explicitValue);

    const updated = createEditor();
    const updatedValue = [
      { children: [{ text: 'keep this too' }], type: 'legacy' },
    ];

    updated.update((tx) => {
      tx.value.replace({ children: updatedValue });
    });

    expect(() =>
      createBaseEditor({
        editor: updated,
        plugins: [plugin],
      })
    ).toThrow('untouched empty document');
    expect(updated.read.children()).toEqual(updatedValue);
  });

  it('publishes configured schema and host bindings as one revision', () => {
    const HeadingPlugin = createElementPlugin('configuredHeading', 'heading');
    const PropertyPlugin = createBasePlugin({
      config: { targetPluginKeys: [BaseParagraphPlugin.key] },
      inject: { nodeProps: {} },
      key: 'configuredProperty',
      schema: ({ config, own, plugins }) => ({
        properties: [
          own.elementProperty(property.string(), {
            target: target.types(
              plugins.elementTypesByKey(config.targetPluginKeys)
            ),
          }),
        ],
      }),
    });
    const editor = createBaseEditor({
      plugins: [HeadingPlugin, PropertyPlugin],
    });
    const before = getPlateModelPublication(editor)!;
    const beforeFingerprint = editor.read.schema.identity()?.fingerprint;

    expect(editor.read.schema.identity()?.kind).toBe('derived');

    expect(
      (editor.api as unknown as Record<string, unknown>).plateModel
    ).toBeUndefined();

    editor.configure(PropertyPlugin, {
      targetPluginKeys: [HeadingPlugin.key],
    });

    const after = getPlateModelPublication(editor)!;

    expect(after).not.toBe(before);
    expect(after.model).not.toBe(before.model);
    expect(editor.getPlugin(PropertyPlugin).config.targetPluginKeys).toEqual([
      'configuredHeading',
    ]);
    expect(editor.read.schema.identity()?.fingerprint).not.toBe(
      beforeFingerprint
    );
    expect(editor.read.history().schema).toEqual(editor.read.schema.identity());
  });

  it('keeps the previous Plate revision visible when candidate compilation fails', () => {
    type Config = PluginConfig<
      'configurableContainer',
      {},
      {},
      {},
      {},
      {},
      readonly [],
      { childType: string }
    >;
    const Component = () => null;
    const plugin = createBasePlugin<Config>({
      config: { childType: 'p' },
      key: 'configurableContainer',
      render: { node: Component },
      schema: ({ config }) => ({
        element: {
          content: schema.content.type(config.childType, {
            default: { type: config.childType },
            min: 1,
          }),
        },
      }),
    });
    const editor = createBaseEditor({
      plugins: [plugin],
    });
    const publication = getPlateModelPublication(editor)!;
    const parserRegistry = prepareParserRegistry(editor);
    const identity = editor.read.schema.identity();

    expect(() =>
      editor.configure(plugin, { childType: 'missing-child' })
    ).toThrow();

    expect(getPlateModelPublication(editor)).toBe(publication);
    expect(getPlateModelPublication(editor)?.model).toBe(publication.model);
    expect(editor.runtime.components.configurableContainer).toBe(Component);
    expect(editor.getPlugin(plugin).config.childType).toBe('p');
    expect(editor.read.schema.identity()).toEqual(identity);
    expect(prepareParserRegistry(editor)).toBe(parserRegistry);
  });

  it('rejects missing, disabled, and non-element plugin references', () => {
    const MissingPlugin = createElementPlugin('missingTarget');
    const DisabledPlugin = createElementPlugin('disabledTarget').configure({
      enabled: false,
    });
    const MarkPlugin = createBasePlugin({
      key: 'markTarget',
      schema: {
        mark: property.boolean({ default: false, omitDefault: true }),
      },
    });
    const createDependentPlugin = (
      key: string,
      referencedPlugin: PluginReference
    ) =>
      createBasePlugin({
        config: { referencedPlugin },
        key,
        schema: ({ config, own, plugins }) => ({
          properties: [
            own.elementProperty(property.string(), {
              target: target.type(plugins.elementType(config.referencedPlugin)),
            }),
          ],
        }),
      });

    expect(() =>
      createBaseEditor({
        plugins: [createDependentPlugin('missingOwner', MissingPlugin)],
      })
    ).toThrow('missing or disabled plugin "missingTarget"');
    expect(() =>
      createBaseEditor({
        plugins: [
          DisabledPlugin,
          createDependentPlugin('disabledOwner', DisabledPlugin),
        ],
      })
    ).toThrow('missing or disabled plugin "disabledTarget"');
    expect(() =>
      createBaseEditor({
        plugins: [MarkPlugin, createDependentPlugin('markOwner', MarkPlugin)],
      })
    ).toThrow('schema reference "markTarget" is not an element plugin');
  });

  it('never rewrites literal target types as plugin keys', () => {
    const KeyAliasPlugin = createElementPlugin('literalAlias', 'other-type');
    const LiteralTypePlugin = createElementPlugin(
      'literalTypeOwner',
      'literalAlias'
    );
    const PropertyPlugin = createBasePlugin({
      key: 'literalPropertyOwner',
      schema: {
        properties: [
          schema.elementProperty('literal-property', property.string(), {
            target: target.type('literalAlias'),
          }),
        ],
      },
    });
    const editor = createBaseEditor({
      plugins: [KeyAliasPlugin, LiteralTypePlugin, PropertyPlugin],
    });
    const declaration = getPlateModelPublication(
      editor
    )?.model.contribution.properties?.find(
      (candidate) => candidate.key === 'literal-property'
    );

    expect(declaration?.target).toEqual(target.type('literalAlias'));
  });

  it('keeps render-only changes out of the schema fingerprint', () => {
    const plugin = createElementPlugin('fingerprintElement');
    const first = createBaseEditor({
      plugins: [plugin.withComponent(() => null)],
    });
    const second = createBaseEditor({
      plugins: [plugin.withComponent(() => null)],
    });

    expect(first.read.schema.identity()?.fingerprint).toBe(
      second.read.schema.identity()?.fingerprint
    );
  });

  it('rejects schema derivation from runtime extension callbacks', () => {
    const plugin = (createBasePlugin({ key: 'runtimeSchema' }).extend as any)(
      () => ({
        schema: {
          mark: property.boolean({ default: false, omitDefault: true }),
        },
      })
    );

    expect(() => createBaseEditor({ plugins: [plugin] })).toThrow(
      'extension callbacks cannot define `schema`'
    );
  });
});
