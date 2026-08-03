import {
  createEditorSchemaContract,
  createEditor,
  property,
  schema,
  target,
  type Value,
} from '@platejs/plite';
import { getCompiledEditorSchema } from '@platejs/plite/internal';
import { NavigationFeedbackPlugin, ParagraphPlugin } from '../../react';
import {
  getCompiledPlateContainerTypes,
  getPlateModelPublication,
  getPlateRuntime,
} from '../../internal/plugin/compilePlateModel';
import { getPlateCorePlugins } from '../../react/editor/getPlateCorePlugins';
import { createPlateEditor } from '../../react/editor/withPlate';
import { definePlatePlugin } from '../../react/plugin/definePlatePlugin';
import { EventEditorPlugin } from '../../react/plugins/event-editor/EventEditorPlugin';
import { InputRulesPlugin } from '../plugins/input-rules/InputRulesPlugin';
import {
  bindGeneratedEditor,
  defineEditor,
  type GeneratedEditorTypes,
} from './defineEditor';
import {
  AffinityPlugin,
  type BaseEditor,
  type BasePluginInput,
  defineBasePlugin,
  createBaseEditor,
  DebugPlugin,
  DOMPlugin,
  ElementStatePlugin,
  HistoryPlugin,
  HtmlPlugin,
  NodeIdPlugin,
  OverridePlugin,
} from '../index';

const coreNames = [
  'root',
  DebugPlugin.name,
  ElementStatePlugin.name,
  DOMPlugin.name,
  HistoryPlugin.name,
  InputRulesPlugin.name,
  OverridePlugin.name,
  HtmlPlugin.name,
  NodeIdPlugin.name,
  AffinityPlugin.name,
  ParagraphPlugin.name,
  'react',
  EventEditorPlugin.name,
  NavigationFeedbackPlugin.name,
];

const TestBoldPlugin = defineBasePlugin('bold', {
  schema: { mark: property.boolean({ default: false, omitDefault: true }) },
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/html': {
        decode: () => true,
        encode: ({ value }) => (value ? { tag: 'strong' } : null),
        match: [{ tag: ['strong', 'b'] }],
      },
    }),
});

const TestItalicPlugin = defineBasePlugin('italic', {
  schema: { mark: property.boolean({ default: false, omitDefault: true }) },
});

const TextBlockElement = {
  content: schema.content.text({ default: 'text', min: 1 }),
};

describe('createPlateEditor', () => {
  describe('generated editor contracts', () => {
    const compileContract = (plugins: readonly BasePluginInput[]) => {
      const editor = createBaseEditor({ plugins, skipInitialization: true });
      const compiled = getCompiledEditorSchema(editor);

      return createEditorSchemaContract(compiled);
    };

    it('accepts the exact generated fingerprint and publishes its schema identity', () => {
      const CalloutPlugin = defineBasePlugin('generatedCallout', {
        schema: { element: schema.element.textBlock() },
      });
      const definition = defineEditor('generatedContract', {
        plugins: [CalloutPlugin],
        schemaIdentity: { id: 'generated-document', version: 4 },
      });
      const schemaContract = compileContract(definition.plugins);
      const EditorKit = bindGeneratedEditor(definition, {
        bindings: { plugins: {}, properties: {} },
        fingerprint: schemaContract.fingerprint,
        schema: schemaContract,
        types: undefined as unknown as GeneratedEditorTypes,
      });
      const editor = createBaseEditor({ plugins: EditorKit });

      expect(editor.read.schema.identity()).toMatchObject({
        fingerprint: schemaContract.fingerprint,
        id: 'generated-document',
        version: 4,
      });
    });

    it('applies closed editor schema overrides before generation and publication', () => {
      const CardPlugin = defineBasePlugin('applicationCard', {
        schema: {
          element: {
            content: schema.content.text({ default: 'text', min: 1 }),
            type: 'application_card',
          },
        },
      });
      const MetadataPlugin = defineBasePlugin('applicationMetadata', {
        schema: {
          properties: {
            tone: schema.elementProperty(
              property.string({ default: 'neutral' }),
              { target: target.element(CardPlugin) }
            ),
          },
        },
      });
      const definition = defineEditor('applicationOverride', {
        plugins: [CardPlugin, MetadataPlugin],
        schema: {
          overrides: [
            schema.override(CardPlugin, {
              element: { type: 'card' },
            }),
            schema.override(MetadataPlugin, {
              properties: {
                tone: { target: target.element(CardPlugin) },
              },
            }),
          ],
          properties: {
            reviewState: schema.elementProperty(
              property.enum(['draft', 'approved'] as const),
              { target: target.element(CardPlugin) }
            ),
          },
        },
      });
      const editor = createBaseEditor({
        plugins: definition.plugins,
        skipInitialization: true,
      });
      const card = editor.read.schema.create(
        editor.plugin(CardPlugin).schema.element
      );

      expect(editor.plugin(CardPlugin).schema.element.type).toBe('card');
      expect(card.type).toBe('card');
      expect(editor.read.schema.element('application_card')).toBeNull();
      expect(editor.read.schema.element('card')?.type).toBe('card');
      expect(
        editor.read.schema.getProperty(
          card,
          editor.plugin(MetadataPlugin).schema.properties.tone
        )
      ).toBe('neutral');
      expect(
        editor.read.schema.property({
          key: 'reviewState',
          placement: 'element',
        })
      ).not.toBeNull();
    });

    it('rejects a stale generated fingerprint before initialization or publication', () => {
      let initialValueTransforms = 0;
      const ExpectedPlugin = defineBasePlugin('generatedExpected', {
        schema: { element: schema.element.textBlock() },
        transformInitialValue: ({ value }) => {
          initialValueTransforms++;

          return value;
        },
      });
      const OtherPlugin = defineBasePlugin('generatedOther', {
        schema: { element: schema.element.textBlock() },
      });
      const definition = defineEditor('staleGeneratedContract', {
        plugins: [ExpectedPlugin],
      });
      const staleSchema = compileContract([OtherPlugin]);
      const StaleEditorKit = bindGeneratedEditor(definition, {
        bindings: { plugins: {}, properties: {} },
        fingerprint: staleSchema.fingerprint,
        schema: staleSchema,
        types: undefined as unknown as GeneratedEditorTypes,
      });
      const rawEditor = createEditor();
      const schemaBefore = rawEditor.read.schema.identity();

      expect(() =>
        createBaseEditor({ editor: rawEditor, plugins: StaleEditorKit })
      ).toThrow('Generated editor schema is stale');
      expect(initialValueTransforms).toBe(0);
      expect(getPlateModelPublication(rawEditor as BaseEditor)).toBeUndefined();
      expect(rawEditor.read.schema.identity()).toEqual(schemaBefore);
    });
  });

  describe('when default plugins', () => {
    it('have core plugins', () => {
      const editor = createPlateEditor({ editor: createEditor() });

      expect(editor.id).toBeDefined();
      expect(editor.read((state) => state.history())).toBeDefined();
      expect(
        getPlateRuntime(editor).pluginList.map((plugin) => plugin.name)
      ).toEqual(coreNames);
      expect(
        getPlateRuntime(editor).pluginList.map((plugin) => plugin.name)
      ).toEqual(coreNames);
      expect(Object.keys(getPlateRuntime(editor).plugins)).toEqual(coreNames);

      expect(editor.read.children()).toEqual([
        { children: [{ text: '' }], type: 'paragraph' },
      ]);
      expect(editor.read.view.isReadOnly()).toBe(false);
    });

    it('publishes the Plate schema and empty-root default before the first user commit', () => {
      const editor = createEditor();
      const observations: Array<{
        children: unknown;
        schema: ReturnType<typeof editor.read.schema.identity>;
      }> = [];

      editor.subscribeCommit(() => {
        observations.push({
          children: editor.read.children(),
          schema: editor.read.schema.identity(),
        });
      });

      createPlateEditor({ editor });

      expect(observations).toEqual([]);
      expect(editor.read.schema.identity()).not.toBeNull();
      expect(editor.read.children()).toEqual([
        { children: [{ text: '' }], type: 'paragraph' },
      ]);

      editor.update.text.insert('x', {
        at: { offset: 0, path: [0, 0] },
      });

      expect(observations).toEqual([
        {
          children: [{ children: [{ text: 'x' }], type: 'paragraph' }],
          schema: editor.read.schema.identity(),
        },
      ]);

      editor.update((tx) => tx.history.undo());

      expect(editor.read.children()).toEqual([
        { children: [{ text: '' }], type: 'paragraph' },
      ]);
    });

    it('rejects an invalid initial root', () => {
      expect(() =>
        createPlateEditor({
          editor: createEditor(),
          initialValue: [
            { children: [{ text: 'stable' }], type: 'not-a-plate-element' },
          ],
        })
      ).toThrow(/unknown editor element type "not-a-plate-element"/i);
    });

    it('registers the node id schema without generating ids in tests', () => {
      const editor = createBaseEditor({
        initialValue: [
          { children: [{ text: 'known' }], id: 'known', type: 'paragraph' },
          { children: [{ text: 'missing' }], type: 'paragraph' },
        ],
      });

      expect(editor.read.children()).toEqual([
        { children: [{ text: 'known' }], id: 'known', type: 'paragraph' },
        { children: [{ text: 'missing' }], type: 'paragraph' },
      ]);
      expect(() =>
        editor.read.schema.assertDocument(editor.read.value())
      ).not.toThrow();

      editor.update.nodes.insert(
        { children: [{ text: 'inserted' }], type: 'paragraph' },
        { at: [2] }
      );

      expect(editor.read.children()[2]?.id).toBeUndefined();

      const disabledEditor = createBaseEditor({
        nodeId: false,
      });

      expect(
        getPlateRuntime(disabledEditor).pluginList.some(
          (plugin) => plugin.name === NodeIdPlugin.name
        )
      ).toBe(false);
      expect(() =>
        disabledEditor.update.nodes.insert(
          { children: [{ text: 'unknown' }], id: 'unknown', type: 'paragraph' },
          { at: [0] }
        )
      ).toThrow(/unknown element property "id"/i);
    });

    it('executes tx-backed plugin commands through update on the current editor runtime', () => {
      const TxPlugin = defineBasePlugin('txPlugin', {
        update: ({ tx }) => ({
          bold: () => tx.marks.add('bold', true),
        }),
      });
      const editor = createPlateEditor({
        editor: createEditor(),
        plugins: [TxPlugin, TestBoldPlugin],
        selection: {
          kind: 'text',
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 4, path: [0, 0] },
        },
        initialValue: [{ children: [{ text: 'text' }], type: 'paragraph' }],
      });

      editor.update((tx) => tx.txPlugin.bold());

      expect(editor.read.children()[0].children[0]).toMatchObject({
        bold: true,
        text: 'text',
      });
    });

    it('installs plugin dependencies before their dependent', () => {
      const DependencyPlugin = defineBasePlugin('dependency', {});
      const DependentPlugin = defineBasePlugin('dependent', {
        dependencies: [DependencyPlugin],
      });
      const editor = createPlateEditor({
        editor: createEditor(),
        plugins: [DependentPlugin],
      });
      const names = getPlateRuntime(editor).pluginList.map(
        (plugin) => plugin.name
      );

      expect(names.indexOf('dependency')).toBeLessThan(
        names.indexOf('dependent')
      );
      expect(names.filter((name) => name === 'dependency')).toHaveLength(1);
    });

    it('runs shared dependency factories once and keeps distinct extensions', () => {
      const calls = { api: 0, distinct: 0, selectors: 0, tx: 0 };
      const DependencyPlugin = defineBasePlugin('dependency', {})
        .extend(() => {
          calls.api += 1;

          return { api: () => ({ shared: () => true }) };
        })
        .extend(() => {
          calls.selectors += 1;

          return { selectors: { shared: () => true } };
        })
        .extend(() => {
          calls.tx += 1;

          return { update: () => ({ shared: () => undefined }) };
        });
      const ExplicitDependencyPlugin = DependencyPlugin.extend(() => {
        calls.distinct += 1;

        return { api: () => ({ distinct: () => true }) };
      });
      const DependentPlugin = defineBasePlugin('dependent', {
        dependencies: [DependencyPlugin],
      });

      createPlateEditor({
        editor: createEditor(),
        plugins: [DependentPlugin, ExplicitDependencyPlugin],
      });

      expect(calls).toEqual({ api: 1, distinct: 1, selectors: 1, tx: 1 });
    });

    it('runs update callbacks through the current Plite runtime', () => {
      const editor = createPlateEditor({
        editor: createEditor(),
        plugins: [TestItalicPlugin],
        selection: {
          kind: 'text',
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 4, path: [0, 0] },
        },
        initialValue: [{ children: [{ text: 'text' }], type: 'paragraph' }],
      });

      editor.update((tx, context) => {
        tx.marks.add('italic', true);

        expect(() => context.afterCommit(() => {})).not.toThrow();
      });

      expect(editor.read.children()[0].children[0]).toMatchObject({
        italic: true,
        text: 'text',
      });
    });

    it('installs schema.element behavior before tx groups insert inline nodes', () => {
      const InlineTxPlugin = defineBasePlugin('mention', {
        schema: {
          element: {
            void: 'inline',
          },
        },
      }).extend(
        ({
          schema: {
            element: { type },
          },
        }) => ({
          update: ({ tx }) => ({
            insert: () => {
              tx.nodes.insert([
                { children: [{ text: '' }], type },
                { text: ' ' },
              ]);
            },
          }),
        })
      );
      const editor = createPlateEditor({
        editor: createEditor(),
        plugins: [InlineTxPlugin],
        selection: {
          kind: 'text',
          anchor: { offset: 2, path: [0, 0] },
          focus: { offset: 2, path: [0, 0] },
        },
        initialValue: [{ children: [{ text: 'hello' }], type: 'paragraph' }],
      });
      const mentionElement = { children: [{ text: '' }], type: 'mention' };

      expect(editor.read.schema.isInline(mentionElement)).toBe(true);
      expect(editor.read.schema.isVoid(mentionElement)).toBe(true);

      editor.update((tx) => {
        tx.mention.insert();
      });

      expect(editor.read.children()[0]).toMatchObject({
        children: [
          { text: 'he' },
          { children: [{ text: '' }], type: 'mention' },
          { text: ' llo' },
        ],
        type: 'paragraph',
      });
    });

    it('installs schema.element selection behavior through the schema adapter', () => {
      const NonSelectableVoidPlugin = defineBasePlugin('badge', {
        schema: {
          element: {
            selectable: false,
            void: 'markable-inline',
          },
        },
      });
      const editor = createPlateEditor({
        editor: createEditor(),
        plugins: [NonSelectableVoidPlugin],
        initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
      });
      const badgeElement = { children: [{ text: '' }], type: 'badge' };

      expect(editor.read.schema.isSelectable(badgeElement)).toBe(false);
      expect(editor.read.schema.isVoid(badgeElement)).toBe(true);
      expect(editor.read.schema.isMarkableVoid(badgeElement)).toBe(true);
    });

    it('compiles boolean marks, parameterized marks, and element grammar', () => {
      const CellPlugin = defineBasePlugin('cell', {
        schema: {
          element: { ...TextBlockElement, type: 'configured-cell' },
        },
      });
      const RowPlugin = defineBasePlugin('row', {
        schema: {
          element: {
            content: schema.content.element(CellPlugin, { min: 1 }),
            selectable: false,
            type: 'configured-row',
          },
        },
      });
      const TonePlugin = defineBasePlugin('tone', {
        schema: () => ({
          mark: {
            split: 'drop',
            target: target.element(CellPlugin),
            property: property.string(),
          },
        }),
      });
      const editor = createPlateEditor({
        editor: createEditor(),
        plugins: [RowPlugin, CellPlugin, TonePlugin],
        schemaIdentity: { id: 'plate-core-test', version: 4 },
        initialValue: [
          {
            children: [
              {
                children: [{ text: '', tone: 'quiet' }],
                type: 'configured-cell',
              },
            ],
            type: 'configured-row',
          },
        ],
      });
      expect(editor.read.schema.identity()).toMatchObject({
        id: 'plate-core-test',
        version: 4,
      });
      expect(editor.read.schema.identity()?.fingerprint).toEqual(
        expect.any(String)
      );
      expect(editor.read.schema.create('configured-row')).toEqual({
        children: [{ children: [{ text: '' }], type: 'configured-cell' }],
        type: 'configured-row',
      });
      expect(
        editor.read.schema.isSelectable({
          children: [{ children: [{ text: '' }], type: 'configured-cell' }],
          type: 'configured-row',
        })
      ).toBe(false);
      expect(() =>
        editor.read.schema.assertDocument({
          children: [
            {
              children: [
                {
                  children: [{ text: '', tone: false }],
                  type: 'configured-cell',
                },
              ],
              type: 'configured-row',
            },
          ],
        })
      ).toThrow(/tone/i);
    });

    it('wraps directly fittable external content before publishing it', () => {
      const editor = createBaseEditor({
        editor: createEditor(),
        initialValue: [{ text: 'wrapped' }] as unknown as Value,
      });

      expect(editor.read.children()).toEqual([
        { children: [{ text: 'wrapped' }], type: 'paragraph' },
      ]);
    });

    it('decodes and transforms HTML before fitting its root content', () => {
      let transformedInput: ReturnType<BaseEditor['read']['value']> | undefined;
      const TransformHtmlPlugin = defineBasePlugin('transformHtml', {
        transformInitialValue: ({ value }) => {
          transformedInput = value;

          return {
            ...value,
            children: [{ children: [], type: 'paragraph' }],
          };
        },
      });
      const editor = createBaseEditor({
        editor: createEditor(),
        plugins: [TransformHtmlPlugin, HtmlPlugin],
        initialValue: ({ editor }) =>
          editor.plugin(HtmlPlugin).api.deserialize({ element: '<p>html</p>' }),
      });

      expect(transformedInput).toEqual({
        children: [{ children: [{ text: 'html' }], type: 'paragraph' }],
      });
      expect(editor.read.children()).toEqual([
        { children: [{ text: '' }], type: 'paragraph' },
      ]);
    });

    it('preserves an existing document when initialValue is omitted', () => {
      const rawEditor = createEditor({
        initialValue: [{ children: [{ text: 'existing' }], type: 'paragraph' }],
      });

      const editor = createBaseEditor({ editor: rawEditor });

      expect(editor.read.children()).toEqual([
        { children: [{ text: 'existing' }], type: 'paragraph' },
      ]);
    });

    it('initializes and transforms one full multi-root document', () => {
      const FigurePlugin = defineBasePlugin('figure', {
        schema: {
          element: {
            contentRoots: {
              caption: {
                content: schema.content.type('paragraph', {
                  default: { type: 'paragraph' },
                  min: 1,
                }),
                ownership: 'exclusive',
              },
            },
            blockContent: true,
            void: 'block',
          },
        },
      });
      const TransformDocumentPlugin = defineBasePlugin('transformDocument', {
        schema: {
          properties: {
            transformed: schema.elementProperty(property.boolean(), {
              target: target.group('element'),
            }),
          },
        },
        transformInitialValue: ({ value }) => ({
          ...value,
          children: value.children.map((node) => ({
            ...node,
            transformed: true,
          })),
          roots: Object.fromEntries(
            Object.entries(value.roots ?? {}).map(([root, children]) => [
              root,
              children.map((node) => ({ ...node, transformed: true })),
            ])
          ),
        }),
      });
      const editor = createBaseEditor({
        nodeId: false,
        plugins: [FigurePlugin, TransformDocumentPlugin],
        initialValue: () => ({
          children: [
            {
              childRoots: { caption: 'caption:1' },
              children: [{ text: '' }],
              type: 'figure',
            },
          ],
          meta: { revision: 7 },
          roots: {
            'caption:1': [
              { children: [{ text: 'Caption' }], type: 'paragraph' },
            ],
          },
        }),
      });

      expect(editor.read.value()).toEqual({
        children: [
          {
            childRoots: { caption: 'caption:1' },
            children: [{ text: '' }],
            transformed: true,
            type: 'figure',
          },
        ],
        meta: { revision: 7 },
        roots: {
          'caption:1': [
            {
              children: [{ text: 'Caption' }],
              transformed: true,
              type: 'paragraph',
            },
          ],
        },
      });
    });

    it('requires explicit initialValue to contain a root element', () => {
      expect(() =>
        createBaseEditor({ editor: createEditor(), initialValue: [] })
      ).toThrow('initialValue must contain at least one primary-root element');
    });

    it('rejects impossible external content before replacing the document', () => {
      expect(() =>
        createBaseEditor({
          editor: createEditor(),
          initialValue: [
            {
              children: [{ text: 'invalid' }],
              type: 'impossible',
            },
          ],
        })
      ).toThrow('Unknown editor element type "impossible" at [0].');
    });

    it('keeps schema fingerprints independent of plugin order', () => {
      const QuotePlugin = defineBasePlugin('quote', {
        schema: { element: { ...TextBlockElement } },
      });
      const TonePlugin = defineBasePlugin('tone', {
        schema: { mark: { property: property.string() } },
      });
      const options = {
        initialValue: [
          { children: [{ text: 'body', tone: 'quiet' }], type: 'quote' },
        ] as Value,
      };
      const first = createPlateEditor({
        editor: createEditor(),
        ...options,
        plugins: [QuotePlugin, TonePlugin],
      });
      const second = createPlateEditor({
        editor: createEditor(),
        ...options,
        plugins: [TonePlugin, QuotePlugin],
      });

      expect(first.read.schema.identity()?.fingerprint).toBe(
        second.read.schema.identity()?.fingerprint
      );
    });

    it('uses configured pure schema targets without global property leakage', () => {
      const BadgePlugin = defineBasePlugin('badge', {
        schema: {
          element: {
            ...TextBlockElement,
            properties: { variant: property.string() },
            type: 'badge-node',
          },
        },
      });
      const IdentityPlugin = defineBasePlugin('identity', {
        schema: ({ targetElementTypes }) => ({
          properties: {
            identity: schema.elementProperty(property.string(), {
              target: target.types(targetElementTypes),
            }),
          },
        }),
        targetPlugins: [BadgePlugin] as const,
      });
      const editor = createPlateEditor({
        editor: createEditor(),
        plugins: [IdentityPlugin, BadgePlugin],
        initialValue: [
          { children: [{ text: 'paragraph' }], type: 'paragraph' },
          {
            children: [{ text: 'badge' }],
            identity: 'badge-1',
            type: 'badge-node',
            variant: 'info',
          },
        ],
      });

      expect(() =>
        editor.read.schema.assertFragment([
          { children: [{ text: '' }], identity: 'leak', type: 'paragraph' },
        ])
      ).toThrow(/identity/i);
      expect(() =>
        editor.read.schema.assertFragment([
          { children: [{ text: '' }], identity: 1, type: 'badge-node' },
        ])
      ).toThrow(/identity/i);
    });

    it('derives container types from compiled schema grammar', () => {
      const ContainerPlugin = defineBasePlugin('container', {
        schema: {
          element: {
            content: schema.content.group('block'),
            type: 'container-node',
          },
        },
      });
      const editor = createPlateEditor({
        editor: createEditor(),
        plugins: [ContainerPlugin],
      });

      expect(getCompiledPlateContainerTypes(editor)).toEqual([
        'container-node',
      ]);
    });

    it('publishes schema conflicts atomically', () => {
      const editor = createEditor();
      const identityBefore = editor.read.schema.identity();
      const valueBefore = editor.read.value();
      const duplicatePropertyPlugin = (name: string) =>
        defineBasePlugin(name, {
          schema: {
            properties: {
              duplicate: schema.elementProperty(property.string(), {
                target: target.group('element'),
              }),
            },
          },
        });

      expect(() =>
        createBaseEditor({
          editor,
          plugins: [duplicatePropertyPlugin('a'), duplicatePropertyPlugin('b')],
        })
      ).toThrow(/duplicate/i);
      expect(identityBefore?.kind).toBe('derived');
      expect(editor.read.schema.identity()).toBe(identityBefore);
      expect(editor.read.value()).toEqual(valueBefore);
      expect(editor.read.children()).toBe(valueBefore.children);
    });
  });

  describe('when plugins is an array', () => {
    it('add custom plugins to core plugins', () => {
      const customPlugin = defineBasePlugin('custom', {});
      const editor = createPlateEditor({
        editor: createEditor(),
        override: {
          components: {},
        },
        plugins: [customPlugin],
      });

      expect(
        getPlateRuntime(editor).pluginList.map((plugin) => plugin.name)
      ).toEqual([...coreNames, 'custom']);
      expect(editor.plugin('custom')).toBeDefined();
    });
  });

  describe('when plugins is an empty array', () => {
    it('only have core plugins', () => {
      const editor = createPlateEditor({ editor: createEditor(), plugins: [] });

      expect(
        getPlateRuntime(editor).pluginList.map((plugin) => plugin.name)
      ).toEqual(coreNames);
    });
  });

  describe('when using override', () => {
    it('publishes components declared by Base plugins to live Plate editors', () => {
      const Component = () => null;
      const Plugin = defineBasePlugin('baseComponent', {
        component: Component,
      });
      const editor = createPlateEditor({
        editor: createEditor(),
        plugins: [Plugin],
      });

      expect(editor.plugin(Plugin).render.node).toBe(Component);
    });

    it('merge components', () => {
      const HeadingPlugin = definePlatePlugin('h1', {});
      const customComponent = () => null;

      const editor = createPlateEditor({
        editor: createEditor(),
        override: {
          components: {
            h1: customComponent,
          },
        },
        plugins: [HeadingPlugin],
      });

      const h1Plugin = editor.plugin('h1');
      expect(h1Plugin.render.node).toBe(customComponent);
    });

    it('lets terminal editor component configuration override a plugin component', () => {
      const originalComponent = () => null;
      const overrideComponent = () => null;
      const HeadingPlugin = definePlatePlugin('h1', {
        component: originalComponent,
      });

      let editor = createPlateEditor({
        editor: createEditor(),
        plugins: [HeadingPlugin],
      });

      let h1Plugin = editor.plugin(HeadingPlugin);
      expect(h1Plugin.render.node).toBe(originalComponent);

      editor = createPlateEditor({
        editor: createEditor(),
        override: {
          components: {
            h1: overrideComponent,
          },
        },
        plugins: [HeadingPlugin],
      });

      h1Plugin = editor.plugin(HeadingPlugin);
      expect(h1Plugin.render.node).toBe(overrideComponent);
    });
  });

  describe('when replacing core plugins', () => {
    it('replace core plugins with custom plugins, maintain order, and add additional plugins', () => {
      const additionalPlugin = defineBasePlugin('additional', {});
      const [ReactDOMPlugin] = getPlateCorePlugins();

      const editor = createPlateEditor({
        editor: createEditor(),
        plugins: [ParagraphPlugin, ReactDOMPlugin, additionalPlugin],
      });

      const pluginCache = getPlateRuntime(editor).pluginList.map(
        (plugin) => plugin.name
      );

      // Check if React DOM replacement plugin replaced DOMPlugin.
      expect(pluginCache).toContain(ReactDOMPlugin.name);

      // Check if ParagraphPlugin is present
      expect(pluginCache).toContain(ParagraphPlugin.name);

      // Check if additional plugin is added
      expect(pluginCache).toContain('additional');

      // Check if the order is correct
      const reactIndex = pluginCache.indexOf(ReactDOMPlugin.name);
      const paragraphIndex = pluginCache.indexOf(ParagraphPlugin.name);
      const additionalIndex = pluginCache.indexOf('additional');

      expect(reactIndex).toBeLessThan(paragraphIndex);
      expect(paragraphIndex).toBeLessThan(additionalIndex);

      // Check if other core plugins are still present (e.g., HistoryPlugin)
      expect(pluginCache).toContain('history');

      // Ensure the total number of plugins is correct
      // This number should be the sum of:
      // 1. Number of core plugins
      // 2. Number of replacing plugins (React DOM plugin, ParagraphPlugin)
      // 3. Number of additional plugins (additionalPlugin)
      // Minus the number of replaced plugins (DOMPlugin)
      const expectedPluginCount = getPlateRuntime(editor).pluginList.length;
      expect(pluginCache).toHaveLength(expectedPluginCount);
    });
  });

  describe('when editor already has plugins', () => {
    it('does not duplicate core plugins', () => {
      const existingEditor = createEditor() as any;
      existingEditor.plugins = [
        defineBasePlugin('dom', {}),
        defineBasePlugin('history', {}),
      ];

      const editor = createPlateEditor({ editor: existingEditor });

      const names = getPlateRuntime(editor).pluginList.map(
        (plugin) => plugin.name
      );
      expect(names.filter((name) => name === 'dom')).toHaveLength(1);
      expect(names.filter((name) => name === 'history')).toHaveLength(1);
    });

    it('add missing core plugins', () => {
      const existingEditor = createEditor() as any;
      existingEditor.pluginList = [
        defineBasePlugin('dom', {}),
        defineBasePlugin('history', {}),
      ];

      const editor = createPlateEditor({ editor: existingEditor });

      const names = getPlateRuntime(editor).pluginList.map(
        (plugin) => plugin.name
      );
      coreNames.forEach((name) => {
        expect(names).toContain(name);
      });
    });

    it('does not preserve custom plugins', () => {
      const customPlugin = defineBasePlugin('custom', {});
      const existingEditor = createEditor() as any;
      existingEditor.plugins = [
        defineBasePlugin('dom', {}),
        defineBasePlugin('history', {}),
        customPlugin,
      ];

      const editor = createPlateEditor({ editor: existingEditor });

      expect(
        getPlateRuntime(editor).pluginList.map((plugin) => plugin.name)
      ).not.toContain('custom');
    });
  });

  it('forwards maxLength to the Plite runtime', () => {
    const editor = createBaseEditor({
      autoSelect: 'end',
      maxLength: 5,
      initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
    });

    editor.update.text.insert('Hello world');

    expect(editor.read.text.string([])).toBe('Hello');
  });

  it('can disable affinity from base editor options', () => {
    const editor = createBaseEditor({
      affinity: false,
    });

    expect(
      getPlateRuntime(editor).pluginList.map((plugin) => plugin.name)
    ).not.toContain(AffinityPlugin.name);
  });

  it('syncs explicit readOnly into the Plite view state', () => {
    const editor = createBaseEditor({ editor: createEditor(), readOnly: true });

    expect(editor.read.view.isReadOnly()).toBe(true);
  });

  it('preserves existing Plite readOnly state when readOnly is omitted', () => {
    const editor = createBaseEditor({
      editor: createEditor({ readOnly: true }),
    });

    expect(editor.read.view.isReadOnly()).toBe(true);
  });

  it('syncs a constructor-declared Plate element type into Plite block toggles', () => {
    const BlockquotePlugin = defineBasePlugin('blockquote', {
      schema: { element: { ...TextBlockElement } },
    });
    const CustomParagraphPlugin = defineBasePlugin('customParagraph', {
      schema: {
        element: { ...TextBlockElement, type: 'custom-paragraph' },
      },
    });
    const editor = createBaseEditor({
      editor: createEditor(),
      plugins: [CustomParagraphPlugin, BlockquotePlugin],
      initialValue: [{ children: [{ text: 'one' }], type: 'blockquote' }],
    });

    editor.update.selection.set({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    });
    editor.update.blocks.toggle('custom-paragraph');

    expect(editor.read.children()).toEqual([
      { children: [{ text: 'one' }], type: 'custom-paragraph' },
    ]);
  });

  it('preserves Plate marks allowed by the destination block schema', () => {
    const HeadingPlugin = defineBasePlugin('heading', {
      schema: { element: { ...TextBlockElement } },
    });
    const TonePlugin = defineBasePlugin('tone', {
      schema: { mark: { property: property.string() } },
    });
    const EphemeralPlugin = defineBasePlugin('ephemeral', {
      schema: { mark: { typeChange: 'drop', property: property.boolean() } },
    });
    const editor = createBaseEditor({
      editor: createEditor(),
      plugins: [HeadingPlugin, TestBoldPlugin, TonePlugin, EphemeralPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      initialValue: [
        {
          children: [
            { bold: true, ephemeral: true, text: 'one', tone: 'warm' },
          ],
          type: 'paragraph',
        },
      ],
    });

    editor.update.blocks.toggle('heading');

    expect(editor.read.children()).toEqual([
      {
        children: [{ bold: true, text: 'one', tone: 'warm' }],
        type: 'heading',
      },
    ]);
  });

  it('handle value, selection, and autoSelect options correctly', () => {
    const editor = createEditor();
    const value = [{ children: [{ text: 'Hello' }], type: 'paragraph' }];
    const selection = {
      kind: 'text' as const,
      anchor: { offset: 2, path: [0, 0] },
      focus: { offset: 4, path: [0, 0] },
    };

    const result = createBaseEditor({
      editor,
      selection,
      shouldNormalizeEditor: true,
      initialValue: value,
    });

    expect(result.read.children()).toEqual(value);
    expect(result.read.selection()).toEqual(selection);

    // Test autoSelect start
    const editorWithAutoSelectStart = createBaseEditor({
      editor: createEditor(),
      autoSelect: 'start',
      initialValue: value,
    });
    const expectedStartSelection = {
      kind: 'text',
      anchor: editorWithAutoSelectStart.read((state) => state.points.start([])),
      focus: editorWithAutoSelectStart.read((state) => state.points.start([])),
    };
    expect(editorWithAutoSelectStart.read.selection()).toEqual(
      expectedStartSelection
    );

    // Test autoSelect end
    const editorWithAutoSelectEnd = createBaseEditor({
      editor: createEditor(),
      autoSelect: 'end',
      initialValue: value,
    });
    const expectedEndSelection = {
      kind: 'text',
      anchor: editorWithAutoSelectEnd.read((state) => state.points.end([])),
      focus: editorWithAutoSelectEnd.read((state) => state.points.end([])),
    };
    expect(editorWithAutoSelectEnd.read.selection()).toEqual(
      expectedEndSelection
    );

    const editorWithElementPathSelection = createBaseEditor({
      editor: createEditor(),
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0] },
        focus: { offset: 0, path: [0] },
      },
      initialValue: value,
    });
    expect(editorWithElementPathSelection.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    });

    // Test empty children
    const editorWithEmptyChildren = createBaseEditor({
      editor: createEditor(),
    });
    expect(editorWithEmptyChildren.read.children()).toEqual([
      { children: [{ text: '' }], type: 'paragraph' },
    ]);
  });

  it('preserves initial selection when transforms wrap selected text', () => {
    const wrapCellText = (node: any): any => {
      if (!node || typeof node !== 'object' || !Array.isArray(node.children)) {
        return node;
      }

      if (node.type === 'tableCell') {
        return {
          ...node,
          children: node.children.map((child: any) =>
            child && typeof child === 'object' && 'text' in child
              ? { children: [child], type: 'paragraph' }
              : wrapCellText(child)
          ),
        };
      }

      return {
        ...node,
        children: node.children.map(wrapCellText),
      };
    };
    const WrapTextPlugin = defineBasePlugin('wrapText', {
      transformInitialValue: ({ value: initialValue }) => ({
        ...initialValue,
        children: initialValue.children.map(wrapCellText) as Value,
        roots: Object.fromEntries(
          Object.entries(initialValue.roots ?? {}).map(([root, children]) => [
            root,
            children.map(wrapCellText) as Value,
          ])
        ),
      }),
    });
    const TablePlugin = defineBasePlugin('table', {
      schema: {
        element: {
          content: schema.content.type('tableRow', {
            default: { type: 'tableRow' },
            min: 1,
          }),
        },
      },
    });
    const TableRowPlugin = defineBasePlugin('tableRow', {
      schema: {
        element: {
          content: schema.content.type('tableCell', {
            default: { type: 'tableCell' },
            min: 1,
          }),
        },
      },
    });
    const TableCellPlugin = defineBasePlugin('tableCell', {
      schema: {
        element: {
          content: schema.content.group('block', {
            default: { type: 'paragraph' },
            min: 1,
          }),
        },
      },
    });
    const editor = createBaseEditor({
      editor: createEditor(),
      plugins: [WrapTextPlugin, TablePlugin, TableRowPlugin, TableCellPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 2, path: [0, 1, 0, 0] },
        focus: { offset: 2, path: [0, 0, 1, 0] },
      },
      initialValue: [
        {
          children: [
            {
              children: [
                { children: [{ text: '11' }], type: 'tableCell' },
                { children: [{ text: '12' }], type: 'tableCell' },
              ],
              type: 'tableRow',
            },
            {
              children: [
                { children: [{ text: '21' }], type: 'tableCell' },
                { children: [{ text: '22' }], type: 'tableCell' },
              ],
              type: 'tableRow',
            },
          ],
          type: 'table',
        },
      ],
    });

    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 2, path: [0, 1, 0, 0, 0] },
      focus: { offset: 2, path: [0, 0, 1, 0, 0] },
    });
  });

  describe('contextual initialValue', () => {
    it('deserializes HTML through the configured feature API', () => {
      const htmlString = '<p>Hello, <b>world!</b></p>';

      const editor = createBaseEditor({
        editor: createEditor(),
        plugins: [TestBoldPlugin, HtmlPlugin],
        initialValue: ({ editor }) =>
          editor.plugin(HtmlPlugin).api.deserialize({ element: htmlString }),
      });

      expect(editor.read.children()).toEqual([
        {
          children: [{ text: 'Hello, ' }, { bold: true, text: 'world!' }],
          type: 'paragraph',
        },
      ]);
    });
  });

  describe('when the previous editor has an id', () => {
    it('reuses the raw editor id', () => {
      const editor = createBaseEditor({ editor: createEditor({ id: 'old' }) });
      expect(editor.id).toBe('old');
    });
  });

  describe('when the id option is provided during creation', () => {
    it('uses the provided id', () => {
      const editor = createBaseEditor({
        id: 'new',
      });
      expect(editor.id).toBe('new');
    });
  });

  describe('when no id is provided', () => {
    it('use a unique id for each editor', () => {
      const id1 = createBaseEditor({ editor: createEditor() }).id;
      const id2 = createBaseEditor({ editor: createEditor() }).id;
      expect(id1).toBeTruthy();
      expect(id2).toBeTruthy();
      expect(id1).not.toEqual(id2);
    });
  });
});
