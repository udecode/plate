import type { Value } from '@platejs/slate';

import type { InferPlugins } from '../../lib/editor/SlateEditor';

import { createSlateEditor } from '../../lib/editor/withSlate';
import { createSlatePlugin } from '../../lib/plugin/createSlatePlugin';
import { DebugPlugin } from '../../lib/plugins/debug/DebugPlugin';
import { someHtmlElement } from '../../lib/plugins/html/utils/findHtmlElement';
import { createPlateEditor, withPlate } from './withPlate';
import { LinkPlugin } from '@platejs/link/react';

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
    it('exposes DebugPlugin methods on createSlateEditor', () => {
      const editor = createSlateEditor();

      expect(editor.api.debug).toBeDefined();
      expect(editor.api.debug.log).toBeInstanceOf(Function);
      expect(editor.api.debug.error).toBeInstanceOf(Function);
      expect(editor.api.debug.info).toBeInstanceOf(Function);
      expect(editor.api.debug.warn).toBeInstanceOf(Function);

      // @ts-expect-error
      editor.api.debug.nonExistentMethod;
    });

    it('exposes DebugPlugin methods on createPlateEditor', () => {
      const editor = createPlateEditor();

      expect(editor.api.debug).toBeDefined();
      expect(editor.api.debug.log).toBeInstanceOf(Function);
      expect(editor.api.debug.error).toBeInstanceOf(Function);
      expect(editor.api.debug.info).toBeInstanceOf(Function);
      expect(editor.api.debug.warn).toBeInstanceOf(Function);

      // @ts-expect-error
      editor.api.debug.nonExistentMethod;
    });

    it('combines core and custom plugin APIs on slate and plate editors', () => {
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

    it('exposes link api after extending a plate plugin', () => {
      const editor = createPlateEditor({
        plugins: [
          LinkPlugin.extend({
            parsers: {
              html: {
                deserializer: {
                  withoutChildren: true,
                  parse: () => ({ test: true }),
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

    it('extends a plate editor with additional plugins', () => {
      const plugins = [TextFormattingPlugin, ListPlugin];
      const editor1 = createPlateEditor({
        plugins,
      });

      const editor = withPlate<
        Value,
        InferPlugins<typeof plugins> | typeof TablePlugin
      >(editor1, {
        plugins: [...editor1.meta.pluginList, TablePlugin],
      });

      expect(editor.api.bold).toBeInstanceOf(Function);
      expect(editor.api.createBulletedList).toBeInstanceOf(Function);
      expect(editor.api.insertTable).toBeInstanceOf(Function);

      // @ts-expect-error
      editor.api.insertImage;
    });

    it('merges overlapping api names on createPlateEditor', () => {
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
            rules: [
              { validNodeName: ['STRONG', 'B'] },
              { validStyle: { fontWeight: ['600', '700', 'bold'] } },
            ],
            query: ({ element }) =>
              !someHtmlElement(
                element,
                (node) => node.style.fontWeight === 'normal'
              ),
          },
        },
      },
    });

    it('supports specific plugin generics on createPlateEditor', () => {
      const editor = createPlateEditor<Value, typeof BoldPlugin>({
        plugins: [BoldPlugin],
      });

      expect(editor.plugins[BoldPlugin.key]).toBeDefined();
    });
  });
});
