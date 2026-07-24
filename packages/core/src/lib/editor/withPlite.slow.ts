import {
  createEditor,
  property,
  schema,
  target,
  type Value,
} from '@platejs/plite';
import { NavigationFeedbackPlugin, ParagraphPlugin } from '../../react';
import { getPlateRuntime } from '../../internal/plugin/compilePlateModel';
import { getPlateCorePlugins } from '../../react/editor/getPlateCorePlugins';
import { extendPlateEditor } from '../../react/editor/withPlate';
import { createPlatePlugin } from '../../react/plugin/createPlatePlugin';
import { EventEditorPlugin } from '../../react/plugins/event-editor/EventEditorPlugin';
import { InputRulesPlugin } from '../plugins/input-rules/internal/InputRulesPlugin';
import { getContainerTypes } from '../plugin/getBasePlugin';
import {
  AffinityPlugin,
  type BaseEditor,
  createBasePlugin,
  createBaseEditor,
  DebugPlugin,
  DOMPlugin,
  ElementStatePlugin,
  HistoryPlugin,
  HtmlPlugin,
  NodeIdPlugin,
  OverridePlugin,
  ParserPlugin,
  extendBaseEditor,
} from '../index';

const coreKeys = [
  'root',
  DebugPlugin.key,
  ElementStatePlugin.key,
  DOMPlugin.key,
  HistoryPlugin.key,
  InputRulesPlugin.key,
  OverridePlugin.key,
  ParserPlugin.key,
  HtmlPlugin.key,
  NodeIdPlugin.key,
  AffinityPlugin.key,
  ParagraphPlugin.key,
  EventEditorPlugin.key,
  NavigationFeedbackPlugin.key,
];

const TestBoldPlugin = createBasePlugin({
  key: 'bold',
  schema: { mark: property.boolean({ default: false, omitDefault: true }) },
  parsers: {
    html: {
      deserializer: {
        rules: [{ validNodeName: ['STRONG', 'B'] }],
      },
    },
  },
});

const TestItalicPlugin = createBasePlugin({
  key: 'italic',
  schema: { mark: property.boolean({ default: false, omitDefault: true }) },
});

const TextBlockElement = {
  content: schema.content.text({ default: 'text', min: 1 }),
};

describe('extendPlateEditor', () => {
  describe('when default plugins', () => {
    it('have core plugins', () => {
      const editor = extendPlateEditor(createEditor(), {});

      expect(editor.id).toBeDefined();
      expect(editor.read((state) => state.history())).toBeDefined();
      expect(
        getPlateRuntime(editor).pluginList.map((plugin) => plugin.key)
      ).toEqual(coreKeys);
      expect(
        getPlateRuntime(editor).pluginList.map((plugin) => plugin.type)
      ).toEqual(coreKeys);
      expect(Object.keys(getPlateRuntime(editor).plugins)).toEqual(coreKeys);

      expect(editor.read.children()).toEqual([
        { children: [{ text: '' }], type: 'p' },
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

      extendPlateEditor(editor, {});

      expect(observations).toEqual([]);
      expect(editor.read.schema.identity()).not.toBeNull();
      expect(editor.read.children()).toEqual([
        { children: [{ text: '' }], type: 'p' },
      ]);

      editor.update.text.insert('x', {
        at: { offset: 0, path: [0, 0] },
      });

      expect(observations).toEqual([
        {
          children: [{ children: [{ text: 'x' }], type: 'p' }],
          schema: editor.read.schema.identity(),
        },
      ]);

      editor.update((tx) => tx.history.undo());

      expect(editor.read.children()).toEqual([
        { children: [{ text: '' }], type: 'p' },
      ]);
    });

    it('rejects an invalid initial root', () => {
      expect(() =>
        extendPlateEditor(createEditor(), {
          initialValue: [
            { children: [{ text: 'stable' }], type: 'not-a-plate-element' },
          ],
        })
      ).toThrow(/unknown editor element type "not-a-plate-element"/i);
    });

    it('registers the node id schema without generating ids in tests', () => {
      const editor = createBaseEditor({
        initialValue: [
          { children: [{ text: 'known' }], id: 'known', type: 'p' },
          { children: [{ text: 'missing' }], type: 'p' },
        ],
      });

      expect(editor.read.children()).toEqual([
        { children: [{ text: 'known' }], id: 'known', type: 'p' },
        { children: [{ text: 'missing' }], type: 'p' },
      ]);
      expect(() =>
        editor.read.schema.validateDocument(editor.read.value())
      ).not.toThrow();

      editor.update.nodes.insert(
        { children: [{ text: 'inserted' }], type: 'p' },
        { at: [2] }
      );

      expect(editor.read.children()[2]?.id).toBeUndefined();

      const disabledEditor = createBaseEditor({
        nodeId: false,
      });

      expect(
        getPlateRuntime(disabledEditor).pluginList.some(
          (plugin) => plugin.key === NodeIdPlugin.key
        )
      ).toBe(false);
      expect(() =>
        disabledEditor.update.nodes.insert(
          { children: [{ text: 'unknown' }], id: 'unknown', type: 'p' },
          { at: [0] }
        )
      ).toThrow(/unknown element property "id"/i);
    });

    it('executes tx-backed plugin commands through update on the current editor runtime', () => {
      const TxPlugin = createBasePlugin({
        key: 'txPlugin',
      }).extendTx(() => (tx) => ({
        bold: () => tx.marks.add('bold', true),
      }));
      const editor = extendPlateEditor(createEditor(), {
        plugins: [TxPlugin, TestBoldPlugin],
        selection: {
          kind: 'text',
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 4, path: [0, 0] },
        },
        initialValue: [{ children: [{ text: 'text' }], type: 'p' }],
      });

      editor.update((tx) => tx.txPlugin.bold());

      expect(editor.read.children()[0].children[0]).toMatchObject({
        bold: true,
        text: 'text',
      });
    });

    it('installs plugin dependencies before their dependent', () => {
      const DependencyPlugin = createBasePlugin({ key: 'dependency' });
      const DependentPlugin = createBasePlugin({
        dependencies: [DependencyPlugin],
        key: 'dependent',
      });
      const editor = extendPlateEditor(createEditor(), {
        plugins: [DependentPlugin],
      });
      const pluginKeys = getPlateRuntime(editor).pluginList.map(
        (plugin) => plugin.key
      );

      expect(pluginKeys.indexOf('dependency')).toBeLessThan(
        pluginKeys.indexOf('dependent')
      );
      expect(pluginKeys.filter((key) => key === 'dependency')).toHaveLength(1);
    });

    it('runs shared dependency factories once and keeps distinct extensions', () => {
      const calls = { api: 0, distinct: 0, selectors: 0, tx: 0 };
      const DependencyPlugin = createBasePlugin({ key: 'dependency' })
        .extendApi(() => {
          calls.api += 1;

          return { shared: () => true };
        })
        .extendSelectors(() => {
          calls.selectors += 1;

          return { shared: () => true };
        })
        .extendTx(() => {
          calls.tx += 1;

          return () => ({ shared: () => undefined });
        });
      const ExplicitDependencyPlugin = DependencyPlugin.extendApi(() => {
        calls.distinct += 1;

        return { distinct: () => true };
      });
      const DependentPlugin = createBasePlugin({
        dependencies: [DependencyPlugin],
        key: 'dependent',
      });

      extendPlateEditor(createEditor(), {
        plugins: [DependentPlugin, ExplicitDependencyPlugin],
      });

      expect(calls).toEqual({ api: 1, distinct: 1, selectors: 1, tx: 1 });
    });

    it('runs update callbacks through the current Plite runtime', () => {
      const editor = extendPlateEditor(createEditor(), {
        plugins: [TestItalicPlugin],
        selection: {
          kind: 'text',
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 4, path: [0, 0] },
        },
        initialValue: [{ children: [{ text: 'text' }], type: 'p' }],
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
      const InlineTxPlugin = createBasePlugin({
        key: 'mention',
        type: 'mention',
        schema: {
          element: {
            void: 'inline',
          },
        },
      }).extendTx(({ type }) => (tx) => ({
        insert: () => {
          tx.nodes.insert([{ children: [{ text: '' }], type }, { text: ' ' }]);
        },
      }));
      const editor = extendPlateEditor(createEditor(), {
        plugins: [InlineTxPlugin],
        selection: {
          kind: 'text',
          anchor: { offset: 2, path: [0, 0] },
          focus: { offset: 2, path: [0, 0] },
        },
        initialValue: [{ children: [{ text: 'hello' }], type: 'p' }],
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
        type: 'p',
      });
    });

    it('installs schema.element selection behavior through the schema adapter', () => {
      const NonSelectableVoidPlugin = createBasePlugin({
        key: 'badge',
        type: 'badge',
        schema: {
          element: {
            selectable: false,
            void: 'markable-inline',
          },
        },
      });
      const editor = extendPlateEditor(createEditor(), {
        plugins: [NonSelectableVoidPlugin],
        initialValue: [{ children: [{ text: '' }], type: 'p' }],
      });
      const badgeElement = { children: [{ text: '' }], type: 'badge' };

      expect(editor.read.schema.isSelectable(badgeElement)).toBe(false);
      expect(editor.read.schema.isVoid(badgeElement)).toBe(true);
      expect(editor.read.schema.markableVoid(badgeElement)).toBe(true);
    });

    it('compiles boolean marks, parameterized marks, and element grammar', () => {
      const CellPlugin = createBasePlugin({
        key: 'cell',
        type: 'configured-cell',
        schema: { element: TextBlockElement },
      });
      const RowPlugin = createBasePlugin({
        key: 'row',
        type: 'configured-row',
        schema: ({ plugins }) => {
          const cellType = plugins.elementType(CellPlugin);

          return {
            element: {
              content: schema.content.type(cellType, {
                default: { type: cellType },
                min: 1,
              }),
              selectable: false,
            },
          };
        },
      });
      const TonePlugin = createBasePlugin({
        key: 'tone',
        schema: ({ plugins }) => ({
          mark: {
            split: 'drop',
            target: target.type(plugins.elementType(CellPlugin)),
            property: property.string(),
          },
        }),
      });
      const editor = extendPlateEditor(createEditor(), {
        plugins: [RowPlugin, CellPlugin, TonePlugin],
        schema: { id: 'plate-core-test', version: 4 },
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
      expect(editor.read.schema.createAndFill('configured-row')).toEqual({
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
        editor.read.schema.validateDocument({
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
      const editor = extendBaseEditor(createEditor(), {
        initialValue: [{ text: 'wrapped' }] as unknown as Value,
      });

      expect(editor.read.children()).toEqual([
        { children: [{ text: 'wrapped' }], type: 'p' },
      ]);
    });

    it('decodes and transforms HTML before fitting its root content', () => {
      let transformedInput: ReturnType<BaseEditor['read']['value']> | undefined;
      const TransformHtmlPlugin = createBasePlugin({
        key: 'transformHtml',
        transformInitialValue: ({ value }) => {
          transformedInput = value;

          return {
            ...value,
            children: [{ children: [], type: 'p' }],
          };
        },
      });
      const editor = extendBaseEditor(createEditor(), {
        plugins: [TransformHtmlPlugin, HtmlPlugin],
        initialValue: ({ editor }) =>
          editor.plugin(HtmlPlugin).api.deserialize({ element: '<p>html</p>' }),
      });

      expect(transformedInput).toEqual({
        children: [{ children: [{ text: 'html' }], type: 'p' }],
      });
      expect(editor.read.children()).toEqual([
        { children: [{ text: '' }], type: 'p' },
      ]);
    });

    it('preserves an existing document when initialValue is omitted', () => {
      const rawEditor = createEditor({
        initialValue: [{ children: [{ text: 'existing' }], type: 'p' }],
      });

      const editor = extendBaseEditor(rawEditor, {});

      expect(editor.read.children()).toEqual([
        { children: [{ text: 'existing' }], type: 'p' },
      ]);
    });

    it('initializes and transforms one full multi-root document', () => {
      const FigurePlugin = createBasePlugin({
        key: 'figure',
        schema: {
          element: {
            contentRoots: {
              caption: {
                content: schema.content.type('p', {
                  default: { type: 'p' },
                  min: 1,
                }),
                ownership: 'exclusive',
              },
            },
            topLevel: true,
            void: 'block',
          },
        },
      });
      const TransformDocumentPlugin = createBasePlugin({
        key: 'transformDocument',
        schema: {
          properties: [
            schema.elementProperty('transformed', property.boolean(), {
              target: target.group('element'),
            }),
          ],
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
            'caption:1': [{ children: [{ text: 'Caption' }], type: 'p' }],
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
              type: 'p',
            },
          ],
        },
      });
    });

    it('requires explicit initialValue to contain a root element', () => {
      expect(() =>
        extendBaseEditor(createEditor(), { initialValue: [] })
      ).toThrow('initialValue must contain at least one primary-root element');
    });

    it('rejects impossible external content before replacing the document', () => {
      expect(() =>
        extendBaseEditor(createEditor(), {
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
      const QuotePlugin = createBasePlugin({
        key: 'quote',
        schema: { element: { ...TextBlockElement } },
      });
      const TonePlugin = createBasePlugin({
        key: 'tone',
        schema: { mark: { property: property.string() } },
      });
      const options = {
        initialValue: [
          { children: [{ text: 'body', tone: 'quiet' }], type: 'quote' },
        ] as Value,
      };
      const first = extendPlateEditor(createEditor(), {
        ...options,
        plugins: [QuotePlugin, TonePlugin],
      });
      const second = extendPlateEditor(createEditor(), {
        ...options,
        plugins: [TonePlugin, QuotePlugin],
      });

      expect(first.read.schema.identity()?.fingerprint).toBe(
        second.read.schema.identity()?.fingerprint
      );
    });

    it('uses configured pure schema targets without global property leakage', () => {
      const BadgePlugin = createBasePlugin({
        key: 'badge',
        type: 'badge-node',
        schema: {
          element: {
            ...TextBlockElement,
            properties: { variant: property.string() },
          },
        },
      });
      const IdentityPlugin = createBasePlugin({
        key: 'identity',
        schema: ({ own, plugins, targetPluginKeys }) => ({
          properties: [
            own.elementProperty(property.string(), {
              target: target.types(plugins.elementTypesByKey(targetPluginKeys)),
            }),
          ],
        }),
        targetPluginKeys: [BadgePlugin.key] as const,
      });
      const editor = extendPlateEditor(createEditor(), {
        plugins: [IdentityPlugin, BadgePlugin],
        initialValue: [
          { children: [{ text: 'paragraph' }], type: 'p' },
          {
            children: [{ text: 'badge' }],
            identity: 'badge-1',
            type: 'badge-node',
            variant: 'info',
          },
        ],
      });

      expect(() =>
        editor.read.schema.validateFragment([
          { children: [{ text: '' }], identity: 'leak', type: 'p' },
        ])
      ).toThrow(/identity/i);
      expect(() =>
        editor.read.schema.validateFragment([
          { children: [{ text: '' }], identity: 1, type: 'badge-node' },
        ])
      ).toThrow(/identity/i);
    });

    it('derives container types from compiled schema grammar', () => {
      const ContainerPlugin = createBasePlugin({
        key: 'container',
        type: 'container-node',
        schema: {
          element: {
            content: schema.content.group('block'),
          },
        },
      });
      const editor = extendPlateEditor(createEditor(), {
        plugins: [ContainerPlugin],
      });

      expect(getContainerTypes(editor)).toEqual(['container-node']);
    });

    it('publishes schema conflicts atomically', () => {
      const editor = createEditor();
      const identityBefore = editor.read.schema.identity();
      const valueBefore = editor.read.value();
      const duplicatePropertyPlugin = (key: string) =>
        createBasePlugin({
          key,
          schema: {
            properties: [
              schema.elementProperty('duplicate', property.string(), {
                target: target.group('element'),
              }),
            ],
          },
        });

      expect(() =>
        extendBaseEditor(editor, {
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
      const customPlugin = createBasePlugin({ key: 'custom' });
      const editor = extendPlateEditor(createEditor(), {
        override: {
          components: {},
        },
        plugins: [customPlugin],
      });

      expect(
        getPlateRuntime(editor).pluginList.map((plugin) => plugin.key)
      ).toEqual([...coreKeys, 'custom']);
      expect(editor.getPlugin({ key: 'custom' })).toBeDefined();
    });
  });

  describe('when plugins is an empty array', () => {
    it('only have core plugins', () => {
      const editor = extendPlateEditor(createEditor(), {
        plugins: [],
      });

      expect(
        getPlateRuntime(editor).pluginList.map((plugin) => plugin.key)
      ).toEqual(coreKeys);
    });
  });

  describe('when using override', () => {
    it('merge components', () => {
      const HeadingPlugin = createPlatePlugin({ key: 'h1' });
      const customComponent = () => null;

      const editor = extendPlateEditor(createEditor(), {
        override: {
          components: {
            h1: customComponent,
          },
        },
        plugins: [HeadingPlugin],
      });

      const h1Plugin = editor.getPlugin({ key: 'h1' });
      expect(h1Plugin.render.node).toBe(customComponent);
    });

    it('respect priority when overriding existing components', () => {
      const originalComponent = () => null;
      const overrideComponent = () => null;
      const HeadingPlugin = createPlatePlugin({
        key: 'h1',
        priority: 100,
        render: { node: originalComponent },
      });

      // Test with low priority override
      let editor = extendPlateEditor(createEditor(), {
        plugins: [HeadingPlugin],
      });

      let h1Plugin = editor.getPlugin(HeadingPlugin);
      expect(h1Plugin.render.node).toBe(originalComponent);

      // Test with high priority override
      editor = extendPlateEditor(createEditor(), {
        override: {
          components: {
            h1: overrideComponent,
          },
        },
        plugins: [HeadingPlugin],
      });

      h1Plugin = editor.getPlugin(HeadingPlugin);
      expect(h1Plugin.render.node).toBe(overrideComponent);
    });
  });

  describe('when replacing core plugins', () => {
    it('replace core plugins with custom plugins, maintain order, and add additional plugins', () => {
      const additionalPlugin = createBasePlugin({
        key: 'additional',
        type: 'additional',
      });
      const [ReactDOMPlugin] = getPlateCorePlugins();

      const editor = extendPlateEditor(createEditor(), {
        plugins: [ParagraphPlugin, ReactDOMPlugin, additionalPlugin],
      });

      const pluginCache = getPlateRuntime(editor).pluginList.map(
        (plugin) => plugin.key
      );
      const pluginTypes = getPlateRuntime(editor).pluginList.map(
        (plugin) => plugin.type
      );

      // Check if React DOM replacement plugin replaced DOMPlugin.
      expect(pluginCache).toContain(ReactDOMPlugin.key);
      expect(pluginTypes).toContain(ReactDOMPlugin.type);

      // Check if ParagraphPlugin is present
      expect(pluginCache).toContain(ParagraphPlugin.key);
      expect(pluginTypes).toContain(ParagraphPlugin.type);

      // Check if additional plugin is added
      expect(pluginCache).toContain('additional');
      expect(pluginTypes).toContain('additional');

      // Check if the order is correct
      const reactIndex = pluginCache.indexOf(ReactDOMPlugin.key);
      const paragraphIndex = pluginCache.indexOf(ParagraphPlugin.key);
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
        createBasePlugin({ key: 'dom' }),
        createBasePlugin({ key: 'history' }),
      ];

      const editor = extendPlateEditor(existingEditor, {});

      const pluginCache = getPlateRuntime(editor).pluginList.map(
        (plugin) => plugin.key
      );
      expect(pluginCache.filter((key) => key === 'dom')).toHaveLength(1);
      expect(pluginCache.filter((key) => key === 'history')).toHaveLength(1);
    });

    it('add missing core plugins', () => {
      const existingEditor = createEditor() as any;
      existingEditor.pluginList = [
        createBasePlugin({ key: 'dom' }),
        createBasePlugin({ key: 'history' }),
      ];

      const editor = extendPlateEditor(existingEditor, {});

      const pluginCache = getPlateRuntime(editor).pluginList.map(
        (plugin) => plugin.key
      );
      coreKeys.forEach((key) => {
        expect(pluginCache).toContain(key);
      });
    });

    it('does not preserve custom plugins', () => {
      const customPlugin = createBasePlugin({ key: 'custom' });
      const existingEditor = createEditor() as any;
      existingEditor.plugins = [
        createBasePlugin({ key: 'dom' }),
        createBasePlugin({ key: 'history' }),
        customPlugin,
      ];

      const editor = extendPlateEditor(existingEditor, {});

      expect(
        getPlateRuntime(editor).pluginList.map((plugin) => plugin.key)
      ).not.toContain('custom');
    });
  });

  it('forwards maxLength to the Plite runtime', () => {
    const editor = createBaseEditor({
      autoSelect: 'end',
      maxLength: 5,
      initialValue: [{ children: [{ text: '' }], type: 'p' }],
    });

    editor.update.text.insert('Hello world');

    expect(editor.read.text.string([])).toBe('Hello');
  });

  it('can disable affinity from base editor options', () => {
    const editor = createBaseEditor({
      affinity: false,
    });

    expect(
      getPlateRuntime(editor).pluginList.map((plugin) => plugin.key)
    ).not.toContain(AffinityPlugin.key);
  });

  it('syncs explicit readOnly into the Plite view state', () => {
    const editor = extendBaseEditor(createEditor(), {
      readOnly: true,
    });

    expect(editor.read.view.isReadOnly()).toBe(true);
  });

  it('preserves existing Plite readOnly state when readOnly is omitted', () => {
    const editor = extendBaseEditor(createEditor({ readOnly: true }), {});

    expect(editor.read.view.isReadOnly()).toBe(true);
  });

  it('syncs the Plate paragraph type into Plite block toggles', () => {
    const BlockquotePlugin = createBasePlugin({
      key: 'blockquote',
      schema: { element: { ...TextBlockElement } },
    });
    const editor = extendBaseEditor(createEditor(), {
      plugins: [
        ParagraphPlugin.configure({
          type: 'paragraph',
        }),
        BlockquotePlugin,
      ],
      initialValue: [{ children: [{ text: 'one' }], type: 'blockquote' }],
    });

    editor.update.selection.set({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    });
    editor.update.blocks.toggle('blockquote');

    expect(editor.read.children()).toEqual([
      { children: [{ text: 'one' }], type: 'paragraph' },
    ]);
  });

  it('preserves Plate marks allowed by the destination block schema', () => {
    const HeadingPlugin = createBasePlugin({
      key: 'heading',
      schema: { element: { ...TextBlockElement } },
    });
    const TonePlugin = createBasePlugin({
      key: 'tone',
      schema: { mark: { property: property.string() } },
    });
    const EphemeralPlugin = createBasePlugin({
      key: 'ephemeral',
      schema: { mark: { typeChange: 'drop', property: property.boolean() } },
    });
    const editor = extendBaseEditor(createEditor(), {
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
          type: 'p',
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
    const value = [{ children: [{ text: 'Hello' }], type: 'p' }];
    const selection = {
      kind: 'text' as const,
      anchor: { offset: 2, path: [0, 0] },
      focus: { offset: 4, path: [0, 0] },
    };

    const result = extendBaseEditor(editor, {
      selection,
      shouldNormalizeEditor: true,
      initialValue: value,
    });

    expect(result.read.children()).toEqual(value);
    expect(result.read.selection()).toEqual(selection);

    // Test autoSelect start
    const editorWithAutoSelectStart = extendBaseEditor(createEditor(), {
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
    const editorWithAutoSelectEnd = extendBaseEditor(createEditor(), {
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

    const editorWithElementPathSelection = extendBaseEditor(createEditor(), {
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
    const editorWithEmptyChildren = extendBaseEditor(createEditor(), {});
    expect(editorWithEmptyChildren.read.children()).toEqual([
      { children: [{ text: '' }], type: 'p' },
    ]);
  });

  it('preserves initial selection when transforms wrap selected text', () => {
    const wrapCellText = (node: any): any => {
      if (!node || typeof node !== 'object' || !Array.isArray(node.children)) {
        return node;
      }

      if (node.type === 'td') {
        return {
          ...node,
          children: node.children.map((child: any) =>
            child && typeof child === 'object' && 'text' in child
              ? { children: [child], type: 'p' }
              : wrapCellText(child)
          ),
        };
      }

      return {
        ...node,
        children: node.children.map(wrapCellText),
      };
    };
    const WrapTextPlugin = createBasePlugin({
      key: 'wrapText',
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
    const TablePlugin = createBasePlugin({
      key: 'table',
      schema: {
        element: {
          content: schema.content.type('tr', {
            default: { type: 'tr' },
            min: 1,
          }),
        },
      },
    });
    const TableRowPlugin = createBasePlugin({
      key: 'tr',
      schema: {
        element: {
          content: schema.content.type('td', {
            default: { type: 'td' },
            min: 1,
          }),
        },
      },
    });
    const TableCellPlugin = createBasePlugin({
      key: 'td',
      schema: {
        element: {
          content: schema.content.group('block', {
            default: { type: 'p' },
            min: 1,
          }),
        },
      },
    });
    const editor = extendBaseEditor(createEditor(), {
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
                { children: [{ text: '11' }], type: 'td' },
                { children: [{ text: '12' }], type: 'td' },
              ],
              type: 'tr',
            },
            {
              children: [
                { children: [{ text: '21' }], type: 'td' },
                { children: [{ text: '22' }], type: 'td' },
              ],
              type: 'tr',
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

      const editor = extendBaseEditor(createEditor(), {
        plugins: [TestBoldPlugin, HtmlPlugin],
        initialValue: ({ editor }) =>
          editor.plugin(HtmlPlugin).api.deserialize({ element: htmlString }),
      });

      expect(editor.read.children()).toEqual([
        {
          children: [{ text: 'Hello, ' }, { bold: true, text: 'world!' }],
          type: 'p',
        },
      ]);
    });
  });

  describe('when the previous editor has an id', () => {
    it('reuses the raw editor id', () => {
      const editor = extendBaseEditor(createEditor({ id: 'old' }), {});
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
      const id1 = extendBaseEditor(createEditor(), {}).id;
      const id2 = extendBaseEditor(createEditor(), {}).id;
      expect(id1).toBeTruthy();
      expect(id2).toBeTruthy();
      expect(id1).not.toEqual(id2);
    });
  });
});
