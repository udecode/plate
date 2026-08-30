import {
  createEditor as createPliteEditor,
  property,
  schema,
  target,
  type Value,
} from '../../facade';
import {
  getCompiledPlateContainerTypes,
  getPlateRuntime,
} from '../../internal/plugin/compilePlateModel';
import { NavigationFeedbackPlugin, ParagraphPlugin } from '../../react';
import { getPlateCorePlugins } from '../../react/editor/getPlateCorePlugins';
import { createEditor as createReactEditor } from '../../react/editor/withPlate';
import { definePlatePlugin } from '../../react/plugin/definePlatePlugin';
import { EventEditorPlugin } from '../../react/plugins/event-editor/EventEditorPlugin';
import {
  AffinityPlugin,
  type Editor,
  BaseParagraphPlugin,
  defineBasePlugin,
  createEditor as createHeadlessEditor,
  DebugPlugin,
  DOMPlugin,
  ElementIdPlugin,
  ElementStatePlugin,
  HistoryPlugin,
  HtmlPlugin,
  OverridePlugin,
} from '../index';
import { InputRulesPlugin } from '../plugins/input-rules/InputRulesPlugin';

const coreNames = [
  'root',
  DebugPlugin.name,
  ElementStatePlugin.name,
  DOMPlugin.name,
  HistoryPlugin.name,
  InputRulesPlugin.name,
  OverridePlugin.name,
  HtmlPlugin.name,
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

describe('createReactEditor', () => {
  describe('application schema', () => {
    it('constructs an application-owned structural root', () => {
      const SectionPlugin = defineBasePlugin('applicationSection', {
        schema: {
          element: {
            content: schema.content.element(BaseParagraphPlugin, { min: 1 }),
          },
        },
      });
      const editor = createHeadlessEditor({
        plugins: [SectionPlugin],
        schema: {
          root: schema.content.element(SectionPlugin, { min: 1 }),
        },
      });

      expect(editor.read.children()).toEqual([
        {
          children: [{ children: [{ text: '' }], type: 'paragraph' }],
          type: 'applicationSection',
        },
      ]);
      expect(() =>
        editor.read.schema.assertDocument(editor.read.value())
      ).not.toThrow();
    });

    it('preserves the omitted application root exactly', () => {
      const editor = createHeadlessEditor();

      expect(editor.read.schema.identity()).toMatchObject({
        fingerprint: 'fnv1a64:4164b9dbcdccb294',
        kind: 'derived',
      });
      expect(editor.read.schema.createDefaultRootChild()).toEqual({
        children: [{ text: '' }],
        type: 'paragraph',
      });
      expect(editor.read.children()).toEqual([
        { children: [{ text: '' }], type: 'paragraph' },
      ]);
    });

    it('constructs every required application root child', () => {
      const editor = createHeadlessEditor({
        schema: {
          root: schema.content.element(BaseParagraphPlugin, { min: 2 }),
        },
      });

      expect(editor.read.children()).toEqual([
        { children: [{ text: '' }], type: 'paragraph' },
        { children: [{ text: '' }], type: 'paragraph' },
      ]);
    });

    it('lowers a multi-element root default through persisted type overrides', () => {
      const CardPlugin = defineBasePlugin('applicationRootCard', {
        schema: {
          element: {
            ...TextBlockElement,
            type: 'authored_application_root_card',
          },
        },
      });
      const editor = createHeadlessEditor({
        plugins: [CardPlugin],
        schema: {
          overrides: [
            schema.override(CardPlugin, {
              element: { type: 'persisted_application_root_card' },
            }),
          ],
          root: schema.content.elements([CardPlugin, BaseParagraphPlugin], {
            min: 1,
          }),
        },
      });

      expect(editor.read.children()).toEqual([
        {
          children: [{ text: '' }],
          type: 'persisted_application_root_card',
        },
      ]);
      editor.update.nodes.insert(
        { children: [{ text: 'next' }], type: 'paragraph' },
        { at: [1] }
      );
      expect(editor.read.children()[1]).toEqual({
        children: [{ text: 'next' }],
        type: 'paragraph',
      });
    });

    it('rejects invalid application root minima', () => {
      for (const min of [-1, 0, 1.5, Number.NaN]) {
        const root = {
          ...schema.content.element(BaseParagraphPlugin, { min: 1 }),
          min,
        } as never;

        expect(() =>
          createHeadlessEditor({
            schema: {
              root,
            },
            skipInitialization: true,
          })
        ).toThrow(
          'Editor application schema root min must be a positive integer.'
        );
      }
    });

    it('rejects malformed application roots instead of treating them as omitted', () => {
      for (const root of [null, false, 0, {}]) {
        expect(() =>
          createHeadlessEditor({
            schema: { root } as never,
            skipInitialization: true,
          })
        ).toThrow(
          'Editor application schema root min must be a positive integer.'
        );
      }
    });

    it('rejects invalid application root descriptors', () => {
      const InstalledPlugin = defineBasePlugin('applicationRootFamily', {
        schema: { element: TextBlockElement },
      });
      const ForeignPlugin = defineBasePlugin('applicationRootFamily', {
        schema: { element: TextBlockElement },
      });
      const BehaviorPlugin = defineBasePlugin('applicationRootBehavior', {});

      expect(() =>
        createHeadlessEditor({
          plugins: [InstalledPlugin],
          schema: {
            root: schema.content.element(ForeignPlugin, { min: 1 }),
          },
          skipInitialization: true,
        })
      ).toThrow(
        'Editor schema relationship descriptor "applicationRootFamily" does not match the installed plugin family.'
      );
      expect(() =>
        createHeadlessEditor({
          schema: {
            root: schema.content.element(BehaviorPlugin, { min: 1 }),
          },
          skipInitialization: true,
        })
      ).toThrow(
        'Editor schema relationship references missing element plugin "applicationRootBehavior".'
      );
    });

    it('publishes declared schema lineage', () => {
      const CalloutPlugin = defineBasePlugin('generatedCallout', {
        schema: { element: schema.element.textBlock() },
      });
      const editor = createHeadlessEditor({
        plugins: [CalloutPlugin],
        schema: { id: 'generated-document', version: 4 },
      });

      expect(editor.read.schema.identity()).toMatchObject({
        fingerprint: expect.any(String),
        id: 'generated-document',
        version: 4,
      });
    });

    it('rejects incomplete schema lineage at runtime', () => {
      expect(() =>
        createHeadlessEditor({
          schema: { id: 'incomplete-document' } as never,
        })
      ).toThrow('Editor schema lineage requires both id and version.');
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
      const editor = createHeadlessEditor({
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
        skipInitialization: true,
      });
      const card = editor.read.schema.create(CardPlugin);

      expect(editor.plugin(CardPlugin).schema.type).toBe('card');
      expect(card.type).toBe('card');
      expect(editor.read.schema.element('application_card')).toBeNull();
      expect(editor.read.schema.element('card')?.type).toBe('card');
      expect(editor.read.schema.getProperty(card, 'tone')).toBe('neutral');
      expect(
        editor.read.schema.property({
          key: 'reviewState',
          placement: 'element',
        })
      ).not.toBeNull();
    });

    it('lowers multi-element application targets to persisted schema types', () => {
      const CardPlugin = defineBasePlugin('applicationTargetCard', {
        schema: {
          element: { ...TextBlockElement, type: 'application_target_card' },
        },
      });
      const PanelPlugin = defineBasePlugin('applicationTargetPanel', {
        schema: {
          element: { ...TextBlockElement, type: 'application_target_panel' },
        },
      });
      const reviewState = schema.elementProperty(
        'reviewState',
        property.enum(['draft', 'approved'] as const, {
          default: 'draft',
        }),
        { target: target.elements([CardPlugin, PanelPlugin]) }
      );
      const reviewStateHandle = schema.handle.property(reviewState);
      const editor = createHeadlessEditor({
        plugins: [CardPlugin, PanelPlugin],
        schema: {
          properties: {
            reviewState,
          },
        },
        skipInitialization: true,
      });
      const card = editor.read.schema.create(CardPlugin);
      const panel = editor.read.schema.create(PanelPlugin);

      expect(editor.read.schema.getProperty(card, reviewStateHandle)).toBe(
        'draft'
      );
      expect(editor.read.schema.getProperty(panel, reviewStateHandle)).toBe(
        'draft'
      );
    });

    it('rejects different same-name descriptor families in application schema', () => {
      const InstalledPlugin = defineBasePlugin('applicationFamily', {
        schema: { element: TextBlockElement },
      });
      const ForeignPlugin = defineBasePlugin('applicationFamily', {
        schema: { element: TextBlockElement },
      });
      expect(() =>
        createHeadlessEditor({
          plugins: [InstalledPlugin],
          schema: {
            overrides: [
              schema.override(ForeignPlugin, {
                element: { type: 'application_family' },
              }),
            ],
          },
          skipInitialization: true,
        })
      ).toThrow(
        'Editor schema override descriptor "applicationFamily" does not match the installed plugin family.'
      );
      expect(() =>
        createHeadlessEditor({
          plugins: [InstalledPlugin],
          schema: {
            properties: {
              reviewState: schema.elementProperty(property.string(), {
                target: target.elements([ForeignPlugin]),
              }),
            },
          },
          skipInitialization: true,
        })
      ).toThrow(
        'Editor schema relationship descriptor "applicationFamily" does not match the installed plugin family.'
      );
    });
  });

  describe('when default plugins', () => {
    it('have core plugins', () => {
      const editor = createReactEditor({ editor: createPliteEditor() });

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
      const editor = createPliteEditor();
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

      createReactEditor({ editor });

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
        createReactEditor({
          editor: createPliteEditor(),
          initialValue: [
            { children: [{ text: 'stable' }], type: 'not-a-plate-element' },
          ],
        })
      ).toThrow(/unknown editor element type "not-a-plate-element"/i);
    });

    it('installs persisted element identity only when requested', () => {
      let nextId = 0;
      const editor = createHeadlessEditor({
        initialValue: [
          { children: [{ text: 'known' }], id: 'known', type: 'paragraph' },
          { children: [{ text: 'missing' }], type: 'paragraph' },
        ],
        plugins: [
          ElementIdPlugin.configure({
            initialState: { generateId: () => `generated-${(nextId += 1)}` },
          }),
        ],
      });

      expect(editor.read.children()[0]?.id).toBe('known');
      expect(editor.read.children()[1]?.id).toMatch(/^generated-/);
      expect(() =>
        editor.read.schema.assertDocument(editor.read.value())
      ).not.toThrow();

      editor.update.nodes.insert(
        { children: [{ text: 'inserted' }], type: 'paragraph' },
        { at: [2] }
      );

      expect(editor.read.children()[2]?.id).toMatch(/^generated-/);

      const editorWithoutPersistedIds = createHeadlessEditor();

      expect(
        getPlateRuntime(editorWithoutPersistedIds).pluginList.some(
          (plugin) => plugin.name === ElementIdPlugin.name
        )
      ).toBe(false);
      expect(() =>
        editorWithoutPersistedIds.update.nodes.insert(
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
      const editor = createReactEditor({
        editor: createPliteEditor(),
        plugins: [TxPlugin, TestBoldPlugin],
        selection: {
          kind: 'text',
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 4, path: [0, 0] },
        },
        initialValue: [{ children: [{ text: 'text' }], type: 'paragraph' }],
      });

      expect(() =>
        editor.update((tx) => {
          tx.plugin(TxPlugin).bold();

          throw new Error('rollback');
        })
      ).toThrow('rollback');
      expect(editor.read.children()[0].children[0]).toEqual({ text: 'text' });
      expect(() =>
        editor.read((state) =>
          state.transaction((tx) => tx.plugin(TxPlugin).bold())
        )
      ).not.toThrow();

      editor.update((tx) => tx.plugin(TxPlugin).bold());
      editor.update((tx) => tx.plugin('txPlugin').bold());
      editor.update((tx) => tx.txPlugin.bold());

      expect(editor.read.children()[0].children[0]).toMatchObject({
        bold: true,
        text: 'text',
      });
    });

    it('validates transaction plugin descriptor identity and installation', () => {
      const TxPlugin = defineBasePlugin('txPlugin', {
        update: () => ({ run: () => undefined }),
      });
      const WrongFamily = defineBasePlugin('txPlugin', {
        update: () => ({ run: () => undefined }),
      });
      const MissingPlugin = defineBasePlugin('missingPlugin', {
        update: () => ({ run: () => undefined }),
      });
      const editor = createHeadlessEditor({ plugins: [TxPlugin] });

      expect(() => editor.update((tx) => tx.plugin(WrongFamily).run())).toThrow(
        'Plate plugin "txPlugin" resolves to a different descriptor family.'
      );
      expect(() =>
        editor.update((tx) => tx.plugin(MissingPlugin).run())
      ).toThrow('Plate plugin "missingPlugin" is not installed.');
    });

    it('keeps the plugin capability name available through the transaction portal', () => {
      let calls = 0;
      const Plugin = defineBasePlugin('plugin', {
        update: () => ({ run: () => (calls += 1) - 1 }),
      });
      const editor = createHeadlessEditor({ plugins: [Plugin] });

      editor.update((tx) => {
        tx.plugin(Plugin).run();
        tx.plugin.run();
      });

      expect(calls).toBe(2);
    });

    it('installs plugin dependencies before their dependent', () => {
      const DependencyPlugin = defineBasePlugin('dependency', {});
      const DependentPlugin = defineBasePlugin('dependent', {
        dependencies: [DependencyPlugin],
      });
      const editor = createReactEditor({
        editor: createPliteEditor(),
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

      createReactEditor({
        editor: createPliteEditor(),
        plugins: [DependentPlugin, ExplicitDependencyPlugin],
      });

      expect(calls).toEqual({ api: 1, distinct: 1, selectors: 1, tx: 1 });
    });

    it('runs update callbacks through the current Plite runtime', () => {
      const editor = createReactEditor({
        editor: createPliteEditor(),
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
      }).extend(({ schema: { type } }) => ({
        update: ({ tx }) => ({
          insert: () => {
            tx.nodes.insert([
              { children: [{ text: '' }], type },
              { text: ' ' },
            ]);
          },
        }),
      }));
      const editor = createReactEditor({
        editor: createPliteEditor(),
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
      const editor = createReactEditor({
        editor: createPliteEditor(),
        plugins: [NonSelectableVoidPlugin],
        initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
      });
      const badgeElement = { children: [{ text: '' }], type: 'badge' };

      expect(editor.read.schema.isSelectable(badgeElement)).toBe(false);
      expect(editor.read.schema.isVoid(badgeElement)).toBe(true);
      expect(editor.read.schema.isMarkableVoid(badgeElement)).toBe(true);
    });

    it('reports compiled Plate block-content semantics', () => {
      const FlowBlockPlugin = defineBasePlugin('flowBlock', {
        schema: {
          element: TextBlockElement,
        },
      });
      const NonSelectableBlockPlugin = defineBasePlugin('nonSelectableBlock', {
        schema: {
          element: {
            ...TextBlockElement,
            selectable: false,
          },
        },
      });
      const StructuralPlugin = defineBasePlugin('structural', {
        schema: {
          element: {
            ...TextBlockElement,
            blockContent: false,
          },
        },
      });
      const InlinePlugin = defineBasePlugin('inline', {
        schema: {
          element: {
            void: 'inline',
          },
        },
      });
      const flowBlockElement = {
        children: [{ text: '' }],
        type: 'flowBlock',
      };
      const nonSelectableBlockElement = {
        children: [{ text: '' }],
        type: 'nonSelectableBlock',
      };
      const editor = createReactEditor({
        editor: createPliteEditor(),
        plugins: [
          FlowBlockPlugin,
          InlinePlugin,
          NonSelectableBlockPlugin,
          StructuralPlugin,
        ],
        initialValue: [flowBlockElement],
      });

      expect(editor.read.schema.isBlockContent(flowBlockElement)).toBe(true);
      expect(editor.read.schema.isBlockContent(nonSelectableBlockElement)).toBe(
        true
      );
      expect(editor.read.nodes.isSelectable(nonSelectableBlockElement)).toBe(
        false
      );
      expect(
        editor.read.schema.isBlockContent({
          children: [{ text: '' }],
          type: 'structural',
        })
      ).toBe(false);
      expect(
        editor.read.schema.isBlockContent({
          children: [{ text: '' }],
          type: 'inline',
        })
      ).toBe(false);
      expect(
        editor.read.schema.isBlockContent({
          children: [{ text: '' }],
          type: 'unknown',
        })
      ).toBe(false);
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
      const editor = createReactEditor({
        editor: createPliteEditor(),
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
      const editor = createHeadlessEditor({
        editor: createPliteEditor(),
        initialValue: [{ text: 'wrapped' }] as unknown as Value,
      });

      expect(editor.read.children()).toEqual([
        { children: [{ text: 'wrapped' }], type: 'paragraph' },
      ]);
    });

    it('decodes and transforms HTML before fitting its root content', () => {
      let transformedInput: ReturnType<Editor['read']['value']> | undefined;
      const TransformHtmlPlugin = defineBasePlugin('transformHtml', {
        prepareDocument: ({ document }) => {
          transformedInput = document;

          return {
            ...document,
            children: [{ children: [], type: 'paragraph' }],
          };
        },
      });
      const editor = createHeadlessEditor({
        editor: createPliteEditor(),
        plugins: [TransformHtmlPlugin, HtmlPlugin],
        initialValue: ({ editor: innerEditor }) =>
          innerEditor
            .plugin(HtmlPlugin)
            .api.deserialize({ element: '<p>html</p>' }),
      });

      expect(transformedInput).toEqual({
        children: [{ children: [{ text: 'html' }], type: 'paragraph' }],
      });
      expect(editor.read.children()).toEqual([
        { children: [{ text: '' }], type: 'paragraph' },
      ]);
    });

    it('preserves an existing document when initialValue is omitted', () => {
      const rawEditor = createPliteEditor({
        initialValue: [{ children: [{ text: 'existing' }], type: 'paragraph' }],
      });

      const editor = createHeadlessEditor({ editor: rawEditor });

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
        prepareDocument: ({ document }) => ({
          ...document,
          children: document.children.map((node) => ({
            ...node,
            transformed: true,
          })),
          roots: Object.fromEntries(
            Object.entries(document.roots ?? {}).map(([root, children]) => [
              root,
              children.map((node) => ({ ...node, transformed: true })),
            ])
          ),
        }),
      });
      const editor = createHeadlessEditor({
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
        createHeadlessEditor({ editor: createPliteEditor(), initialValue: [] })
      ).toThrow('initialValue must contain at least one primary-root element');
    });

    it('rejects impossible external content before replacing the document', () => {
      expect(() =>
        createHeadlessEditor({
          editor: createPliteEditor(),
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
      const first = createReactEditor({
        editor: createPliteEditor(),
        ...options,
        plugins: [QuotePlugin, TonePlugin],
      });
      const second = createReactEditor({
        editor: createPliteEditor(),
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
      const editor = createReactEditor({
        editor: createPliteEditor(),
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
      const editor = createReactEditor({
        editor: createPliteEditor(),
        plugins: [ContainerPlugin],
      });

      expect(getCompiledPlateContainerTypes(editor)).toEqual([
        'container-node',
      ]);
    });

    it('publishes schema conflicts atomically', () => {
      const editor = createPliteEditor();
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
        createHeadlessEditor({
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
      const editor = createReactEditor({
        editor: createPliteEditor(),
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
      const editor = createReactEditor({
        editor: createPliteEditor(),
        plugins: [],
      });

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
      const editor = createReactEditor({
        editor: createPliteEditor(),
        plugins: [Plugin],
      });

      expect(editor.plugin(Plugin).render.node).toBe(Component);
    });

    it('merge components', () => {
      const HeadingPlugin = definePlatePlugin('h1', {});
      const customComponent = () => null;

      const editor = createReactEditor({
        editor: createPliteEditor(),
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

      let editor = createReactEditor({
        editor: createPliteEditor(),
        plugins: [HeadingPlugin],
      });

      let h1Plugin = editor.plugin(HeadingPlugin);
      expect(h1Plugin.render.node).toBe(originalComponent);

      editor = createReactEditor({
        editor: createPliteEditor(),
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

      const editor = createReactEditor({
        editor: createPliteEditor(),
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
      const existingEditor = createPliteEditor() as any;
      existingEditor.plugins = [
        defineBasePlugin('dom', {}),
        defineBasePlugin('history', {}),
      ];

      const editor = createReactEditor({ editor: existingEditor });

      const names = getPlateRuntime(editor).pluginList.map(
        (plugin) => plugin.name
      );
      expect(names.filter((name) => name === 'dom')).toHaveLength(1);
      expect(names.filter((name) => name === 'history')).toHaveLength(1);
    });

    it('add missing core plugins', () => {
      const existingEditor = createPliteEditor() as any;
      existingEditor.pluginList = [
        defineBasePlugin('dom', {}),
        defineBasePlugin('history', {}),
      ];

      const editor = createReactEditor({ editor: existingEditor });

      const names = getPlateRuntime(editor).pluginList.map(
        (plugin) => plugin.name
      );
      coreNames.forEach((name) => {
        expect(names).toContain(name);
      });
    });

    it('does not preserve custom plugins', () => {
      const customPlugin = defineBasePlugin('custom', {});
      const existingEditor = createPliteEditor() as any;
      existingEditor.plugins = [
        defineBasePlugin('dom', {}),
        defineBasePlugin('history', {}),
        customPlugin,
      ];

      const editor = createReactEditor({ editor: existingEditor });

      expect(
        getPlateRuntime(editor).pluginList.map((plugin) => plugin.name)
      ).not.toContain('custom');
    });
  });

  it('forwards maxLength to the Plite runtime', () => {
    const editor = createHeadlessEditor({
      autoSelect: 'end',
      maxLength: 5,
      initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
    });

    editor.update.text.insert('Hello world');

    expect(editor.read.text.string([])).toBe('Hello');
  });

  it('can disable affinity from base editor options', () => {
    const editor = createHeadlessEditor({
      affinity: false,
    });

    expect(
      getPlateRuntime(editor).pluginList.map((plugin) => plugin.name)
    ).not.toContain(AffinityPlugin.name);
  });

  it('syncs explicit readOnly into the Plite view state', () => {
    const editor = createHeadlessEditor({
      editor: createPliteEditor(),
      readOnly: true,
    });

    expect(editor.read.view.isReadOnly()).toBe(true);
  });

  it('preserves existing Plite readOnly state when readOnly is omitted', () => {
    const editor = createHeadlessEditor({
      editor: createPliteEditor({ readOnly: true }),
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
    const editor = createHeadlessEditor({
      editor: createPliteEditor(),
      plugins: [CustomParagraphPlugin, BlockquotePlugin],
      initialValue: [{ children: [{ text: 'one' }], type: 'blockquote' }],
    });

    editor.update.selection.set({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    });
    editor.plugin(CustomParagraphPlugin).update.toggle();

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
    const editor = createHeadlessEditor({
      editor: createPliteEditor(),
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

    editor.plugin(HeadingPlugin).update.toggle();

    expect(editor.read.children()).toEqual([
      {
        children: [{ bold: true, text: 'one', tone: 'warm' }],
        type: 'heading',
      },
    ]);
  });

  it('handle value, selection, and autoSelect options correctly', () => {
    const editor = createPliteEditor();
    const value = [{ children: [{ text: 'Hello' }], type: 'paragraph' }];
    const selection = {
      kind: 'text' as const,
      anchor: { offset: 2, path: [0, 0] },
      focus: { offset: 4, path: [0, 0] },
    };

    const result = createHeadlessEditor({
      editor,
      selection,
      shouldNormalizeEditor: true,
      initialValue: value,
    });

    expect(result.read.children()).toEqual(value);
    expect(result.read.selection()).toEqual({
      anchor: selection.anchor,
      focus: selection.focus,
    });

    // Test autoSelect start
    const editorWithAutoSelectStart = createHeadlessEditor({
      editor: createPliteEditor(),
      autoSelect: 'start',
      initialValue: value,
    });
    const expectedStartSelection = {
      anchor: editorWithAutoSelectStart.read((state) => state.points.start([])),
      focus: editorWithAutoSelectStart.read((state) => state.points.start([])),
    };
    expect(editorWithAutoSelectStart.read.selection()).toEqual(
      expectedStartSelection
    );

    // Test autoSelect end
    const editorWithAutoSelectEnd = createHeadlessEditor({
      editor: createPliteEditor(),
      autoSelect: 'end',
      initialValue: value,
    });
    const expectedEndSelection = {
      anchor: editorWithAutoSelectEnd.read((state) => state.points.end([])),
      focus: editorWithAutoSelectEnd.read((state) => state.points.end([])),
    };
    expect(editorWithAutoSelectEnd.read.selection()).toEqual(
      expectedEndSelection
    );

    const editorWithElementPathSelection = createHeadlessEditor({
      editor: createPliteEditor(),
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0] },
        focus: { offset: 0, path: [0] },
      },
      initialValue: value,
    });
    expect(editorWithElementPathSelection.read.selection()).toEqual({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    });

    // Test empty children
    const editorWithEmptyChildren = createHeadlessEditor({
      editor: createPliteEditor(),
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
      prepareDocument: ({ document }) => ({
        ...document,
        children: document.children.map(wrapCellText) as Value,
        roots: Object.fromEntries(
          Object.entries(document.roots ?? {}).map(([root, children]) => [
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
    const editor = createHeadlessEditor({
      editor: createPliteEditor(),
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
      anchor: { offset: 2, path: [0, 1, 0, 0, 0] },
      focus: { offset: 2, path: [0, 0, 1, 0, 0] },
    });
  });

  describe('contextual initialValue', () => {
    it('deserializes HTML through the configured feature API', () => {
      const htmlString = '<p>Hello, <b>world!</b></p>';

      const editor = createHeadlessEditor({
        editor: createPliteEditor(),
        plugins: [TestBoldPlugin, HtmlPlugin],
        initialValue: ({ editor: innerEditor2 }) =>
          innerEditor2
            .plugin(HtmlPlugin)
            .api.deserialize({ element: htmlString }),
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
      const editor = createHeadlessEditor({
        editor: createPliteEditor({ id: 'old' }),
      });
      expect(editor.id).toBe('old');
    });
  });

  describe('when the id option is provided during creation', () => {
    it('uses the provided id', () => {
      const editor = createHeadlessEditor({
        id: 'new',
      });
      expect(editor.id).toBe('new');
    });
  });

  describe('when no id is provided', () => {
    it('use a unique id for each editor', () => {
      const id1 = createHeadlessEditor({ editor: createPliteEditor() }).id;
      const id2 = createHeadlessEditor({ editor: createPliteEditor() }).id;
      expect(id1).toBeTruthy();
      expect(id2).toBeTruthy();
      expect(id1).not.toEqual(id2);
    });
  });
});
