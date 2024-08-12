import {
  DebugPlugin,
  type InferPlugins,
  type TPlateEditor,
  type ToggleMarkPluginOptions,
  createPlugin,
  someHtmlElement,
} from '@udecode/plate-core';
import { createPlateEditor, withPlate } from '@udecode/plate-core/react';
import { type Value, createTEditor } from '@udecode/slate';

describe('TPlateEditor core package', () => {
  const MyCustomPlugin = createPlugin({
    api: { myCustomMethod: () => {} },
    key: 'myCustom',
  });

  const TextFormattingPlugin = createPlugin({
    api: {
      bold: () => {},
      italic: () => {},
      underline: () => {},
    },
    key: 'textFormatting',
  });

  const ListPlugin = createPlugin({
    api: {
      createBulletedList: () => {},
    },
    key: 'list',
  });

  const TablePlugin = createPlugin({
    api: {
      addRow: () => {},
      insertTable: () => {},
    },
    key: 'table',
  });

  const ImagePlugin = createPlugin({
    api: {
      insertImage: () => {},
      resizeImage: () => {},
    },
    key: 'image',
  });

  describe('Core Plugins', () => {
    it('should have DebugPlugin methods with default generics', () => {
      const editor: TPlateEditor = withPlate(createTEditor());

      expect(editor.api.debug).toBeDefined();
      expect(editor.api.debug.log).toBeInstanceOf(Function);
      expect(editor.api.debug.error).toBeInstanceOf(Function);
      expect(editor.api.debug.info).toBeInstanceOf(Function);
      expect(editor.api.debug.warn).toBeInstanceOf(Function);

      // @ts-expect-error
      editor.api.debug.nonExistentMethod;
    });

    it('should work with a mix of core and custom plugins', () => {
      const editor = withPlate(createTEditor(), {
        plugins: [DebugPlugin, TextFormattingPlugin, ImagePlugin],
      });

      expect(editor.api.debug).toBeDefined();
      expect(editor.api.bold).toBeInstanceOf(Function);
      expect(editor.api.insertImage).toBeInstanceOf(Function);

      // @ts-expect-error
      editor.api.createBulletedList;
    });
  });

  describe('Custom Plugins', () => {
    it('should infer single and multiple plugin types correctly', () => {
      const singlePluginEditor = withPlate(createTEditor(), {
        plugins: [MyCustomPlugin],
      });
      expect(singlePluginEditor.api.myCustomMethod).toBeInstanceOf(Function);

      const multiPluginEditor = withPlate(createTEditor(), {
        plugins: [TextFormattingPlugin, ListPlugin, TablePlugin],
      });
      expect(multiPluginEditor.api.bold).toBeInstanceOf(Function);
      expect(multiPluginEditor.api.createBulletedList).toBeInstanceOf(Function);
      expect(multiPluginEditor.api.insertTable).toBeInstanceOf(Function);

      // @ts-expect-error
      multiPluginEditor.api.nonExistentMethod;
    });

    it('should work with createPlateEditor', () => {
      const editor = createPlateEditor({
        plugins: [MyCustomPlugin, ListPlugin, ImagePlugin],
      });

      expect(editor.api.myCustomMethod).toBeInstanceOf(Function);
      expect(editor.api.createBulletedList).toBeInstanceOf(Function);
      expect(editor.api.insertImage).toBeInstanceOf(Function);

      // @ts-expect-error
      editor.api.insertTable;
    });

    it('should allow extending editor with new plugins', () => {
      const plugins = [TextFormattingPlugin, ListPlugin];
      const editor1 = withPlate(createTEditor(), {
        plugins,
      });

      const editor = withPlate<
        Value,
        InferPlugins<typeof plugins> | typeof TablePlugin
      >(editor1, {
        plugins: [...editor1.pluginList, TablePlugin],
      });

      expect(editor.api.bold).toBeInstanceOf(Function);
      expect(editor.api.createBulletedList).toBeInstanceOf(Function);
      expect(editor.api.insertTable).toBeInstanceOf(Function);

      // @ts-expect-error
      editor.api.insertImage;
    });

    it('should handle plugins with overlapping api names', () => {
      const OverlappingPlugin = createPlugin({
        api: {
          bold: (_: number) => {},
          insertImage: (_: number) => {},
        },
        key: 'overlapping',
      });

      const editor = withPlate(createTEditor(), {
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
    const BoldPlugin = createPlugin<'bold', ToggleMarkPluginOptions>({
      deserializeHtml: {
        query: ({ element }) =>
          !someHtmlElement(
            element,
            (node) => node.style.fontWeight === 'normal'
          ),
        rules: [
          { validNodeName: ['STRONG', 'B'] },
          { validStyle: { fontWeight: ['600', '700', 'bold'] } },
        ],
      },
      isLeaf: true,
      key: 'bold',
      options: { hotkey: 'mod+b' },
    });

    it('should work with specific plugin types', () => {
      const editor = createPlateEditor<Value, typeof BoldPlugin>({
        plugins: [BoldPlugin],
      });

      expect(editor.plugins[BoldPlugin.key]).toBeDefined();
    });
  });
});
