import type { Value } from '@udecode/slate';

import {
  type InferPlugins,
  DebugPlugin,
  createSlateEditor,
  createSlatePlugin,
  someHtmlElement,
} from '@udecode/plate-core';
import { createPlateEditor, withPlate } from '@udecode/plate-core/react';
import { LinkPlugin } from '@udecode/plate-link/react';

describe('TPlateEditor core package', () => {
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
      const editor = createSlateEditor();

      expect(editor.api.debug).toBeDefined();
      expect(editor.api.debug.log).toBeInstanceOf(Function);
      expect(editor.api.debug.error).toBeInstanceOf(Function);
      expect(editor.api.debug.info).toBeInstanceOf(Function);
      expect(editor.api.debug.warn).toBeInstanceOf(Function);

      // @ts-expect-error
      editor.api.debug.nonExistentMethod;
    });

    it('should have DebugPlugin methods with default generics', () => {
      const editor = createPlateEditor();

      expect(editor.api.debug).toBeDefined();
      expect(editor.api.debug.log).toBeInstanceOf(Function);
      expect(editor.api.debug.error).toBeInstanceOf(Function);
      expect(editor.api.debug.info).toBeInstanceOf(Function);
      expect(editor.api.debug.warn).toBeInstanceOf(Function);

      // @ts-expect-error
      editor.api.debug.nonExistentMethod;
    });

    it('should work with a mix of core and custom plugins', () => {
      const slateEditor = createSlateEditor({
        plugins: [DebugPlugin, TextFormattingPlugin, ImagePlugin, LinkPlugin],
      });

      expect(slateEditor.api.debug).toBeDefined();
      expect(slateEditor.api.bold).toBeInstanceOf(Function);
      expect(slateEditor.api.insertImage).toBeInstanceOf(Function);

      // @ts-expect-error
      slateEditor.api.createBulletedList;

      const editor = createPlateEditor({
        plugins: [DebugPlugin, TextFormattingPlugin, ImagePlugin, LinkPlugin],
      });

      expect(editor.api.debug).toBeDefined();
      expect(editor.api.bold).toBeInstanceOf(Function);
      expect(editor.api.insertImage).toBeInstanceOf(Function);

      // @ts-expect-error
      editor.api.createBulletedList;
    });

    it('should work extending a plugin', () => {
      const editor = createPlateEditor({
        plugins: [
          LinkPlugin.extend({
            parsers: {
              html: {
                deserializer: {
                  parse: () => ({ test: true }),
                  withoutChildren: true,
                },
              },
            },
          }),
        ],
      });

      expect(editor.api.link.getAttributes).toBeDefined();

      // @ts-expect-error
      editor.api.createBulletedList;
    });
  });

  describe('Custom Plugins', () => {
    it('should infer single and multiple plugin types correctly', () => {
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
      const editor1 = createPlateEditor({
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
