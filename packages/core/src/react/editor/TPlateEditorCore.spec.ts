import { property, createEditor, type Value } from '@platejs/plite';

import { getPlateRuntime } from '../../internal/plugin/compilePlateModel';
import { createBaseEditor } from '../../lib/editor/withPlite';
import { createBasePlugin } from '../../lib/plugin/createBasePlugin';
import { DebugPlugin } from '../../lib/plugins/debug/DebugPlugin';
import { someHtmlElement } from '../../lib/plugins/html/utils/findHtmlElement';
import { createPlatePlugin } from '../plugin/createPlatePlugin';
import { createPlateEditor, extendPlateEditor } from './withPlate';

describe('PlateEditor core package', () => {
  const MyCustomPlugin = createBasePlugin({
    key: 'myCustom',
    api: { myCustomMethod: () => {} },
  });

  const TextFormattingPlugin = createBasePlugin({
    key: 'textFormatting',
    api: {
      bold: () => {},
      italic: () => {},
      underline: () => {},
    },
  });

  const ListPlugin = createBasePlugin({
    key: 'list',
    api: {
      createBulletedList: () => {},
    },
  });

  const TablePlugin = createBasePlugin({
    key: 'table',
    api: {
      addRow: () => {},
      insertTable: () => {},
    },
  });

  const ImagePlugin = createBasePlugin({
    key: 'image',
    api: {
      insertImage: () => {},
      resizeImage: () => {},
    },
  });

  const LinkPlugin = createPlatePlugin({
    key: 'link',
    api: {
      link: {
        getAttributes: () => ({}),
      },
    },
  });

  it('creates base and React editors without identity ceremony', () => {
    const baseEditor = createBaseEditor();
    const editor = createPlateEditor();
    const named = createBaseEditor({
      schema: { id: 'persisted-document', version: 7 },
    });

    expect(baseEditor.read.schema.identity()?.kind).toBe('derived');
    expect(editor.read.schema.identity()?.kind).toBe('derived');
    expect(named.read.schema.identity()).toMatchObject({
      id: 'persisted-document',
      kind: 'named',
      version: 7,
    });
    expect(baseEditor.api.debug.log).toBeInstanceOf(Function);
    expect(editor.api.debug.log).toBeInstanceOf(Function);
  });

  describe('Core Plugins', () => {
    it('exposes DebugPlugin methods on createBaseEditor', () => {
      const editor = createBaseEditor();

      expect(editor.api.debug).toBeDefined();
      expect(editor.api.debug.log).toBeInstanceOf(Function);
      expect(editor.api.debug.error).toBeInstanceOf(Function);
      expect(editor.api.debug.info).toBeInstanceOf(Function);
      expect(editor.api.debug.warn).toBeInstanceOf(Function);
    });

    it('exposes DebugPlugin methods on createPlateEditor', () => {
      const editor = createPlateEditor();

      expect(editor.api.debug).toBeDefined();
      expect(editor.api.debug.log).toBeInstanceOf(Function);
      expect(editor.api.debug.error).toBeInstanceOf(Function);
      expect(editor.api.debug.info).toBeInstanceOf(Function);
      expect(editor.api.debug.warn).toBeInstanceOf(Function);
    });

    it('combines core and custom plugin APIs on base and Plate editors', () => {
      const baseEditor = createBaseEditor({
        plugins: [DebugPlugin, TextFormattingPlugin, ImagePlugin, LinkPlugin],
      });

      expect(baseEditor.api.debug).toBeDefined();
      expect(baseEditor.api.bold).toBeInstanceOf(Function);
      expect(baseEditor.api.insertImage).toBeInstanceOf(Function);

      // @ts-expect-error
      baseEditor.api.createBulletedList;

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

    it('merges overlapping api names on createPlateEditor', () => {
      const OverlappingPlugin = createBasePlugin({
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
    const BoldPlugin = createBasePlugin({
      key: 'bold',
      schema: { mark: property.boolean({ default: false, omitDefault: true }) },
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
      const editor = createPlateEditor<Value, readonly [typeof BoldPlugin]>({
        plugins: [BoldPlugin],
      });

      expect(getPlateRuntime(editor).plugins[BoldPlugin.key]).toBeDefined();
    });
  });
});
