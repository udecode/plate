/* eslint-disable jest/no-conditional-expect */
import { type Value, createTEditor } from '@udecode/slate';

import {
  DOMPlugin,
  DebugPlugin,
  DeserializeAstPlugin,
  DeserializeHtmlPlugin,
  EditorProtocolPlugin,
  EventEditorPlugin,
  HistoryPlugin,
  InlineVoidPlugin,
  InsertDataPlugin,
  LengthPlugin,
  type LengthPluginOptions,
  NodeFactoryPlugin,
  type PlatePlugin,
  PrevSelectionPlugin,
  createPlugin,
  getPlugin,
} from '../../lib';
import { withPlate } from './withPlate';

const coreKeys = [
  'root',
  DOMPlugin.key,
  HistoryPlugin.key,
  DebugPlugin.key,
  NodeFactoryPlugin.key,
  EventEditorPlugin.key,
  InlineVoidPlugin.key,
  InsertDataPlugin.key,
  PrevSelectionPlugin.key,
  LengthPlugin.key,
  DeserializeHtmlPlugin.key,
  DeserializeAstPlugin.key,
  EditorProtocolPlugin.key,
];

describe('withPlate', () => {
  describe('when default plugins', () => {
    it('should have core plugins', () => {
      const editor = withPlate(createTEditor(), { id: '1' });

      expect(editor.id).toBe('1');
      expect(editor.history).toBeDefined();
      expect(editor.key).toBeDefined();
      expect(editor.plugins.map((plugin) => plugin.key)).toEqual(coreKeys);
      expect(editor.plugins.map((plugin) => plugin.type)).toEqual(coreKeys);
      expect(Object.keys(editor.pluginsByKey)).toEqual(coreKeys);
    });
  });

  describe('when plugins is an array', () => {
    it('should add custom plugins to core plugins', () => {
      const customPlugin = createPlugin({ key: 'custom' });
      const editor = withPlate(createTEditor(), {
        id: '1',
        plugins: [customPlugin],
      });

      expect(editor.plugins.map((plugin) => plugin.key)).toEqual([
        ...coreKeys,
        'custom',
      ]);
      expect(getPlugin(editor, 'custom')).toEqual(customPlugin);
    });
  });

  describe('when plugins is an empty array', () => {
    it('should only have core plugins', () => {
      const editor = withPlate<Value, PlatePlugin>(createTEditor(), {
        id: '1',
        plugins: [],
      });

      expect(editor.plugins.map((plugin) => plugin.key)).toEqual(coreKeys);
    });
  });

  describe('when extending nested plugins', () => {
    it('should correctly merge and extend nested plugins', () => {
      const parentPlugin = createPlugin({
        key: 'parent',
        plugins: [
          createPlugin({
            key: 'child',
            type: 'childOriginal',
          }),
        ],
        type: 'parentOriginal',
      });

      const editor = withPlate(createTEditor(), {
        id: '1',
        plugins: [
          parentPlugin
            .extend({
              type: 'parentExtended',
            })
            .extendPlugin('child', {
              type: 'childExtended',
            })
            .extendPlugin('newChild', {
              type: 'newChildType',
            }),
        ],
      });

      const parent = getPlugin(editor, 'parent');
      const child = getPlugin(editor, 'child');
      const newChild = getPlugin(editor, 'newChild');

      expect(parent.type).toBe('parentExtended');
      expect(child.type).toBe('childExtended');
      expect(newChild.type).toBe('newChildType');
    });
  });

  describe('when using override', () => {
    it('should merge components', () => {
      const HeadingPlugin = createPlugin({ key: 'h1' });
      const customComponent = () => null;

      const editor = withPlate(createTEditor(), {
        id: '1',
        override: {
          components: {
            h1: customComponent,
          },
        },
        plugins: [HeadingPlugin],
      });

      const h1Plugin = getPlugin(editor, 'h1');
      expect(h1Plugin.component).toBe(customComponent);
    });

    it('should respect priority when overriding existing components', () => {
      const originalComponent = () => null;
      const overrideComponent = () => null;
      const HeadingPlugin = createPlugin({
        component: originalComponent,
        key: 'h1',
        priority: 100,
      });

      // Test with low priority override
      let editor = withPlate(createTEditor(), {
        id: '1',
        plugins: [HeadingPlugin],
      });

      let h1Plugin = getPlugin(editor, 'h1');
      expect(h1Plugin.component).toBe(originalComponent);

      // Test with high priority override
      editor = withPlate(createTEditor(), {
        id: '1',
        override: {
          components: {
            h1: overrideComponent,
          },
        },
        plugins: [HeadingPlugin],
      });

      h1Plugin = getPlugin(editor, 'h1');
      expect(h1Plugin.component).toBe(overrideComponent);
    });
  });

  describe('when using override.plugins', () => {
    it('should override plugin properties', () => {
      const CustomPlugin = createPlugin({
        key: 'custom',
        type: 'originalType',
      });

      const editor = withPlate(createTEditor(), {
        id: '1',
        override: {
          plugins: {
            custom: {
              type: 'overriddenType',
            },
          },
        },
        plugins: [CustomPlugin],
      });

      const customPlugin = getPlugin(editor, 'custom');
      expect(customPlugin.type).toBe('overriddenType');
    });
  });

  describe('when editor already has plugins', () => {
    it('should not duplicate core plugins', () => {
      const existingEditor = createTEditor();
      existingEditor.plugins = [
        createPlugin({ key: 'dom' }),
        createPlugin({ key: 'history' }),
      ];

      const editor = withPlate(existingEditor, { id: '1' });

      const pluginKeys = editor.plugins.map((plugin) => plugin.key);
      expect(pluginKeys.filter((key) => key === 'dom')).toHaveLength(1);
      expect(pluginKeys.filter((key) => key === 'history')).toHaveLength(1);
    });

    it('should add missing core plugins', () => {
      const existingEditor = createTEditor();
      existingEditor.plugins = [
        createPlugin({ key: 'dom' }),
        createPlugin({ key: 'history' }),
      ];

      const editor = withPlate(existingEditor, { id: '1' });

      const pluginKeys = editor.plugins.map((plugin) => plugin.key);
      coreKeys.forEach((key) => {
        expect(pluginKeys).toContain(key);
      });
    });

    it('should not preserve custom plugins', () => {
      const customPlugin = createPlugin({ key: 'custom' });
      const existingEditor = createTEditor();
      existingEditor.plugins = [
        createPlugin({ key: 'dom' }),
        createPlugin({ key: 'history' }),
        customPlugin,
      ];

      const editor = withPlate(existingEditor, { id: '1' });

      expect(editor.plugins.map((plugin) => plugin.key)).not.toContain(
        'custom'
      );
    });
  });

  describe('when using override.enabled', () => {
    it('should disable specified core plugins', () => {
      const editor = withPlate(createTEditor(), {
        id: '1',
        override: {
          enabled: {
            eventEditor: false,
            history: false,
          },
        },
      });

      const pluginKeys = editor.plugins.map((plugin) => plugin.key);
      expect(pluginKeys).not.toContain('history');
      expect(pluginKeys).not.toContain('eventEditor');
      expect(pluginKeys).toHaveLength(coreKeys.length - 2);
    });

    it('should disable specified custom plugins', () => {
      const customPlugin1 = createPlugin({ key: 'custom1' });
      const customPlugin2 = createPlugin({ key: 'custom2' });

      const editor = withPlate(createTEditor(), {
        id: '1',
        override: {
          enabled: {
            custom1: false,
          },
        },
        plugins: [customPlugin1, customPlugin2],
      });

      const pluginKeys = editor.plugins.map((plugin) => plugin.key);
      expect(pluginKeys).not.toContain('custom1');
      expect(pluginKeys).toContain('custom2');
    });

    it('should not affect plugins not specified in override.enabled', () => {
      const editor = withPlate(createTEditor(), {
        id: '1',
        override: {
          enabled: {
            history: false,
          },
        },
      });

      const pluginKeys = editor.plugins.map((plugin) => plugin.key);
      coreKeys.forEach((key) => {
        if (key !== 'history') {
          expect(pluginKeys).toContain(key);
        }
      });
    });
  });

  describe('when configuring core plugins', () => {
    it('should correctly configure the length plugin', () => {
      const editor = withPlate(createTEditor(), {
        id: '1',
        rootPlugin: (plugin) =>
          plugin.configurePlugin('length', {
            maxLength: 100,
          }),
      });

      const lengthPlugin = getPlugin<LengthPluginOptions>(editor, 'length');
      expect(lengthPlugin.options.maxLength).toBe(100);
    });
  });
});
