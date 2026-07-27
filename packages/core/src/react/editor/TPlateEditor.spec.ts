import { property, createEditor, type Value } from '@platejs/plite';

import { getPlateRuntime } from '../../internal/plugin/compilePlateModel';
import { createBasePlugin } from '../../lib/plugin/createBasePlugin';
import { DebugPlugin } from '../../lib/plugins/debug/DebugPlugin';
import { someHtmlElement } from '../../lib/plugins/html/htmlDom';
import { createPlateEditor, extendPlateEditor } from './withPlate';

describe('PlateEditor', () => {
  const MyCustomPlugin = createBasePlugin({
    key: 'myCustom',
    extension: { api: { myCustomMethod: () => {} } },
  });

  const TextFormattingPlugin = createBasePlugin({
    key: 'textFormatting',
    extension: {
      api: {
        bold: () => {},
        italic: () => {},
        underline: () => {},
      },
    },
  });

  const ListPlugin = createBasePlugin({
    key: 'list',
    extension: {
      api: {
        createBulletedList: () => {},
      },
    },
  });

  const TablePlugin = createBasePlugin({
    key: 'table',
    extension: {
      api: {
        addRow: () => {},
        insertTable: () => {},
      },
    },
  });

  const ImagePlugin = createBasePlugin({
    key: 'image',
    extension: {
      api: {
        insertImage: () => {},
        resizeImage: () => {},
      },
    },
  });

  describe('Core Plugins', () => {
    it('exposes DebugPlugin methods on createPlateEditor', () => {
      const editor = createPlateEditor();

      expect(editor.plugin(DebugPlugin).api).toBeDefined();
      expect(editor.plugin(DebugPlugin).api.log).toBeInstanceOf(Function);
      expect(editor.plugin(DebugPlugin).api.error).toBeInstanceOf(Function);
      expect(editor.plugin(DebugPlugin).api.info).toBeInstanceOf(Function);
      expect(editor.plugin(DebugPlugin).api.warn).toBeInstanceOf(Function);

      // @ts-expect-error
      editor.plugin(DebugPlugin).api.nonExistentMethod;
    });

    it('combines core and custom plugin APIs with createPlateEditor', () => {
      const editor = createPlateEditor({
        plugins: [DebugPlugin, TextFormattingPlugin, ImagePlugin],
      });

      expect(editor.plugin(DebugPlugin).api).toBeDefined();
      expect(editor.api.bold).toBeInstanceOf(Function);
      expect(editor.api.insertImage).toBeInstanceOf(Function);

      // @ts-expect-error
      editor.api.createBulletedList;
    });
  });

  describe('Custom Plugins', () => {
    it('infers plugin APIs across custom plugin sets', () => {
      const singlePluginEditor = createPlateEditor({
        plugins: [MyCustomPlugin],
      });
      expect(singlePluginEditor.api.myCustomMethod).toBeInstanceOf(Function);

      const multiPluginEditor = createPlateEditor({
        plugins: [TextFormattingPlugin, ListPlugin, TablePlugin],
      });
      expect(multiPluginEditor.api.bold).toBeInstanceOf(Function);
      expect(multiPluginEditor.api.createBulletedList).toBeInstanceOf(Function);
      expect(multiPluginEditor.api.insertTable).toBeInstanceOf(Function);

      // @ts-expect-error
      multiPluginEditor.api.nonExistentMethod;
    });

    it('exposes custom plugin APIs on createPlateEditor', () => {
      const editor = createPlateEditor({
        plugins: [MyCustomPlugin, ListPlugin, ImagePlugin],
      });

      expect(editor.api.myCustomMethod).toBeInstanceOf(Function);
      expect(editor.api.createBulletedList).toBeInstanceOf(Function);
      expect(editor.api.insertImage).toBeInstanceOf(Function);

      // @ts-expect-error
      editor.api.insertTable;
    });

    it('extends a raw editor with all plugins atomically', () => {
      const editor = extendPlateEditor(createEditor(), {
        plugins: [TextFormattingPlugin, ListPlugin, TablePlugin],
      });

      expect(editor.api.bold).toBeInstanceOf(Function);
      expect(editor.api.createBulletedList).toBeInstanceOf(Function);
      expect(editor.api.insertTable).toBeInstanceOf(Function);

      // @ts-expect-error
      editor.api.insertImage;
    });

    it('merges overlapping api names on extendPlateEditor', () => {
      const OverlappingPlugin = createBasePlugin({
        key: 'overlapping',
        extension: {
          api: {
            bold: (_: number) => {},
            insertImage: (_: number) => {},
          },
        },
      });

      const editor = createPlateEditor({
        plugins: [TextFormattingPlugin, OverlappingPlugin, ImagePlugin],
      });

      expect(editor.api.bold).toBeInstanceOf(Function);
      expect(editor.api.italic).toBeInstanceOf(Function);
      expect(editor.api.insertImage).toBeInstanceOf(Function);
      expect(editor.api.resizeImage).toBeInstanceOf(Function);

      // @ts-expect-error
      editor.api.nonExistentMethod;
    });
  });

  describe('Plugin', () => {
    const BoldPlugin = createBasePlugin({
      key: 'bold',
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
      const editor = createPlateEditor<Value, readonly [typeof BoldPlugin]>({
        plugins: [BoldPlugin],
      });

      expect(getPlateRuntime(editor).plugins[BoldPlugin.key]).toBeDefined();
    });
  });
});
