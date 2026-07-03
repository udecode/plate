import { createEditor, type Value } from '@platejs/plite';
import {
  NavigationFeedbackPlugin,
  ParagraphPlugin,
  ReactPlugin,
} from '../../react';
import { extendPlateEditor } from '../../react/editor/withPlate';
import { createPlatePlugin } from '../../react/plugin/createPlatePlugin';
import { EventEditorPlugin } from '../../react/plugins/event-editor/EventEditorPlugin';
import { InputRulesPlugin } from '../plugins/input-rules/internal/InputRulesPlugin';
import {
  AstPlugin,
  AffinityPlugin,
  createBasePlugin,
  createBaseEditor,
  DebugPlugin,
  DOMPlugin,
  ElementStatePlugin,
  HistoryPlugin,
  HtmlPlugin,
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
  AstPlugin.key,
  AffinityPlugin.key,
  ParagraphPlugin.key,
  EventEditorPlugin.key,
  NavigationFeedbackPlugin.key,
];

const TestBoldPlugin = createBasePlugin({
  key: 'bold',
  node: { isLeaf: true },
  parsers: {
    html: {
      deserializer: {
        rules: [{ validNodeName: ['STRONG', 'B'] }],
      },
    },
  },
});

describe('extendPlateEditor', () => {
  describe('when default plugins', () => {
    it('have core plugins', () => {
      const editor = extendPlateEditor(createEditor(), {
        id: '1',
      });

      expect(editor.id).toBe('1');
      expect(editor.read((state) => state.history())).toBeDefined();
      expect(editor.runtime.key).toBeDefined();
      expect(editor.runtime.pluginList.map((plugin) => plugin.key)).toEqual(
        coreKeys
      );
      expect(
        editor.runtime.pluginList.map((plugin) => plugin.node.type)
      ).toEqual(coreKeys);
      expect(Object.keys(editor.plugins)).toEqual(coreKeys);
      expect(
        (editor.getPlugin(DOMPlugin).handlers as any).onKeyDown
      ).toBeDefined();

      expect(editor.read.children()).toEqual([
        { children: [{ text: '' }], type: 'p' },
      ]);
      expect(editor.read.view.isReadOnly()).toBe(false);
    });

    it('executes tx-backed plugin commands through update on the current editor runtime', () => {
      const TxPlugin = createBasePlugin({
        key: 'txPlugin',
      }).extendTx(() => (tx) => ({
        bold: () => tx.marks.add('bold', true),
      }));
      const editor = extendPlateEditor(createEditor(), {
        plugins: [TxPlugin],
        selection: {
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 4, path: [0, 0] },
        },
        value: [{ children: [{ text: 'text' }], type: 'p' }],
      });

      editor.update((tx) => tx.txPlugin.bold());

      expect(editor.read.children()[0].children[0]).toMatchObject({
        bold: true,
        text: 'text',
      });
    });

    it('runs update callbacks through the current Plite runtime', () => {
      const editor = extendPlateEditor(createEditor(), {
        selection: {
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 4, path: [0, 0] },
        },
        value: [{ children: [{ text: 'text' }], type: 'p' }],
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

    it('installs plugin node flags before tx groups insert inline nodes', () => {
      const InlineTxPlugin = createBasePlugin({
        key: 'mention',
        node: {
          isElement: true,
          isInline: true,
          isVoid: true,
          type: 'mention',
        },
      }).extendTx(({ type }) => (tx) => ({
        insert: () => {
          tx.nodes.insert([{ children: [{ text: '' }], type }, { text: ' ' }]);
        },
      }));
      const editor = extendPlateEditor(createEditor(), {
        plugins: [InlineTxPlugin],
        selection: {
          anchor: { offset: 2, path: [0, 0] },
          focus: { offset: 2, path: [0, 0] },
        },
        value: [{ children: [{ text: 'hello' }], type: 'p' }],
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
          { text: ' ' },
          { text: 'llo' },
        ],
        type: 'p',
      });
    });

    it('installs plugin node selection flags through OverridePlugin', () => {
      const NonSelectableVoidPlugin = createBasePlugin({
        key: 'badge',
        node: {
          isElement: true,
          isMarkableVoid: true,
          isSelectable: false,
          isVoid: true,
          type: 'badge',
        },
      });
      const editor = extendPlateEditor(createEditor(), {
        plugins: [NonSelectableVoidPlugin],
        value: [{ children: [{ text: '' }], type: 'p' }],
      });
      const badgeElement = { children: [{ text: '' }], type: 'badge' };

      expect(editor.read.schema.isSelectable(badgeElement)).toBe(false);
      expect(editor.read.schema.isVoid(badgeElement)).toBe(true);
      expect(editor.read.schema.markableVoid(badgeElement)).toBe(true);
    });
  });

  describe('when plugins is an array', () => {
    it('add custom plugins to core plugins', () => {
      const customPlugin = createBasePlugin({ key: 'custom' });
      const editor = extendPlateEditor(createEditor(), {
        id: '1',
        override: {
          components: {},
          enabled: {},
        },
        plugins: [customPlugin],
      });

      expect(editor.runtime.pluginList.map((plugin) => plugin.key)).toEqual([
        ...coreKeys,
        'custom',
      ]);
      expect(editor.getPlugin({ key: 'custom' })).toBeDefined();
    });
  });

  describe('when plugins is an empty array', () => {
    it('only have core plugins', () => {
      const editor = extendPlateEditor(createEditor(), {
        id: '1',
        plugins: [],
      });

      expect(editor.runtime.pluginList.map((plugin) => plugin.key)).toEqual(
        coreKeys
      );
    });
  });

  describe('when extending nested plugins', () => {
    it('correctly merge and extend nested plugins', () => {
      const parentPlugin = createBasePlugin({
        key: 'parent',
        node: { type: 'parentOriginal' },
        plugins: [
          createBasePlugin({
            key: 'child',
            node: { type: 'childOriginal' },
          }),
        ],
      });

      const editor = extendPlateEditor(createEditor(), {
        id: '1',
        plugins: [
          parentPlugin
            .extend({
              node: { type: 'parentExtended' },
            })
            .extendPlugin(
              { key: 'child' },
              {
                node: { type: 'childExtended' },
              }
            )
            .extendPlugin(
              { key: 'newChild' },
              {
                node: { type: 'newChildType' },
              }
            ),
        ],
      });

      const parent = editor.getPlugin({ key: 'parent' });
      const child = editor.getPlugin({ key: 'child' });
      const newChild = editor.getPlugin({ key: 'newChild' });

      expect(parent.node.type).toBe('parentExtended');
      expect(child.node.type).toBe('childExtended');
      expect(newChild.node.type).toBe('newChildType');
    });
  });

  describe('when using override', () => {
    it('merge components', () => {
      const HeadingPlugin = createPlatePlugin({ key: 'h1' });
      const customComponent = () => null;

      const editor = extendPlateEditor(createEditor(), {
        id: '1',
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
        id: '1',
        plugins: [HeadingPlugin],
      });

      let h1Plugin = editor.getPlugin(HeadingPlugin);
      expect(h1Plugin.render.node).toBe(originalComponent);

      // Test with high priority override
      editor = extendPlateEditor(createEditor(), {
        id: '1',
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

  describe('when using override.plugins', () => {
    it('override plugin properties', () => {
      const CustomPlugin = createBasePlugin({
        key: 'custom',
        node: { type: 'originalType' },
      });

      const editor = extendPlateEditor(createEditor(), {
        id: '1',
        override: {
          plugins: {
            custom: {
              node: { type: 'overriddenType' },
            },
          },
        },
        plugins: [CustomPlugin],
      });

      const customPlugin = editor.getPlugin({ key: 'custom' });
      expect(customPlugin.node.type).toBe('overriddenType');
    });
  });

  describe('when replacing core plugins', () => {
    it('replace core plugins with custom plugins, maintain order, and add additional plugins', () => {
      const additionalPlugin = createBasePlugin({
        key: 'additional',
        node: { type: 'additional' },
      });

      const editor = extendPlateEditor(createEditor(), {
        id: '1',
        plugins: [ParagraphPlugin, ReactPlugin, additionalPlugin],
      });

      const pluginCache = editor.runtime.pluginList.map((plugin) => plugin.key);
      const pluginTypes = editor.runtime.pluginList.map(
        (plugin) => plugin.node.type
      );

      // Check if ReactPlugin replaced DOMPlugin
      expect(pluginCache).toContain(ReactPlugin.key);
      expect(pluginTypes).toContain(ReactPlugin.node.type);

      // Check if ParagraphPlugin is present
      expect(pluginCache).toContain(ParagraphPlugin.key);
      expect(pluginTypes).toContain(ParagraphPlugin.node.type);

      // Check if additional plugin is added
      expect(pluginCache).toContain('additional');
      expect(pluginTypes).toContain('additional');

      // Check if the order is correct
      const reactIndex = pluginCache.indexOf(ReactPlugin.key);
      const paragraphIndex = pluginCache.indexOf(ParagraphPlugin.key);
      const additionalIndex = pluginCache.indexOf('additional');

      expect(reactIndex).toBeLessThan(paragraphIndex);
      expect(paragraphIndex).toBeLessThan(additionalIndex);

      // Check if other core plugins are still present (e.g., HistoryPlugin)
      expect(pluginCache).toContain('history');

      // Ensure the total number of plugins is correct
      // This number should be the sum of:
      // 1. Number of core plugins
      // 2. Number of replacing plugins (ReactPlugin, ParagraphPlugin)
      // 3. Number of additional plugins (additionalPlugin)
      // Minus the number of replaced plugins (DOMPlugin)
      const expectedPluginCount = editor.runtime.pluginList.length;
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

      const editor = extendPlateEditor(existingEditor, { id: '1' });

      const pluginCache = editor.runtime.pluginList.map((plugin) => plugin.key);
      expect(pluginCache.filter((key) => key === 'dom')).toHaveLength(1);
      expect(pluginCache.filter((key) => key === 'history')).toHaveLength(1);
    });

    it('add missing core plugins', () => {
      const existingEditor = createEditor() as any;
      existingEditor.pluginList = [
        createBasePlugin({ key: 'dom' }),
        createBasePlugin({ key: 'history' }),
      ];

      const editor = extendPlateEditor(existingEditor, { id: '1' });

      const pluginCache = editor.runtime.pluginList.map((plugin) => plugin.key);
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

      const editor = extendPlateEditor(existingEditor, { id: '1' });

      expect(
        editor.runtime.pluginList.map((plugin) => plugin.key)
      ).not.toContain('custom');
    });
  });

  describe('when using override.enabled', () => {
    it('disable specified core plugins', () => {
      const editor = extendPlateEditor(createEditor(), {
        id: '1',
        override: {
          enabled: {
            eventEditor: false,
            history: false,
          },
        },
      });

      const pluginCache = editor.runtime.pluginList.map((plugin) => plugin.key);
      expect(pluginCache).not.toContain('history');
      expect(pluginCache).not.toContain('eventEditor');
      expect(pluginCache).toHaveLength(coreKeys.length - 2);
    });

    it('disable specified custom plugins', () => {
      const customPlugin1 = createBasePlugin({ key: 'custom1' });
      const customPlugin2 = createBasePlugin({ key: 'custom2' });

      const editor = extendPlateEditor(createEditor(), {
        id: '1',
        override: {
          enabled: {
            custom1: false,
          },
        },
        plugins: [customPlugin1, customPlugin2],
      });

      const pluginCache = editor.runtime.pluginList.map((plugin) => plugin.key);
      expect(pluginCache).not.toContain('custom1');
      expect(pluginCache).toContain('custom2');
    });

    it('does not affect plugins not specified in override.enabled', () => {
      const editor = extendPlateEditor(createEditor(), {
        id: '1',
        override: {
          enabled: {
            history: false,
          },
        },
      });

      const pluginCache = editor.runtime.pluginList.map((plugin) => plugin.key);
      coreKeys.forEach((key) => {
        if (key !== 'history') {
          expect(pluginCache).toContain(key);
        }
      });
    });
  });

  it('forwards maxLength to the Plite runtime', () => {
    const editor = createBaseEditor({
      autoSelect: 'end',
      maxLength: 5,
      value: [{ children: [{ text: '' }], type: 'p' }],
    });

    editor.update.text.insert('Hello world');

    expect(editor.read.text.string([])).toBe('Hello');
  });

  it('can disable affinity from base editor options', () => {
    const editor = createBaseEditor({
      affinity: false,
    });

    expect(editor.runtime.pluginList.map((plugin) => plugin.key)).not.toContain(
      AffinityPlugin.key
    );
  });

  it('syncs explicit readOnly into the Plite view state', () => {
    const editor = extendBaseEditor(createEditor(), {
      readOnly: true,
    });

    expect(editor.read.view.isReadOnly()).toBe(true);
  });

  it('preserves existing Plite readOnly state when readOnly is omitted', () => {
    const editor = extendBaseEditor(createEditor({ readOnly: true }));

    expect(editor.read.view.isReadOnly()).toBe(true);
  });

  it('handle value, selection, and autoSelect options correctly', () => {
    const editor = createEditor();
    const value = [{ children: [{ text: 'Hello' }], type: 'paragraph' }];
    const selection = {
      anchor: { offset: 2, path: [0, 0] },
      focus: { offset: 4, path: [0, 0] },
    };

    const result = extendBaseEditor(editor, {
      selection,
      shouldNormalizeEditor: true,
      value,
    });

    expect(result.read.children()).toEqual(value);
    expect(result.read.selection()).toEqual(selection);

    // Test autoSelect start
    const editorWithAutoSelectStart = extendBaseEditor(createEditor(), {
      autoSelect: 'start',
      value,
    });
    const expectedStartSelection = {
      anchor: editorWithAutoSelectStart.read((state) =>
        state.points.start([], { required: true })
      ),
      focus: editorWithAutoSelectStart.read((state) =>
        state.points.start([], { required: true })
      ),
    };
    expect(editorWithAutoSelectStart.read.selection()).toEqual(
      expectedStartSelection
    );

    // Test autoSelect end
    const editorWithAutoSelectEnd = extendBaseEditor(createEditor(), {
      autoSelect: 'end',
      value,
    });
    const expectedEndSelection = {
      anchor: editorWithAutoSelectEnd.read((state) =>
        state.points.end([], { required: true })
      ),
      focus: editorWithAutoSelectEnd.read((state) =>
        state.points.end([], { required: true })
      ),
    };
    expect(editorWithAutoSelectEnd.read.selection()).toEqual(
      expectedEndSelection
    );

    // Test empty children
    const editorWithEmptyChildren = extendBaseEditor(createEditor());
    expect(editorWithEmptyChildren.read.children()).toEqual([
      { children: [{ text: '' }], type: 'p' },
    ]);

    // Test transformInitialValue and normalizeEditor
    const editor2 = extendBaseEditor(createEditor(), {
      shouldNormalizeEditor: true,
      value: [],
    });

    expect(editor2.read.children()).toMatchObject([
      {
        children: [
          {
            text: '',
          },
        ],
        type: 'p',
      },
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
      transformInitialValue: ({ value: initialValue }: { value: Value }) =>
        initialValue.map(wrapCellText) as Value,
    });
    const editor = extendBaseEditor(createEditor(), {
      plugins: [WrapTextPlugin],
      selection: {
        anchor: { offset: 2, path: [0, 1, 0, 0] },
        focus: { offset: 2, path: [0, 0, 1, 0] },
      },
      value: [
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
      anchor: { offset: 2, path: [0, 1, 0, 0, 0] },
      focus: { offset: 2, path: [0, 0, 1, 0, 0] },
    });
  });

  describe('when value is a string', () => {
    it('deserialize HTML string into Plite value', () => {
      const htmlString = '<p>Hello, <b>world!</b></p>';

      const editor = extendBaseEditor(createEditor(), {
        id: '1',
        plugins: [TestBoldPlugin],
        value: htmlString,
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
    it('reuses that id', () => {
      const oldEditor = extendBaseEditor(createEditor());
      oldEditor.id = 'old';
      const editor = extendBaseEditor(oldEditor);
      expect(editor.id).toBe('old');
    });
  });

  describe('when the id option is provided', () => {
    it('uses the provided id', () => {
      const oldEditor = extendBaseEditor(createEditor());
      oldEditor.id = 'old';
      const editor = extendBaseEditor(oldEditor, { id: 'new' });
      expect(editor.id).toBe('new');
    });
  });

  describe('when no id is provided', () => {
    it('use a unique id for each editor', () => {
      const id1 = extendBaseEditor(createEditor()).id;
      const id2 = extendBaseEditor(createEditor()).id;
      expect(id1).toBeTruthy();
      expect(id2).toBeTruthy();
      expect(id1).not.toEqual(id2);
    });
  });
});
