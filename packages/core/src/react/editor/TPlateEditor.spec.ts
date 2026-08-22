import { property, createEditor } from '@platejs/plite';

import { getPlateRuntime } from '../../internal/plugin/compilePlateModel';
import { defineBasePlugin } from '../../lib/plugin/defineBasePlugin';
import { DebugPlugin } from '../../lib/plugins/debug/DebugPlugin';
import { someHtmlElement } from '../../lib/plugins/html/htmlDom';
import { createPlateEditor } from './withPlate';

describe('PlateEditor', () => {
  const MyCustomPlugin = defineBasePlugin('myCustom', {
    api: () => ({ myCustomMethod: () => {} }),
  });

  const TextFormattingPlugin = defineBasePlugin('textFormatting', {
    api: () => ({
      bold: () => {},
      italic: () => {},
      underline: () => {},
    }),
  });

  const ListPlugin = defineBasePlugin('list', {
    api: () => ({
      createBulletedList: () => {},
    }),
  });

  const TablePlugin = defineBasePlugin('table', {
    api: () => ({
      addRow: () => {},
      insertTable: () => {},
    }),
  });

  const ImagePlugin = defineBasePlugin('image', {
    api: () => ({
      insertImage: () => {},
      resizeImage: () => {},
    }),
  });

  describe('Core Plugins', () => {
    it('exposes DebugPlugin methods on createPlateEditor', () => {
      const editor = createPlateEditor();

      expect(editor.plugin(DebugPlugin).api).toBeDefined();
      expect(editor.plugin(DebugPlugin).api.log).toBeInstanceOf(Function);
      expect(editor.plugin(DebugPlugin).api.error).toBeInstanceOf(Function);
      expect(editor.plugin(DebugPlugin).api.info).toBeInstanceOf(Function);
      expect(editor.plugin(DebugPlugin).api.warn).toBeInstanceOf(Function);

      // @ts-expect-error -- unavailable plugin APIs must remain excluded
      editor.plugin(DebugPlugin).api.nonExistentMethod;
    });

    it('combines core and custom plugin APIs with createPlateEditor', () => {
      const editor = createPlateEditor({
        plugins: [DebugPlugin, TextFormattingPlugin, ImagePlugin],
      });

      expect(editor.plugin(DebugPlugin).api).toBeDefined();
      expect(editor.api.textFormatting.bold).toBeInstanceOf(Function);
      expect(editor.api.image.insertImage).toBeInstanceOf(Function);

      // @ts-expect-error -- unavailable plugin APIs must remain excluded
      editor.api.list;
    });
  });

  describe('Custom Plugins', () => {
    it('infers plugin APIs across custom plugin sets', () => {
      const singlePluginEditor = createPlateEditor({
        plugins: [MyCustomPlugin],
      });
      expect(singlePluginEditor.api.myCustom.myCustomMethod).toBeInstanceOf(
        Function
      );

      const multiPluginEditor = createPlateEditor({
        plugins: [TextFormattingPlugin, ListPlugin, TablePlugin],
      });
      expect(multiPluginEditor.api.textFormatting.bold).toBeInstanceOf(
        Function
      );
      expect(multiPluginEditor.api.list.createBulletedList).toBeInstanceOf(
        Function
      );
      expect(multiPluginEditor.api.table.insertTable).toBeInstanceOf(Function);

      // @ts-expect-error -- unavailable plugin APIs must remain excluded
      multiPluginEditor.api.nonExistentMethod;
    });

    it('exposes custom plugin APIs on createPlateEditor', () => {
      const editor = createPlateEditor({
        plugins: [MyCustomPlugin, ListPlugin, ImagePlugin],
      });

      expect(editor.api.myCustom.myCustomMethod).toBeInstanceOf(Function);
      expect(editor.api.list.createBulletedList).toBeInstanceOf(Function);
      expect(editor.api.image.insertImage).toBeInstanceOf(Function);

      // @ts-expect-error -- unavailable plugin APIs must remain excluded
      editor.api.table;
    });

    it('extends a raw editor with all plugins atomically', () => {
      const editor = createPlateEditor({
        editor: createEditor(),
        plugins: [TextFormattingPlugin, ListPlugin, TablePlugin],
      });

      expect(editor.api.textFormatting.bold).toBeInstanceOf(Function);
      expect(editor.api.list.createBulletedList).toBeInstanceOf(Function);
      expect(editor.api.table.insertTable).toBeInstanceOf(Function);

      // @ts-expect-error -- unavailable plugin APIs must remain excluded
      editor.api.image;
    });

    it('isolates overlapping API names by plugin namespace', () => {
      const OverlappingPlugin = defineBasePlugin('overlapping', {
        api: () => ({
          bold: (_: number) => {},
          insertImage: (_: number) => {},
        }),
      });

      const editor = createPlateEditor({
        plugins: [TextFormattingPlugin, OverlappingPlugin, ImagePlugin],
      });

      expect(editor.api.textFormatting.bold).toBeInstanceOf(Function);
      expect(editor.api.textFormatting.italic).toBeInstanceOf(Function);
      expect(editor.api.image.insertImage).toBeInstanceOf(Function);
      expect(editor.api.image.resizeImage).toBeInstanceOf(Function);
      expect(editor.api.overlapping.bold).toBeInstanceOf(Function);
      expect(editor.api.overlapping.insertImage).toBeInstanceOf(Function);

      // @ts-expect-error -- unavailable plugin APIs must remain excluded
      editor.api.nonExistentMethod;
    });
  });

  describe('Plugin', () => {
    const BoldPlugin = defineBasePlugin('bold', {
      schema: { mark: property.boolean({ default: false, omitDefault: true }) },
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'text/html': {
            decode: ({ element }) =>
              someHtmlElement(
                element,
                (node) => node.style.fontWeight === 'normal'
              )
                ? undefined
                : true,
            encode: ({ value }) => (value ? { tag: 'strong' } : null),
            match: [
              { tag: ['strong', 'b'] },
              { style: { fontWeight: ['600', '700', 'bold'] } },
            ],
          },
        }),
    });

    it('supports specific plugin generics on createPlateEditor', () => {
      const editor = createPlateEditor({
        plugins: [BoldPlugin],
      });

      expect(getPlateRuntime(editor).plugins[BoldPlugin.name]).toBeDefined();
    });
  });
});
