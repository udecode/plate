import { createEditor, property, schema, target } from '@platejs/plite';

import type { PluginReference } from '../../lib/plugin';

import { createBaseEditor } from '../../lib/editor';
import { createBasePlugin } from '../../lib/plugin';
import { BaseParagraphPlugin } from '../../lib/plugins';
import { createPlatePlugin } from '../../react/plugin';
import {
  getPlateRuntime,
  getPlateModelPublication,
  getResolvedPluginTargetBinding,
} from './compilePlateModel';

const createElementPlugin = (name: string, type = name) =>
  createBasePlugin({
    name,
    schema: {
      element: {
        content: schema.content.text({ default: 'text', min: 1 }),
      },
    },
    type,
  });

describe('compilePlateModel', () => {
  it('projects one plugin-owned content-root slot onto targeted element plugins', () => {
    const ImagePlugin = createBasePlugin({
      name: 'contentRootImage',
      schema: { element: { void: 'block' } },
    });
    const VideoPlugin = createBasePlugin({
      name: 'contentRootVideo',
      schema: { element: { void: 'block' } },
    });
    const CaptionPlugin = createBasePlugin({
      name: 'caption',
      schema: ({ own, plugins }) => ({
        contentRoots: [
          own.contentRoot(
            schema.content.all(
              [schema.content.group('textBlock'), plugins.blockContent()],
              {
                default: {
                  type: plugins.elementType(BaseParagraphPlugin),
                },
                min: 1,
              }
            ),
            {
              ownership: 'exclusive',
              target: target.types(plugins.elementTypes([ImagePlugin])),
            }
          ),
        ],
      }),
    });
    const editor = createBaseEditor({
      plugins: [ImagePlugin, VideoPlugin, CaptionPlugin],
    });

    expect(
      editor.read.schema.element(ImagePlugin)?.contentRoots.caption
    ).toMatchObject({
      ownership: 'exclusive',
      content: {
        allowedElementTypes: ['p'],
        default: { type: 'p' },
        min: 1,
      },
    });
    expect(
      editor.read.schema.element(VideoPlugin)?.contentRoots.caption
    ).toBeUndefined();
    expect(
      getPlateModelPublication(editor)?.model.contribution.contentRoots
    ).toEqual([
      {
        content: expect.any(Object),
        ownership: 'exclusive',
        slot: 'caption',
        target: target.types([ImagePlugin.type]),
      },
    ]);
  });

  it('derives deterministic identities and changes them only with semantics', () => {
    const first = createBaseEditor();
    const second = createBaseEditor();
    const semantic = createBaseEditor({
      plugins: [
        createBasePlugin({
          name: 'derivedSemanticMark',
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

  it('publishes semantic schema projections from one descriptor', () => {
    const BlockPlugin = createElementPlugin('modelBlock', 'model-block');
    const MarkPlugin = createBasePlugin({
      name: 'modelMark',
      schema: {
        mark: {
          inclusive: false,
          property: property.string(),
          split: 'preserve',
        },
      },
      type: 'model-mark',
      render: { isDecoration: false },
    });
    const PropertyPlugin = createBasePlugin({
      name: 'modelProperty',
      initialState: { targets: [BlockPlugin] as const },
      schema: ({ initialState, own, plugins }) => ({
        properties: [
          own.elementProperty(property.string(), {
            target: target.types(plugins.elementTypes(initialState.targets)),
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

    expect(model.byName.modelBlock).toMatchObject({
      elementType: 'model-block',
      kind: 'element',
      pluginName: 'modelBlock',
      type: 'model-block',
    });
    expect(model.byName.modelMark?.textPropertyId).toMatch(/^text:model-mark@/);
    expect(model.byName.modelProperty?.propertyIds[0]).toMatch(
      /^element:model-property@/
    );
    expect(model.byName.modelProperty?.elementPropertyKeys).toEqual([
      'model-property',
    ]);
    expect(model.byName.modelMark?.properties[0]).toBe(
      model.contribution.properties?.find(
        (declaration) => declaration.key === 'model-mark'
      )
    );
    expect(model.byName.modelProperty?.properties[0]).toBe(
      model.contribution.properties?.find(
        (declaration) => declaration.key === 'model-property'
      )
    );
  });

  it('accepts installed plugin descriptors as typed schema handles', () => {
    const BlockPlugin = createElementPlugin('descriptorBlock', 'descriptor');
    const ContainerPlugin = createBasePlugin({
      name: 'descriptorContainer',
      schema: {
        element: {
          content: schema.content.type('descriptor', { min: 1 }),
        },
      },
      type: 'descriptor-container',
    });
    const ElementPropertyPlugin = createBasePlugin({
      name: 'descriptorElementProperty',
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
          properties: { variant: property.string() },
        },
      },
      type: 'descriptor-element-property',
    });
    const PropertyPlugin = createBasePlugin({
      name: 'descriptorTone',
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
      name: 'descriptorMark',
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
      name: 'descriptorAmbiguous',
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
        ContainerPlugin,
        ElementPropertyPlugin,
        MarkPlugin,
        PropertyPlugin,
        AmbiguousPlugin,
      ],
    });
    const element = editor.read.schema.create(BlockPlugin, {
      tone: 'warm',
    });

    expect(element).toEqual({
      children: [{ text: '' }],
      tone: 'warm',
      type: 'descriptor',
    });
    expect(editor.read.schema.element(BlockPlugin)?.type).toBe('descriptor');
    expect(
      editor.read.schema.allowsElementType(ContainerPlugin, BlockPlugin)
    ).toBe(true);
    expect(
      editor.read.schema.isElementTypeInGroup(BlockPlugin, 'textBlock')
    ).toBe(true);
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
    expect(() => editor.read.schema.create(PropertyPlugin as never)).toThrow(
      'does not declare schema.element'
    );

    const UninstalledElementPropertyPlugin = createBasePlugin({
      name: 'uninstalledDescriptorElementProperty',
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
      editor.read.schema.isElementTypeInGroup(
        UninstalledElementPropertyPlugin as never,
        'textBlock'
      )
    ).toThrow('is not installed');

    const forgedDescriptor = {
      name: BlockPlugin.name,
      type: BlockPlugin.type,
    };

    expect(() => editor.read.schema.create(forgedDescriptor as never)).toThrow(
      'invalid plugin descriptor'
    );
    expect(() => editor.read.schema.element(forgedDescriptor as never)).toThrow(
      'invalid plugin descriptor'
    );
    expect(() =>
      editor.read.schema.isElementTypeInGroup(
        forgedDescriptor as never,
        'textBlock'
      )
    ).toThrow('invalid plugin descriptor');
    expect(() =>
      editor.read.schema.element(Object.create(BlockPlugin) as never)
    ).toThrow('invalid plugin descriptor');

    let accessorReads = 0;
    const accessorDescriptor = Object.defineProperties(
      {},
      {
        name: {
          get: () => {
            accessorReads++;

            return BlockPlugin.name;
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
      BlockPlugin.name,
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
    const ElementPlugin = createPlatePlugin({
      component: ElementComponent,
      name: 'renderElement',
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
      type: 'render-element',
    });
    const MarkPlugin = createPlatePlugin({
      component: MarkComponent,
      name: 'renderMark',
      render: {
        isDecoration: false,
        leafProps: { 'data-leaf': 'mark' },
        textProps: { 'data-text': 'mark' },
      },
      schema: {
        mark: property.boolean({ default: false, omitDefault: true }),
      },
      type: 'render-mark',
    });
    const RuntimeOnlyPlugin = createPlatePlugin({
      component: () => null,
      name: 'runtimeOnly',
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
      name: 'containerInlineChild',
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
          inline: true,
        },
      },
      type: 'container-inline-child',
    });
    const DirectContainerPlugin = createBasePlugin({
      name: 'directBlockContainer',
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
      name: 'groupBlockContainer',
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
      name: 'inlineOnlyContainer',
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
        DirectContainerPlugin.name,
        GroupContainerPlugin.name,
        InlineContainerPlugin.name,
        TextOnlyPlugin.name,
      ].includes(key)
    );

    expect(customContainerTypes).toEqual([
      DirectContainerPlugin.name,
      GroupContainerPlugin.name,
    ]);
  });

  it('configures schema inputs through plugin initialState', () => {
    const TargetPlugin = createElementPlugin('configuredTarget');
    const initialState: {
      label: string;
      nested: { value: number };
      targets: readonly [typeof TargetPlugin];
    } = {
      label: 'initial',
      nested: { value: 1 },
      targets: [TargetPlugin],
    };
    const plugin = createBasePlugin({
      name: 'configuredModel',
      initialState,
      schema: ({ initialState, own, plugins }) => ({
        properties: [
          own.elementProperty(property.string(), {
            target: target.types(plugins.elementTypes(initialState.targets)),
          }),
        ],
      }),
    }).configure({ initialState: { label: 'configured' } });
    const editor = createBaseEditor({
      plugins: [TargetPlugin, plugin],
    });
    const resolved = editor.plugin(plugin).plugin;

    expect(resolved.initialState).toEqual({
      label: 'configured',
      nested: { value: 1 },
      targets: [{ name: 'configuredTarget', type: 'configuredTarget' }],
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

  it('compiles top-level target names into schema bindings', () => {
    const HeadingPlugin = createElementPlugin('configuredHeading', 'heading');
    const PropertyPlugin = createBasePlugin({
      name: 'configuredProperty',
      schema: ({ own, plugins, targetPluginNames }) => ({
        properties: [
          own.elementProperty(property.string(), {
            target: target.types(plugins.elementTypesByName(targetPluginNames)),
          }),
        ],
      }),
      targetPluginNames: [
        HeadingPlugin.name,
        'missingOptionalHeading',
        HeadingPlugin.name,
      ],
      inject: { nodeProps: {} },
    });
    const editor = createBaseEditor({
      plugins: [HeadingPlugin, PropertyPlugin],
    });

    expect(editor.read.schema.identity()?.kind).toBe('derived');

    expect(
      (editor.api as unknown as Record<string, unknown>).plateModel
    ).toBeUndefined();

    const installedPropertyPlugin = editor.plugin(PropertyPlugin).plugin;
    const targetBinding = getResolvedPluginTargetBinding(
      editor,
      installedPropertyPlugin
    );

    expect(installedPropertyPlugin.targetPluginNames).toEqual([
      'configuredHeading',
      'missingOptionalHeading',
      'configuredHeading',
    ]);
    expect(Object.isFrozen(installedPropertyPlugin.targetPluginNames)).toBe(
      true
    );
    expect(targetBinding.names).toEqual(['configuredHeading']);
    expect(targetBinding.missingNames).toEqual(['missingOptionalHeading']);
    expect(targetBinding.types).toEqual(['heading']);
    expect(editor.read.history().schema).toEqual(editor.read.schema.identity());
  });

  it('rejects missing, disabled, and non-element plugin references', () => {
    const MissingPlugin = createElementPlugin('missingTarget');
    const DisabledPlugin = createElementPlugin('disabledTarget').configure({
      enabled: false,
    });
    const MarkPlugin = createBasePlugin({
      name: 'markTarget',
      schema: {
        mark: property.boolean({ default: false, omitDefault: true }),
      },
    });
    const createDependentPlugin = (
      name: string,
      referencedPlugin: PluginReference
    ) =>
      createBasePlugin({
        name,
        initialState: { referencedPlugin },
        schema: ({ initialState, own, plugins }) => ({
          properties: [
            own.elementProperty(property.string(), {
              target: target.type(
                plugins.elementType(initialState.referencedPlugin)
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

  it('never rewrites literal target types as plugin names', () => {
    const NameAliasPlugin = createElementPlugin('literalAlias', 'other-type');
    const LiteralTypePlugin = createElementPlugin(
      'literalTypeOwner',
      'literalAlias'
    );
    const PropertyPlugin = createBasePlugin({
      name: 'literalPropertyOwner',
      schema: {
        properties: [
          schema.elementProperty('literal-property', property.string(), {
            target: target.type('literalAlias'),
          }),
        ],
      },
    });
    const editor = createBaseEditor({
      plugins: [NameAliasPlugin, LiteralTypePlugin, PropertyPlugin],
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
      plugins: [plugin.configure({ component: () => null })],
    });
    const second = createBaseEditor({
      plugins: [plugin.configure({ component: () => null })],
    });

    expect(first.read.schema.identity()?.fingerprint).toBe(
      second.read.schema.identity()?.fingerprint
    );
  });

  it('rejects schema derivation from runtime extension callbacks', () => {
    const plugin = (createBasePlugin({ name: 'runtimeSchema' }).extend as any)(
      () => ({
        schema: {
          mark: property.boolean({ default: false, omitDefault: true }),
        },
      })
    );

    expect(() => createBaseEditor({ plugins: [plugin] })).toThrow(
      'Plate plugin .extend() cannot define `schema`'
    );
  });
});
