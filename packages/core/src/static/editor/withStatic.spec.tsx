/** @jsx jsxt */
import type { Value } from '@platejs/plite';
import { jsxt } from '@platejs/test-utils';

import { createBasePlugin, DOMPlugin } from '../../lib';
import { createBaseEditor } from '../../lib/editor';
import { ViewPlugin } from '../plugins/ViewPlugin';
import { createStaticEditor } from './withStatic';

jsxt;

describe('extendStaticEditor', () => {
  describe('createStaticEditor', () => {
    it('create an editor with static plugins', () => {
      const editor = createStaticEditor({ id: '1' });

      expect(editor.id).toBe('1');
      expect(editor.plugins).toBeDefined();
      expect(editor.getPlugin(ViewPlugin)).toBeDefined();
    });

    it('include ViewPlugin in the plugin list', () => {
      const editor = createStaticEditor();

      const pluginKeys = editor.runtime.pluginList.map((plugin) => plugin.key);
      expect(pluginKeys).toContain(DOMPlugin.key);
    });

    it('exposes the ViewPlugin fragment API', () => {
      const editor = createStaticEditor();

      // ViewPlugin extends DOMPlugin, so we check the DOM plugin is installed.
      const domPlugin = editor.getPlugin(DOMPlugin);
      expect(domPlugin).toBeDefined();

      // The API should be applied through the plugin system.
      expect(editor.api.getFragment).toBeDefined();
    });
  });

  describe('when plugins are provided', () => {
    it('add custom plugins after static plugins', () => {
      const customPlugin = createBasePlugin({ key: 'custom' });
      const editor = createStaticEditor({
        plugins: [customPlugin],
      });

      const pluginKeys = editor.runtime.pluginList.map((plugin) => plugin.key);
      expect(pluginKeys).toContain('custom');
      expect(pluginKeys).toContain(DOMPlugin.key);

      // Ensure custom plugin comes after static plugins
      const domIndex = pluginKeys.indexOf(DOMPlugin.key);
      const customIndex = pluginKeys.indexOf('custom');
      expect(customIndex).toBeGreaterThan(domIndex);
    });

    it('allow multiple custom plugins', () => {
      const plugin1 = createBasePlugin({ key: 'plugin1' });
      const plugin2 = createBasePlugin({ key: 'plugin2' });

      const editor = createStaticEditor({
        plugins: [plugin1, plugin2],
      });

      expect(editor.getPlugin({ key: 'plugin1' })).toBeDefined();
      expect(editor.getPlugin({ key: 'plugin2' })).toBeDefined();
    });
  });

  describe('when value is provided', () => {
    it('initialize editor with the provided value', () => {
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

      expect(editor.read.children()).toEqual(value.children);
    });

    it('handle HTML string values', () => {
      const htmlString = '<p>Hello world</p>';

      const editor = createStaticEditor({
        value: htmlString,
      });

      expect(editor.read.children()).toEqual([
        {
          children: [{ text: 'Hello world' }],
          type: 'p',
        },
      ]);
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
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 5, path: [0, 0] },
      };

      const editor = createStaticEditor({
        selection,
        value: value.children as Value,
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
        value: value.children as Value,
      });

      const start = editor.read.points.start([]);
      const expectedSelection = {
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
        value: value.children as Value,
      });

      const end = editor.read.points.end([]);
      const expectedSelection = {
        anchor: end,
        focus: end,
      };
      expect(editor.read.selection()).toEqual(expectedSelection);
    });
  });

  describe('when using an existing editor', () => {
    it('enhance existing editor with static plugins', () => {
      const existingEditor = createBaseEditor();
      existingEditor.id = 'existing';

      const editor = createStaticEditor({
        editor: existingEditor,
      });

      expect(editor.id).toBe('existing');
      expect(editor.getPlugin(ViewPlugin)).toBeDefined();
    });

    it('preserves existing editor id when new id is provided', () => {
      const existingEditor = createBaseEditor();
      existingEditor.id = 'old';

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
      expect(editor.getPlugin(ViewPlugin)).toBeDefined(); // static plugin
    });

    it('maintain plugin order with static plugins first', () => {
      const customPlugin = createBasePlugin({ key: 'custom' });
      const editor = createStaticEditor({
        plugins: [customPlugin],
      });

      const pluginKeys = editor.runtime.pluginList.map((plugin) => plugin.key);

      // ViewPlugin (static) should come before custom plugins
      const viewPluginIndex = pluginKeys.findIndex((key) =>
        editor.runtime.pluginList.find((p) => p.key === key && p === ViewPlugin)
      );
      const customIndex = pluginKeys.indexOf('custom');

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

      expect(editor.getPlugin(ViewPlugin)).toBeDefined();
    });

    it('handle undefined options', () => {
      const editor = createStaticEditor();

      expect(editor).toBeDefined();
      expect(editor.getPlugin(ViewPlugin)).toBeDefined();
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
    it('has getFragment API from ViewPlugin', () => {
      const editor = createStaticEditor();

      expect(editor.api.getFragment).toBeDefined();
      expect(typeof editor.api.getFragment).toBe('function');
    });

    it('preserve other extendBaseEditor options', () => {
      const editor = createStaticEditor({
        shouldNormalizeEditor: true,
        value: [],
      });

      // Should normalize empty value to have at least one paragraph
      expect(editor.read.children()).toEqual([
        {
          children: [{ text: '' }],
          type: 'p',
        },
      ]);
    });

    it('preserves static _memo metadata during normalization', () => {
      const editor = createStaticEditor({
        shouldNormalizeEditor: true,
        value: [
          {
            _memo: 'static-element',
            children: [{ text: 'body' }],
            type: 'p',
          },
        ],
      });

      expect(editor.read.children()).toEqual([
        {
          _memo: 'static-element',
          children: [{ text: 'body' }],
          type: 'p',
        },
      ]);
    });
  });
});
