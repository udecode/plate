/** @jsx jsxt */
import { createEditor, type Value } from '@platejs/plite';
import { jsxt } from '@platejs/test-utils';

import { createBasePlugin, DOMPlugin } from '../../lib';
import { getPlateRuntime } from '../../internal/plugin/compilePlateModel';
import { ViewPlugin } from '../plugins/ViewPlugin';
import { createStaticEditor } from './withStatic';

jsxt;

describe('extendStaticEditor', () => {
  describe('createStaticEditor', () => {
    it('create an editor with static plugins', () => {
      const editor = createStaticEditor({
        id: '1',
      });

      expect(editor.id).toBe('1');
      expect(getPlateRuntime(editor).plugins).toBeDefined();
      expect(editor.plugin(ViewPlugin).plugin).toBeDefined();
    });

    it('include ViewPlugin in the plugin list', () => {
      const editor = createStaticEditor();

      const pluginNames = getPlateRuntime(editor).pluginList.map(
        (plugin) => plugin.name
      );
      expect(pluginNames).toContain(DOMPlugin.name);
    });

    it('exposes the ViewPlugin fragment API', () => {
      const editor = createStaticEditor();

      // ViewPlugin extends DOMPlugin, so we check the DOM plugin is installed.
      const domPlugin = editor.plugin(DOMPlugin).plugin;
      expect(domPlugin).toBeDefined();

      // The API should be applied through the plugin system.
      expect(editor.api.dom.getSelectedFragment).toBeDefined();
    });
  });

  describe('when plugins are provided', () => {
    it('add custom plugins after static plugins', () => {
      const customPlugin = createBasePlugin({ name: 'custom' });
      const editor = createStaticEditor({
        plugins: [customPlugin],
      });

      const pluginNames = getPlateRuntime(editor).pluginList.map(
        (plugin) => plugin.name
      );
      expect(pluginNames).toContain('custom');
      expect(pluginNames).toContain(DOMPlugin.name);

      // Ensure custom plugin comes after static plugins
      const domIndex = pluginNames.indexOf(DOMPlugin.name);
      const customIndex = pluginNames.indexOf('custom');
      expect(customIndex).toBeGreaterThan(domIndex);
    });

    it('allow multiple custom plugins', () => {
      const plugin1 = createBasePlugin({ name: 'plugin1' });
      const plugin2 = createBasePlugin({ name: 'plugin2' });

      const editor = createStaticEditor({
        plugins: [plugin1, plugin2],
      });

      expect(editor.plugin('plugin1').plugin).toBeDefined();
      expect(editor.plugin('plugin2').plugin).toBeDefined();
    });
  });

  describe('when initialValue is provided', () => {
    it('initializes the editor with the provided value', () => {
      const value = (
        <editor>
          <hp>
            <htext>Hello world</htext>
          </hp>
        </editor>
      );

      const editor = createStaticEditor({
        initialValue: value.children as Value,
      });

      expect(editor.read.children()).toEqual(value.children);
    });
  });

  describe('when selection is provided', () => {
    it('initialize editor with the provided selection', () => {
      const value = (
        <editor>
          <hp>
            <htext>Hello world</htext>
          </hp>
        </editor>
      );

      const selection = {
        kind: 'text' as const,
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 5, path: [0, 0] },
      };

      const editor = createStaticEditor({
        selection,
        initialValue: value.children as Value,
      });

      expect(editor.read.selection()).toEqual(selection);
    });
  });

  describe('when autoSelect is provided', () => {
    it('auto-select start of document', () => {
      const value = (
        <editor>
          <hp>
            <htext>Hello world</htext>
          </hp>
        </editor>
      );

      const editor = createStaticEditor({
        autoSelect: 'start',
        initialValue: value.children as Value,
      });

      const start = editor.read.points.start([]);
      const expectedSelection = {
        kind: 'text',
        anchor: start,
        focus: start,
      };
      expect(editor.read.selection()).toEqual(expectedSelection);
    });

    it('auto-select end of document', () => {
      const value = (
        <editor>
          <hp>
            <htext>Hello world</htext>
          </hp>
        </editor>
      );

      const editor = createStaticEditor({
        autoSelect: 'end',
        initialValue: value.children as Value,
      });

      const end = editor.read.points.end([]);
      const expectedSelection = {
        kind: 'text',
        anchor: end,
        focus: end,
      };
      expect(editor.read.selection()).toEqual(expectedSelection);
    });
  });

  describe('when using an existing editor', () => {
    it('enhances a raw editor with static plugins', () => {
      const existingEditor = createEditor({ id: 'existing' });

      const editor = createStaticEditor({
        editor: existingEditor,
      });

      expect(editor.id).toBe('existing');
      expect(editor.plugin(ViewPlugin).plugin).toBeDefined();
    });

    it('preserves a raw editor id when a new id is provided', () => {
      const existingEditor = createEditor({ id: 'old' });

      const editor = createStaticEditor({
        id: 'new',
        editor: existingEditor,
      });

      expect(editor.id).toBe('old');
    });
  });

  describe('integration with extendBaseEditor', () => {
    it('properly integrate static plugins with core plugins', () => {
      const editor = createStaticEditor();

      // Should have both core plugins from extendBaseEditor and static plugins
      expect(editor.read((state) => state.history())).toBeDefined(); // from HistoryPlugin
      expect(editor.read.view.isReadOnly()).toBe(false); // from Plite view
      expect(editor.plugin(ViewPlugin).plugin).toBeDefined(); // static plugin
    });

    it('maintain plugin order with static plugins first', () => {
      const customPlugin = createBasePlugin({ name: 'custom' });
      const editor = createStaticEditor({
        plugins: [customPlugin],
      });

      const pluginNames = getPlateRuntime(editor).pluginList.map(
        (plugin) => plugin.name
      );

      // ViewPlugin (static) should come before custom plugins
      const viewPluginIndex = pluginNames.findIndex((pluginName) =>
        getPlateRuntime(editor).pluginList.find(
          (plugin) => plugin.name === pluginName && plugin === ViewPlugin
        )
      );
      const customIndex = pluginNames.indexOf('custom');

      if (viewPluginIndex !== -1 && customIndex !== -1) {
        expect(viewPluginIndex).toBeLessThan(customIndex);
      }
    });
  });

  describe('edge cases', () => {
    it('handle empty plugins array', () => {
      const editor = createStaticEditor({
        plugins: [],
      });

      expect(editor.plugin(ViewPlugin).plugin).toBeDefined();
    });

    it('handle undefined options', () => {
      const editor = createStaticEditor();

      expect(editor).toBeDefined();
      expect(editor.plugin(ViewPlugin).plugin).toBeDefined();
    });

    it('create unique ids for different editors', () => {
      const editor1 = createStaticEditor();
      const editor2 = createStaticEditor();

      expect(editor1.id).toBeDefined();
      expect(editor2.id).toBeDefined();
      expect(editor1.id).not.toBe(editor2.id);
    });
  });

  describe('plugin functionality', () => {
    it('has getSelectedFragment API from ViewPlugin', () => {
      const editor = createStaticEditor();

      expect(editor.api.dom.getSelectedFragment).toBeDefined();
      expect(typeof editor.api.dom.getSelectedFragment).toBe('function');
    });

    it('preserves other extendBaseEditor options', () => {
      const editor = createStaticEditor({
        shouldNormalizeEditor: true,
        initialValue: [
          {
            children: [{ text: 'content' }],
            type: 'p',
          },
        ],
      });

      expect(editor.read.children()).toEqual([
        {
          children: [{ text: 'content' }],
          type: 'p',
        },
      ]);
    });
  });
});
