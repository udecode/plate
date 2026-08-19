import { createEditor, property, schema, target } from '@platejs/plite';
import { getEditorExtensionRegistry } from '@platejs/plite/internal';

import type { PluginReference } from '../../lib/plugin';

import { createBaseEditor } from '../../lib/editor';
import { defineBasePlugin } from '../../lib/plugin';
import { BaseParagraphPlugin } from '../../lib/plugins';
import { definePlatePlugin } from '../../react/plugin';
import {
  getPlateRuntime,
  getPlateModelPublication,
  getResolvedPluginTargetBinding,
} from './compilePlateModel';

const createElementPlugin = <const TName extends string>(name: TName) =>
  defineBasePlugin(name, {
    schema: {
      element: {
        content: schema.content.text({ default: 'text', min: 1 }),
      },
    },
  });

describe('compilePlateModel', () => {
  it('keeps capability names separate from persisted element types and property keys', () => {
    const ElementPlugin = defineBasePlugin('elementCapability', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
          type: 'persistedElement',
        },
      },
    });
    const MarkPlugin = defineBasePlugin('markCapability', {
      schema: {
        mark: {
          key: 'persistedMark',
          property: property.boolean({ default: false, omitDefault: true }),
        },
      },
    });
    const DefaultElementPlugin = createElementPlugin('defaultElement');
    const DefaultMarkPlugin = defineBasePlugin('defaultMark', {
      schema: {
        mark: property.boolean({ default: false, omitDefault: true }),
      },
    });
    const BehaviorPlugin = defineBasePlugin('behaviorCapability', {
      on: { commit: () => {} },
    });
    const editor = createBaseEditor({
      plugins: [
        ElementPlugin,
        MarkPlugin,
        DefaultElementPlugin,
        DefaultMarkPlugin,
        BehaviorPlugin,
      ],
    });
    const model = getPlateModelPublication(editor)!.model;

    expect(editor.plugin(ElementPlugin)).toMatchObject({
      name: 'elementCapability',
      schema: { type: 'persistedElement' },
    });
    expect(editor.plugin(MarkPlugin)).toMatchObject({
      name: 'markCapability',
      schema: { key: 'persistedMark' },
    });
    expect(editor.plugin(DefaultElementPlugin).schema.type).toBe(
      'defaultElement'
    );
    expect(editor.plugin(DefaultMarkPlugin).schema.key).toBe('defaultMark');
    expect(model.byName.elementCapability?.elementType).toBe(
      'persistedElement'
    );
    expect(model.byName.markCapability?.propertyKey).toBe('persistedMark');
    expect(model.byType.persistedElement?.name).toBe('elementCapability');
    expect(model.byKey.persistedMark?.name).toBe('markCapability');
    expect(editor.read.schema.element(ElementPlugin)?.type).toBe(
      'persistedElement'
    );
    expect(editor.read.schema.create(ElementPlugin)).toEqual({
      children: [{ text: '' }],
      type: 'persistedElement',
    });
    expect('schema' in editor.plugin(BehaviorPlugin)).toBe(false);
    expect(editor.plugin('elementCapability').schema.type).toBe(
      'persistedElement'
    );
    expect(editor.plugin('markCapability').schema.key).toBe('persistedMark');
    expect(() => editor.plugin('elementCapability').schema.key).toThrow(
      'does not own a primary mark schema identity'
    );
    expect(() => editor.plugin('markCapability').schema.type).toThrow(
      'does not own a primary element schema identity'
    );
    expect(() => editor.plugin('behaviorCapability').schema.type).toThrow(
      'does not own a primary element schema identity'
    );
  });

  it('binds generic element updates to the plugin persisted type', () => {
    const ElementPlugin = defineBasePlugin('calloutCapability', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
          properties: {
            tone: property.enum(['info', 'warning'] as const, {
              default: 'info',
            }),
          },
          type: 'callout_node',
        },
      },
    });
    const CustomInsertPlugin = defineBasePlugin('semanticCard', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
          properties: {
            label: property.string({ default: '' }),
          },
        },
      },
      update: ({ tx }) => ({
        insert: (label: string) => {
          tx.nodes.insert(tx.schema.create('semanticCard', { label }), {
            at: [0],
          });
        },
      }),
    });
    const editor = createBaseEditor({
      plugins: [ElementPlugin, CustomInsertPlugin],
    });
    const element = editor.plugin(ElementPlugin);

    element.update.toggle({ at: [0] });
    expect(editor.read.children()[0]).toMatchObject({ type: 'callout_node' });
    element.update.toggle({ at: [0] });
    expect(editor.read.children()[0]).toMatchObject({ type: 'paragraph' });

    element.update.insert({ tone: 'warning' }, { at: [1] });
    expect(editor.read.children()[1]).toEqual({
      children: [{ text: '' }],
      tone: 'warning',
      type: 'callout_node',
    });

    element.update.set({ tone: 'info' }, { at: [1] });
    expect(editor.read.children()[1]).toMatchObject({
      tone: 'info',
      type: 'callout_node',
    });

    element.update.remove({ at: [1] });
    expect(editor.read.children()).toHaveLength(1);

    element.update.insert({ tone: 'warning' });
    expect(editor.read.children()).toHaveLength(1);

    editor.update((tx) => {
      tx.selection.set({ offset: 0, path: [0, 0] });
    });
    element.update.insert({ tone: 'warning' });
    expect(editor.read.children()[1]).toMatchObject({
      tone: 'warning',
      type: 'callout_node',
    });

    editor.update.semanticCard.insert('custom');
    expect(editor.read.children()[0]).toMatchObject({
      label: 'custom',
      type: 'semanticCard',
    });
  });

  it('applies history policy to descriptor-scoped generic updates', () => {
    const ElementPlugin = defineBasePlugin('policyElement', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
          properties: {
            tone: property.enum(['info', 'warning'] as const, {
              default: 'info',
            }),
          },
        },
      },
    });
    const editor = createBaseEditor({
      initialValue: [
        { children: [{ text: '' }], tone: 'info', type: 'policyElement' },
      ],
      plugins: [ElementPlugin],
    });
    const element = editor.plugin(ElementPlugin);

    element.update.set({ tone: 'warning' }, { at: [0] });
    element.update({ history: 'merge' }).set({ tone: 'info' }, { at: [0] });

    expect(editor.read.history().undos).toHaveLength(1);
    editor.update((tx) => tx.history.undo());
    expect(editor.read.children()[0]).toMatchObject({ tone: 'info' });
  });

  it('rolls back a failing descriptor-scoped policy update', () => {
    const ElementPlugin = defineBasePlugin('rollbackElement', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
          properties: {
            tone: property.enum(['info', 'warning'] as const, {
              default: 'info',
            }),
          },
        },
      },
      update: ({ tx }) => ({
        fail: () => {
          tx.nodes.set({ tone: 'warning' }, { at: [0] });
          throw new Error('rollback');
        },
      }),
    });
    const editor = createBaseEditor({
      initialValue: [
        { children: [{ text: '' }], tone: 'info', type: 'rollbackElement' },
      ],
      plugins: [ElementPlugin],
    });

    expect(() =>
      editor.plugin(ElementPlugin).update({ tags: 'rollback-test' }).fail()
    ).toThrow('rollback');
    expect(editor.read.children()[0]).toMatchObject({ tone: 'info' });
  });

  it('does not invent a primary key for aggregate property contributors', () => {
    const AggregatePropertiesPlugin = defineBasePlugin(
      'aggregatePropertiesRuntime',
      {
        schema: {
          properties: {
            firstProperty: schema.elementProperty(property.string(), {
              target: target.group('element'),
            }),
            secondProperty: schema.elementProperty(property.number(), {
              target: target.group('element'),
            }),
          },
        },
      }
    );
    const editor = createBaseEditor({ plugins: [AggregatePropertiesPlugin] });

    expect('schema' in editor.plugin(AggregatePropertiesPlugin)).toBe(false);
    expect(
      () => editor.plugin('aggregatePropertiesRuntime').schema.type
    ).toThrow('does not own a primary element schema identity');
  });

  it('synthesizes semantic primary-mark reads and updates', () => {
    const BoldPlugin = defineBasePlugin('boldRuntime', {
      schema: {
        mark: property.boolean({ default: false, omitDefault: true }),
      },
    });
    const TonePlugin = defineBasePlugin('toneRuntime', {
      schema: { mark: property.enum(['warm', 'cool'] as const) },
    });
    const point = { offset: 0, path: [0, 0] };
    const editor = createBaseEditor({
      initialValue: [{ children: [{ text: 'text' }], type: 'paragraph' }],
      plugins: [BaseParagraphPlugin, BoldPlugin, TonePlugin],
    });
    editor.update.selection.set(point);
    const bold = editor.plugin(BoldPlugin);
    const tone = editor.plugin(TonePlugin);

    expect(bold.read.value()).toBeUndefined();
    expect(bold.read.isActive()).toBe(false);
    bold.update.toggle();
    expect(bold.read.value()).toBe(true);
    expect(bold.read.isActive()).toBe(true);
    bold.update.clear();
    expect(bold.read.value()).toBeUndefined();
    editor.update.boldRuntime.set(true);
    expect(editor.read.boldRuntime.value()).toBe(true);
    editor.update.boldRuntime.clear();

    tone.update.set('warm');
    expect(tone.read.value()).toBe('warm');
    expect(tone.read.isActive()).toBe(true);
    expect(tone.read.isActive('cool')).toBe(false);
    expect(() => Reflect.apply(tone.update.toggle, tone.update, [])).toThrow(
      'requires a value to toggle'
    );
    tone.update.toggle('warm');
    expect(tone.read.value()).toBeUndefined();
  });

  it('projects one plugin-owned content-root slot onto targeted element plugins', () => {
    const ImagePlugin = defineBasePlugin('contentRootImage', {
      schema: { element: { void: 'block' } },
    });
    const VideoPlugin = defineBasePlugin('contentRootVideo', {
      schema: { element: { void: 'block' } },
    });
    const CaptionPlugin = defineBasePlugin('caption', {
      schema: ({ plugins }) => {
        const blockContent = plugins.blockContent({
          default: BaseParagraphPlugin,
        });

        return {
          contentRoots: [
            {
              content: schema.content.all(
                [schema.content.group('textBlock'), blockContent.allowed],
                { default: blockContent.default, min: 1 }
              ),
              ownership: 'exclusive',
              slot: 'caption',
              target: target.elements([ImagePlugin]),
            },
          ],
        };
      },
    });
    const editor = createBaseEditor({
      plugins: [ImagePlugin, VideoPlugin, CaptionPlugin],
    });

    expect(
      editor.read.schema.element(ImagePlugin)?.contentRoots.caption
    ).toMatchObject({
      ownership: 'exclusive',
      content: {
        allowedElementTypes: ['paragraph'],
        default: { type: 'paragraph' },
        min: 1,
      },
    });
    expect(
      editor.read.schema.element(VideoPlugin)?.contentRoots.caption
    ).toBeUndefined();
    expect(
      getPlateModelPublication(editor)?.model.contribution.contentRoots
    ).toMatchObject([
      {
        content: expect.any(Object),
        ownership: 'exclusive',
        slot: 'caption',
        target: target.types(['contentRootImage']),
      },
    ]);
  });

  it('derives deterministic identities and changes them only with semantics', () => {
    const first = createBaseEditor();
    const second = createBaseEditor();
    const semantic = createBaseEditor({
      plugins: [
        defineBasePlugin('derivedSemanticMark', {
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
    const BlockPlugin = createElementPlugin('modelBlock');
    const MarkPlugin = defineBasePlugin('modelMark', {
      schema: {
        mark: {
          inclusive: false,
          property: property.string(),
          split: 'preserve',
        },
      },
      render: { isDecoration: false },
    });
    const PropertyPlugin = defineBasePlugin('modelProperty', {
      initialState: { targets: [BlockPlugin] as const },
      schema: ({ initialState }) => ({
        properties: {
          modelProperty: schema.elementProperty(property.string(), {
            target: target.elements(initialState.targets),
            typeChange: 'preserve-if-allowed',
          }),
        },
      }),
    });
    const editor = createBaseEditor({
      plugins: [BlockPlugin, MarkPlugin, PropertyPlugin],
    });
    const model = getPlateModelPublication(editor)!.model;
    const schemaContributions =
      getEditorExtensionRegistry(editor).schemaContributions.records;

    expect(model.byName.modelBlock).toMatchObject({
      elementType: 'modelBlock',
      kind: 'element',
      name: 'modelBlock',
    });
    expect(model.byName.modelMark?.textPropertyId).toMatch(/^text:modelMark@/);
    expect(model.byName.modelProperty?.propertyIds[0]).toMatch(
      /^element:modelProperty@/
    );
    expect(model.byName.modelProperty?.elementPropertyKeys).toEqual([
      'modelProperty',
    ]);
    expect(model.byName.modelMark?.properties[0]).toBe(
      model.contribution.properties?.find(
        (declaration) => declaration.key === 'modelMark'
      )
    );
    expect(model.byName.modelProperty?.properties[0]).toBe(
      model.contribution.properties?.find(
        (declaration) => declaration.key === 'modelProperty'
      )
    );
    expect(schemaContributions.get(BlockPlugin.name)?.contribution).toEqual(
      model.contributions[BlockPlugin.name]
    );
    expect(schemaContributions.get(MarkPlugin.name)?.contribution).toEqual(
      model.contributions[MarkPlugin.name]
    );
    expect(schemaContributions.get(PropertyPlugin.name)?.contribution).toEqual(
      model.contributions[PropertyPlugin.name]
    );
    expect(
      schemaContributions.get('schema:derived')?.contribution
    ).toMatchObject({
      elements: {},
      groups: model.contribution.groups,
      root: expect.any(Object),
    });
    expect(
      schemaContributions.get('schema:derived')?.contribution.properties
    ).toBeUndefined();
  });

  it('accepts installed plugin descriptors for element schema operations', () => {
    const BlockPlugin = createElementPlugin('descriptorBlock');
    const ContainerPlugin = defineBasePlugin('descriptorContainer', {
      schema: {
        element: {
          content: schema.content.type('descriptorBlock', { min: 1 }),
        },
      },
    });
    const ElementPropertyPlugin = defineBasePlugin(
      'descriptorElementProperty',
      {
        schema: {
          element: {
            content: schema.content.text({ default: 'text', min: 1 }),
            properties: { variant: property.string() },
          },
        },
      }
    );
    const PropertyPlugin = defineBasePlugin('descriptorTone', {
      schema: () => ({
        properties: {
          descriptorTone: schema.elementProperty(property.string(), {
            target: target.type('descriptorBlock'),
          }),
        },
      }),
    });
    const MarkPlugin = defineBasePlugin('descriptorMark', {
      schema: {
        mark: {
          inclusive: false,
          property: property.string(),
          split: 'preserve',
        },
      },
    });
    const editor = createBaseEditor({
      plugins: [
        BlockPlugin,
        ContainerPlugin,
        ElementPropertyPlugin,
        MarkPlugin,
        PropertyPlugin,
      ],
    });
    const element = editor.read.schema.create(BlockPlugin, {
      descriptorTone: 'warm',
    });

    expect(element).toEqual({
      children: [{ text: '' }],
      descriptorTone: 'warm',
      type: 'descriptorBlock',
    });
    expect(editor.read.schema.element(BlockPlugin)?.type).toBe(
      'descriptorBlock'
    );
    expect(
      editor.read.schema.allowsElementType(ContainerPlugin, BlockPlugin)
    ).toBe(true);
    expect(
      editor.read.schema.isElementTypeInGroup(BlockPlugin, 'textBlock')
    ).toBe(true);
    expect(editor.read.schema.getProperty(element, 'descriptorTone')).toBe(
      'warm'
    );
    expect(
      editor.read.schema.property({
        key: 'descriptorTone',
        placement: 'element',
      })
    ).toMatchObject({
      key: 'descriptorTone',
      placement: 'element',
    });
    expect(
      editor.read.schema.property({ key: 'variant', placement: 'element' })
    ).toMatchObject({
      key: 'variant',
      placement: 'element',
    });
    expect(
      editor.read.schema.property({
        key: 'descriptorMark',
        placement: 'text',
      })
    ).toMatchObject({
      key: 'descriptorMark',
      placement: 'text',
    });
    expect(() => editor.read.schema.create(PropertyPlugin as never)).toThrow(
      'does not declare schema.element'
    );

    const UninstalledElementPropertyPlugin = defineBasePlugin(
      'uninstalledDescriptorElementProperty',
      {
        schema: {
          element: {
            content: schema.content.text({ default: 'text', min: 1 }),
            properties: { tone: property.string() },
          },
        },
      }
    );

    expect(() =>
      editor.read.schema.isElementTypeInGroup(
        UninstalledElementPropertyPlugin as never,
        'textBlock'
      )
    ).toThrow('is not installed');

    const forgedDescriptor = {
      name: BlockPlugin.name,
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
      }
    );

    expect(() =>
      editor.read.schema.element(accessorDescriptor as never)
    ).toThrow('invalid plugin descriptor');
    expect(accessorReads).toBe(0);

    const StaleBlockPlugin = createElementPlugin(BlockPlugin.name);
    const staleEditor = createBaseEditor({
      plugins: [StaleBlockPlugin],
    });

    expect(() => staleEditor.read.schema.element(BlockPlugin as never)).toThrow(
      `Plate schema descriptor "${BlockPlugin.name}" does not match the installed plugin family.`
    );
  });

  it('publishes render indexes only for schema-owned types', () => {
    const ElementComponent = () => null;
    const MarkComponent = () => null;
    const ElementPlugin = definePlatePlugin('renderElement', {
      component: ElementComponent,
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
    });
    const MarkPlugin = definePlatePlugin('renderMark', {
      component: MarkComponent,
      render: {
        isDecoration: false,
        leafProps: { 'data-leaf': 'mark' },
        textProps: { 'data-text': 'mark' },
      },
      schema: {
        mark: property.boolean({ default: false, omitDefault: true }),
      },
    });
    const RuntimeOnlyPlugin = definePlatePlugin('runtimeOnly', {
      component: () => null,
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
  });

  it('classifies block containers from compiled child relations', () => {
    const BlockChildPlugin = createElementPlugin('containerBlockChild');
    const InlineChildPlugin = defineBasePlugin('containerInlineChild', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
          inline: true,
        },
      },
    });
    const DirectContainerPlugin = defineBasePlugin('directBlockContainer', {
      schema: {
        element: {
          content: schema.content.type('containerBlockChild', {
            default: { type: 'containerBlockChild' },
            min: 1,
          }),
        },
      },
    });
    const GroupContainerPlugin = defineBasePlugin('groupBlockContainer', {
      schema: ({ plugins }) => ({
        element: {
          content: plugins.blockContent({
            default: { type: 'containerBlockChild' },
            min: 1,
          }),
        },
      }),
    });
    const InlineContainerPlugin = defineBasePlugin('inlineOnlyContainer', {
      schema: {
        element: {
          content: schema.content.any(
            [
              schema.content.text(),
              schema.content.type('containerInlineChild'),
            ],
            { default: 'text', min: 1 }
          ),
        },
      },
    });
    const TextOnlyPlugin = createElementPlugin('textOnlyContainerCandidate');
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
    const expectedContainerTypes = new Set<string>([
      DirectContainerPlugin.name,
      GroupContainerPlugin.name,
      InlineContainerPlugin.name,
      TextOnlyPlugin.name,
    ]);
    const customContainerTypes = getPlateRuntime(
      editor
    ).pluginCache.node.containerTypes.filter((key) =>
      expectedContainerTypes.has(key)
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
    const plugin = defineBasePlugin('configuredModel', {
      initialState,
      schema: ({ initialState }) => ({
        properties: {
          configuredModel: schema.elementProperty(property.string(), {
            target: target.elements(initialState.targets),
          }),
        },
      }),
    }).configure({ initialState: { label: 'configured' } });
    const editor = createBaseEditor({
      plugins: [TargetPlugin, plugin],
    });
    const resolved = editor.plugin(plugin);

    expect(resolved.initialState).toEqual({
      label: 'configured',
      nested: { value: 1 },
      targets: [{ name: 'configuredTarget' }],
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
      { children: [{ text: '' }], type: 'paragraph' },
    ]);

    const explicitValue = [
      { children: [{ text: 'keep me' }], type: 'paragraph' },
    ];
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
    const HeadingPlugin = createElementPlugin('configuredHeading');
    const PropertyPlugin = defineBasePlugin('configuredProperty', {
      schema: ({ targetElementTypes }) => ({
        properties: {
          configuredProperty: schema.elementProperty(property.string(), {
            target: target.types(targetElementTypes),
          }),
        },
      }),
      targetPlugins: [HeadingPlugin, 'missingOptionalHeading', HeadingPlugin],
      inject: { nodeProps: {} },
    });
    const editor = createBaseEditor({
      plugins: [HeadingPlugin, PropertyPlugin],
    });

    expect(editor.read.schema.identity()?.kind).toBe('derived');

    expect(
      (editor.api as unknown as Record<string, unknown>).plateModel
    ).toBeUndefined();

    const installedPropertyPlugin = editor.plugin(PropertyPlugin);
    const targetBinding = getResolvedPluginTargetBinding(
      editor,
      installedPropertyPlugin
    );

    expect(
      installedPropertyPlugin.targetPlugins.map((target) =>
        typeof target === 'string' ? target : target.name
      )
    ).toEqual([
      'configuredHeading',
      'missingOptionalHeading',
      'configuredHeading',
    ]);
    expect(installedPropertyPlugin.targetPlugins[0]?.name).toBe(
      editor.plugin(HeadingPlugin).name
    );
    expect(Object.isFrozen(installedPropertyPlugin.targetPlugins)).toBe(true);
    expect(targetBinding.names).toEqual(['configuredHeading']);
    expect(targetBinding.missingNames).toEqual(['missingOptionalHeading']);
    expect(targetBinding.types).toEqual(['configuredHeading']);
    expect(editor.read.history().schema).toEqual(editor.read.schema.identity());
  });

  it('resolves persisted target types from function schema declarations', () => {
    const HeadingPlugin = defineBasePlugin('functionHeading', {
      schema: () => ({
        element: {
          content: schema.content.open(),
          type: 'persistedHeading',
        },
      }),
    });
    let resolvedTargetTypes: readonly string[] = [];
    const PropertyPlugin = defineBasePlugin('functionTargetProperty', {
      schema: ({ targetElementTypes }) => {
        resolvedTargetTypes = targetElementTypes;

        return {
          properties: {
            tone: schema.elementProperty(property.string(), {
              target: target.types(targetElementTypes),
            }),
          },
        };
      },
      targetPlugins: [HeadingPlugin],
    });

    createBaseEditor({ plugins: [HeadingPlugin, PropertyPlugin] });

    expect(resolvedTargetTypes).toEqual(['persistedHeading']);
  });

  it('resolves target types from the closed application schema', () => {
    const HeadingPlugin = createElementPlugin('applicationHeading');
    let resolvedTargetTypes: readonly string[] = [];
    const PropertyPlugin = defineBasePlugin('applicationTargetProperty', {
      schema: ({ targetElementTypes }) => {
        resolvedTargetTypes = targetElementTypes;

        return {
          properties: {
            tone: schema.elementProperty(property.string(), {
              target: target.types(targetElementTypes),
            }),
          },
        };
      },
      targetPlugins: [HeadingPlugin],
    });
    const editor = createBaseEditor({
      plugins: [HeadingPlugin, PropertyPlugin],
      schema: {
        overrides: [
          schema.override(HeadingPlugin, {
            element: { type: 'persistedApplicationHeading' },
          }),
        ],
      },
    });

    expect(resolvedTargetTypes).toEqual(['persistedApplicationHeading']);
    expect(
      getResolvedPluginTargetBinding(editor, editor.plugin(PropertyPlugin))
        .types
    ).toEqual(['persistedApplicationHeading']);
  });

  it('rejects an exact target descriptor from a different same-name family', () => {
    const ExpectedTarget = createElementPlugin('sharedTarget');
    const InstalledTarget = createElementPlugin('sharedTarget');
    const PropertyPlugin = defineBasePlugin('property', {
      inject: { nodeProps: {} },
      targetPlugins: [ExpectedTarget],
    });

    expect(() => {
      const editor = createBaseEditor({
        plugins: [InstalledTarget, PropertyPlugin],
      });

      getResolvedPluginTargetBinding(editor, editor.plugin(PropertyPlugin));
    }).toThrow(
      'Plate plugin "property" targetPlugins descriptor "sharedTarget" does not match the installed plugin family.'
    );
  });

  it('rejects missing, disabled, and non-element plugin references', () => {
    const MissingPlugin = createElementPlugin('missingTarget');
    const DisabledPlugin = createElementPlugin('disabledTarget').configure({
      enabled: false,
    });
    const MarkPlugin = defineBasePlugin('markTarget', {
      schema: {
        mark: property.boolean({ default: false, omitDefault: true }),
      },
    });
    const createDependentPlugin = (
      name: string,
      referencedPlugin: PluginReference
    ) =>
      defineBasePlugin(name, {
        initialState: { referencedPlugin },
        schema: ({ initialState }) => ({
          properties: {
            [name]: schema.elementProperty(property.string(), {
              target: target.element(initialState.referencedPlugin),
            }),
          },
        }),
      });
    const ExpectedPlugin = createElementPlugin('sharedSchema');
    const InstalledPlugin = createElementPlugin('sharedSchema');

    expect(() =>
      createBaseEditor({
        plugins: [
          InstalledPlugin,
          createDependentPlugin('mismatchedOwner', ExpectedPlugin),
        ],
      })
    ).toThrow(
      'Plate plugin "mismatchedOwner" schema descriptor "sharedSchema" does not match the installed plugin family.'
    );

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
    ).toThrow('schema reference "markTarget" does not own an element type');
    expect(() =>
      createBaseEditor({
        plugins: [
          MarkPlugin,
          defineBasePlugin('markInjection', {
            targetPlugins: [MarkPlugin],
            inject: { nodeProps: { transformProps: ({ props }) => props } },
          }),
        ],
      })
    ).toThrow(
      'Plate plugin "markInjection" targetPlugins entry "markTarget" does not own an element type.'
    );
  });

  it('keeps literal target names unchanged', () => {
    const NameAliasPlugin = createElementPlugin('literalAlias');
    const PropertyPlugin = defineBasePlugin('literalPropertyOwner', {
      schema: {
        properties: {
          'literal-property': schema.elementProperty(property.string(), {
            target: target.type('literalAlias'),
          }),
        },
      },
    });
    const editor = createBaseEditor({
      plugins: [NameAliasPlugin, PropertyPlugin],
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
    const plugin = (defineBasePlugin('runtimeSchema', {}).extend as any)(
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
