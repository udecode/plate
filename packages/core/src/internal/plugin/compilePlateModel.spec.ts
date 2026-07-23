import { createEditor, property, schema, target } from '@platejs/plite';

import type { PluginConfig, PluginReference } from '../../lib/plugin';

import { createBaseEditor } from '../../lib/editor';
import { createBasePlugin } from '../../lib/plugin';
import { BaseParagraphPlugin } from '../../lib/plugins';
import {
  getPlateRuntime,
  getPlateModelPublication,
  getResolvedPluginTargetBinding,
} from './compilePlateModel';
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
      key: 'modelProperty',
      options: { targets: [BlockPlugin] as const },
      schema: ({ options, own, plugins }) => ({
        properties: [
          own.elementProperty(property.string(), {
            target: target.types(plugins.elementTypes(options.targets)),
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

    expect(getPlateRuntime(editor).components).toEqual({
      renderElement: ElementComponent,
      renderMark: MarkComponent,
    });
    expect(getPlateRuntime(editor).pluginCache.node.leafProps).toEqual([
      'renderMark',
    ]);
    expect(getPlateRuntime(editor).pluginCache.node.textProps).toEqual([
      'renderMark',
    ]);
    expect(getPlateRuntime(editor).pluginCache.node.types).toMatchObject({
      'render-element': 'renderElement',
      'render-mark': 'renderMark',
    });
    expect(
      getPlateRuntime(editor).pluginCache.node.types['runtime-only']
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
    const customContainerTypes = getPlateRuntime(
      editor
    ).pluginCache.node.containerTypes.filter((key) =>
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

  it('configures schema inputs through plugin options', () => {
    type Config = PluginConfig<
      'configuredModel',
      {
        label: string;
        nested: { value: number };
        targets: readonly [ReturnType<typeof createElementPlugin>];
      }
    >;

    const TargetPlugin = createElementPlugin('configuredTarget');
    const plugin = createBasePlugin<Config>({
      key: 'configuredModel',
      options: {
        label: 'initial',
        nested: { value: 1 },
        targets: [TargetPlugin],
      },
      schema: ({ options, own, plugins }) => ({
        properties: [
          own.elementProperty(property.string(), {
            target: target.types(plugins.elementTypes(options.targets)),
          }),
        ],
      }),
    }).configure({ options: { label: 'configured' } });
    const editor = createBaseEditor({
      plugins: [TargetPlugin, plugin],
    });
    const resolved = editor.getPlugin(plugin);

    expect(resolved.options).toEqual({
      label: 'configured',
      nested: { value: 1 },
      targets: [{ key: 'configuredTarget', type: 'configuredTarget' }],
    });
  });

  it('bootstraps only unchanged supplied editors', () => {
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

    const explicitValue = [{ children: [{ text: 'keep me' }], type: 'p' }];
    const explicit = createEditor({ initialValue: explicitValue });
    const explicitEditor = createBaseEditor({
      editor: explicit,
      plugins: [plugin],
    });

    expect(explicitEditor).toBe(explicit);
    expect(explicitEditor.read.children()).toEqual(explicitValue);

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
    ).toThrow('unchanged document');
    expect(updated.read.children()).toEqual(updatedValue);
  });

  it('compiles top-level target keys into schema and host bindings', () => {
    const HeadingPlugin = createElementPlugin('configuredHeading', 'heading');
    const PropertyPlugin = createBasePlugin({
      inject: { nodeProps: {} },
      key: 'configuredProperty',
      schema: ({ own, plugins, targetPluginKeys }) => ({
        properties: [
          own.elementProperty(property.string(), {
            target: target.types(plugins.elementTypesByKey(targetPluginKeys)),
          }),
        ],
      }),
      targetPluginKeys: [BaseParagraphPlugin.key],
    });
    const configuredPropertyPlugin = PropertyPlugin.configure({
      targetPluginKeys: [
        HeadingPlugin.key,
        'missingOptionalHeading',
        HeadingPlugin.key,
      ],
    });
    const editor = createBaseEditor({
      plugins: [HeadingPlugin, configuredPropertyPlugin],
    });

    expect(editor.read.schema.identity()?.kind).toBe('derived');

    expect(
      (editor.api as unknown as Record<string, unknown>).plateModel
    ).toBeUndefined();

    const installedPropertyPlugin = editor.getPlugin(configuredPropertyPlugin);
    const targetBinding = getResolvedPluginTargetBinding(
      editor,
      installedPropertyPlugin
    );

    expect(installedPropertyPlugin.targetPluginKeys).toEqual([
      'configuredHeading',
      'missingOptionalHeading',
      'configuredHeading',
    ]);
    expect(Object.isFrozen(installedPropertyPlugin.targetPluginKeys)).toBe(
      true
    );
    expect(targetBinding.keys).toEqual(['configuredHeading']);
    expect(targetBinding.missingKeys).toEqual(['missingOptionalHeading']);
    expect(targetBinding.types).toEqual(['heading']);
    expect(editor.read.history().schema).toEqual(editor.read.schema.identity());
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
        key,
        options: { referencedPlugin },
        schema: ({ options, own, plugins }) => ({
          properties: [
            own.elementProperty(property.string(), {
              target: target.type(
                plugins.elementType(options.referencedPlugin)
              ),
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
