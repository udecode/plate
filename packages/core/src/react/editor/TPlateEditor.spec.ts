import { type Value, createTEditor } from '@udecode/slate';

import type { InferPlugins } from '../../lib/editor/SlateEditor';

import { createSlatePlugin } from '../../lib/plugin';
import { DebugPlugin, someHtmlElement } from '../../lib/plugins';
import { createPlateEditor, withPlate } from '../index';

describe('TPlateEditor', () => {
  const MyCustomPlugin = createSlatePlugin({
    key: 'myCustom',
    api: { myCustomMethod: () => {} },
  });

  const TextFormattingPlugin = createSlatePlugin({
    key: 'textFormatting',
    api: {
      bold: () => {},
      italic: () => {},
      underline: () => {},
    },
  });

  const ListPlugin = createSlatePlugin({
    key: 'list',
    api: {
      createBulletedList: () => {},
    },
  });

  const TablePlugin = createSlatePlugin({
    key: 'table',
    api: {
      addRow: () => {},
      insertTable: () => {},
    },
  });

  const ImagePlugin = createSlatePlugin({
    key: 'image',
    api: {
      insertImage: () => {},
      resizeImage: () => {},
    },
  });

  describe('Core Plugins', () => {
    it('should have DebugPlugin methods with default generics', () => {
      const editor = withPlate(createTEditor());

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
      const OverlappingPlugin = createSlatePlugin({
        key: 'overlapping',
        api: {
          bold: (_: number) => {},
          insertImage: (_: number) => {},
        },
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
    const BoldPlugin = createSlatePlugin<'bold'>({
      key: 'bold',
      node: { isLeaf: true },
      parsers: {
        html: {
          deserializer: {
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
        },
      },
    });

    it('should work with specific plugin types', () => {
      const editor = createPlateEditor<Value, typeof BoldPlugin>({
        plugins: [BoldPlugin],
      });

      expect(editor.plugins[BoldPlugin.key]).toBeDefined();
    });
  });
});
