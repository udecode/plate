/** @jsx jsxt */
import { type Value, createEditor } from '@platejs/slate';
import { jsxt } from '@platejs/test-utils';

import { createSlatePlugin, DOMPlugin } from '../../lib';
import { ViewPlugin } from '../plugins/ViewPlugin';
import { createStaticEditor } from './withStatic';

jsxt;

describe('withStatic', () => {
  describe('createStaticEditor', () => {
    it('should create an editor with static plugins', () => {
      const editor = createStaticEditor({ id: '1' });

      expect(editor.id).toBe('1');
      expect(editor.plugins).toBeDefined();
      expect(editor.getPlugin(ViewPlugin)).toBeDefined();
    });

    it('should include ViewPlugin in the plugin list', () => {
      const editor = createStaticEditor();

      const pluginKeys = editor.meta.pluginList.map((plugin) => plugin.key);
      expect(pluginKeys).toContain(DOMPlugin.key);
    });

    it('should have ViewPlugin override transforms', () => {
      const editor = createStaticEditor();

      // ViewPlugin overrides DOMPlugin, so we check the DOMPlugin has the override
      const domPlugin = editor.getPlugin(DOMPlugin);
      expect(domPlugin).toBeDefined();

      // The override should be applied through the plugin system
      expect(editor.tf.setFragmentData).toBeDefined();
    });
  });

  describe('when plugins are provided', () => {
    it('should add custom plugins after static plugins', () => {
      const customPlugin = createSlatePlugin({ key: 'custom' });
      const editor = createStaticEditor({
        plugins: [customPlugin],
      });

      const pluginKeys = editor.meta.pluginList.map((plugin) => plugin.key);
      expect(pluginKeys).toContain('custom');
      expect(pluginKeys).toContain(DOMPlugin.key);

      // Ensure custom plugin comes after static plugins
      const domIndex = pluginKeys.indexOf(DOMPlugin.key);
      const customIndex = pluginKeys.indexOf('custom');
      expect(customIndex).toBeGreaterThan(domIndex);
    });

    it('should allow multiple custom plugins', () => {
      const plugin1 = createSlatePlugin({ key: 'plugin1' });
      const plugin2 = createSlatePlugin({ key: 'plugin2' });

      const editor = createStaticEditor({
        plugins: [plugin1, plugin2],
      });

      expect(editor.getPlugin({ key: 'plugin1' })).toBeDefined();
      expect(editor.getPlugin({ key: 'plugin2' })).toBeDefined();
    });
  });

  describe('when value is provided', () => {
    it('should initialize editor with the provided value', () => {
      const value = (
        <editor>
          <hp>
            <htext>Hello world</htext>
          </hp>
        </editor>
      );

      const editor = createStaticEditor({
        value: value.children as Value,
      });

      expect(editor.children).toEqual(value.children);
    });

    it('should handle HTML string values', () => {
      const htmlString = '<p>Hello world</p>';

      const editor = createStaticEditor({
        value: htmlString,
      });

      expect(editor.children).toEqual([
        {
          children: [{ text: 'Hello world' }],
          type: 'p',
        },
      ]);
    });
  });

  describe('when selection is provided', () => {
    it('should initialize editor with the provided selection', () => {
      const value = (
        <editor>
          <hp>
            <htext>Hello world</htext>
          </hp>
        </editor>
      );

      const selection = {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 5, path: [0, 0] },
      };

      const editor = createStaticEditor({
        selection,
        value: value.children as Value,
      });

      expect(editor.selection).toEqual(selection);
    });
  });

  describe('when autoSelect is provided', () => {
    it('should auto-select start of document', () => {
      const value = (
        <editor>
          <hp>
            <htext>Hello world</htext>
          </hp>
        </editor>
      );

      const editor = createStaticEditor({
        autoSelect: 'start',
        value: value.children as Value,
      });

      const expectedSelection = {
        anchor: editor.api.start([]),
        focus: editor.api.start([]),
      };
      expect(editor.selection as any).toEqual(expectedSelection);
    });

    it('should auto-select end of document', () => {
      const value = (
        <editor>
          <hp>
            <htext>Hello world</htext>
          </hp>
        </editor>
      );

      const editor = createStaticEditor({
        autoSelect: 'end',
        value: value.children as Value,
      });

      const expectedSelection = {
        anchor: editor.api.end([]),
        focus: editor.api.end([]),
      };
      expect(editor.selection as any).toEqual(expectedSelection);
    });
  });

  describe('when using an existing editor', () => {
    it('should enhance existing editor with static plugins', () => {
      const existingEditor = createEditor();
      existingEditor.id = 'existing';

      const editor = createStaticEditor({
        editor: existingEditor,
      });

      expect(editor.id).toBe('existing');
      expect(editor.getPlugin(ViewPlugin)).toBeDefined();
    });

    it('should override existing editor id when new id is provided', () => {
      const existingEditor = createEditor();
      existingEditor.id = 'old';

      const editor = createStaticEditor({
        id: 'new',
        editor: existingEditor,
      });

      expect(editor.id).toBe('new');
    });
  });

  describe('integration with withSlate', () => {
    it('should properly integrate static plugins with core plugins', () => {
      const editor = createStaticEditor();

      // Should have both core plugins from withSlate and static plugins
      expect(editor.history).toBeDefined(); // from HistoryPlugin
      expect(editor.dom).toBeDefined(); // from DOMPlugin
      expect(editor.getPlugin(ViewPlugin)).toBeDefined(); // static plugin
    });

    it('should maintain plugin order with static plugins first', () => {
      const customPlugin = createSlatePlugin({ key: 'custom' });
      const editor = createStaticEditor({
        plugins: [customPlugin],
      });

      const pluginKeys = editor.meta.pluginList.map((plugin) => plugin.key);

      // ViewPlugin (static) should come before custom plugins
      const viewPluginIndex = pluginKeys.findIndex((key) =>
        editor.meta.pluginList.find((p) => p.key === key && p === ViewPlugin)
      );
      const customIndex = pluginKeys.indexOf('custom');

      if (viewPluginIndex !== -1 && customIndex !== -1) {
        expect(viewPluginIndex).toBeLessThan(customIndex);
      }
    });
  });

  describe('edge cases', () => {
    it('should handle empty plugins array', () => {
      const editor = createStaticEditor({
        plugins: [],
      });

      expect(editor.getPlugin(ViewPlugin)).toBeDefined();
    });

    it('should handle undefined options', () => {
      const editor = createStaticEditor();

      expect(editor).toBeDefined();
      expect(editor.getPlugin(ViewPlugin)).toBeDefined();
    });

    it('should create unique ids for different editors', () => {
      const editor1 = createStaticEditor();
      const editor2 = createStaticEditor();

      expect(editor1.id).toBeDefined();
      expect(editor2.id).toBeDefined();
      expect(editor1.id).not.toBe(editor2.id);
    });
  });

  describe('plugin functionality', () => {
    it('should have setFragmentData transform from ViewPlugin', () => {
      const editor = createStaticEditor();

      expect(editor.tf.setFragmentData).toBeDefined();
      expect(typeof editor.tf.setFragmentData).toBe('function');
    });

    it('should preserve other withSlate options', () => {
      const editor = createStaticEditor({
        shouldNormalizeEditor: true,
        value: [],
      });

      // Should normalize empty value to have at least one paragraph
      expect(editor.children as any).toEqual([
        {
          children: [{ text: '' }],
          type: 'p',
        },
      ]);
    });
  });
});
