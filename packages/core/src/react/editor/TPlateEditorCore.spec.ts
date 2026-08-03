import { property, createEditor } from '@platejs/plite';
import { createReactEditor } from '@platejs/plite-react';

import { getPlateRuntime } from '../../internal/plugin/compilePlateModel';
import {
  plateDOMExtension,
  plateReactExtension,
} from '../../internal/plugin/plateNativeExtensions';
import { createBaseEditor } from '../../lib/editor/withPlite';
import { defineBasePlugin } from '../../lib/plugin/defineBasePlugin';
import { DebugPlugin } from '../../lib/plugins/debug/DebugPlugin';
import { someHtmlElement } from '../../lib/plugins/html/htmlDom';
import { definePlatePlugin } from '../plugin/definePlatePlugin';
import { createPlateEditor } from './withPlate';

describe('PlateEditor core package', () => {
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

  const LinkPlugin = definePlatePlugin('link', {
    api: () => ({
      getAttributes: () => ({}),
    }),
  });

  it('creates base and React editors without identity ceremony', () => {
    const baseEditor = createBaseEditor();
    const editor = createPlateEditor();
    const named = createBaseEditor({
      schemaIdentity: { id: 'persisted-document', version: 7 },
    });

    expect(baseEditor.read.schema.identity()?.kind).toBe('derived');
    expect(editor.read.schema.identity()?.kind).toBe('derived');
    expect(named.read.schema.identity()).toMatchObject({
      id: 'persisted-document',
      kind: 'named',
      version: 7,
    });
    expect(baseEditor.plugin(DebugPlugin).api.log).toBeInstanceOf(Function);
    expect(editor.plugin(DebugPlugin).api.log).toBeInstanceOf(Function);
    expect(
      Reflect.apply(editor.extension, editor, [plateDOMExtension]).api
    ).toBe(editor.api.dom);
    expect(
      Reflect.apply(editor.extension, editor, [plateReactExtension]).api
    ).toBe(editor.api.react);
  });

  it('reconfigures an existing React editor onto the canonical Plate graph', () => {
    const editor = createPlateEditor({ editor: createReactEditor() });

    expect(editor.api.dom.focus).toBeInstanceOf(Function);
    expect(editor.api.react.refreshDecorations).toBeInstanceOf(Function);
    expect(
      Reflect.apply(editor.extension, editor, [plateDOMExtension]).api
    ).toBe(editor.api.dom);
    expect(
      Reflect.apply(editor.extension, editor, [plateReactExtension]).api
    ).toBe(editor.api.react);
  });

  describe('Core Plugins', () => {
    it('exposes DebugPlugin methods on createBaseEditor', () => {
      const editor = createBaseEditor();

      expect(editor.plugin(DebugPlugin).api).toBeDefined();
      expect(editor.plugin(DebugPlugin).api.log).toBeInstanceOf(Function);
      expect(editor.plugin(DebugPlugin).api.error).toBeInstanceOf(Function);
      expect(editor.plugin(DebugPlugin).api.info).toBeInstanceOf(Function);
      expect(editor.plugin(DebugPlugin).api.warn).toBeInstanceOf(Function);
    });

    it('exposes DebugPlugin methods on createPlateEditor', () => {
      const editor = createPlateEditor();

      expect(editor.plugin(DebugPlugin).api).toBeDefined();
      expect(editor.plugin(DebugPlugin).api.log).toBeInstanceOf(Function);
      expect(editor.plugin(DebugPlugin).api.error).toBeInstanceOf(Function);
      expect(editor.plugin(DebugPlugin).api.info).toBeInstanceOf(Function);
      expect(editor.plugin(DebugPlugin).api.warn).toBeInstanceOf(Function);
    });

    it('combines core and custom plugin APIs on base and Plate editors', () => {
      const baseEditor = createBaseEditor({
        plugins: [DebugPlugin, TextFormattingPlugin, ImagePlugin, LinkPlugin],
      });

      expect(baseEditor.plugin(DebugPlugin).api).toBeDefined();
      expect(baseEditor.api.textFormatting.bold).toBeInstanceOf(Function);
      expect(baseEditor.api.image.insertImage).toBeInstanceOf(Function);

      // @ts-expect-error
      baseEditor.api.list;

      const editor = createPlateEditor({
        plugins: [DebugPlugin, TextFormattingPlugin, ImagePlugin, LinkPlugin],
      });

      expect(editor.plugin(DebugPlugin).api).toBeDefined();
      expect(editor.api.textFormatting.bold).toBeInstanceOf(Function);
      expect(editor.api.image.insertImage).toBeInstanceOf(Function);

      // @ts-expect-error
      editor.api.list;
    });

    it('exposes link api after extending a plate plugin', () => {
      const editor = createPlateEditor({
        plugins: [
          LinkPlugin.extend(({ defineCodecs }) => ({
            codecs: defineCodecs({
              'text/html': {
                query: () => true,
              },
            }),
          })),
        ],
      });

      expect(editor.plugin(LinkPlugin).api.getAttributes).toBeDefined();

      // @ts-expect-error
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
      const installedPlugin = singlePluginEditor.plugin(MyCustomPlugin);

      // @ts-expect-error installed descriptors do not expose author methods
      installedPlugin.extend;

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

      // @ts-expect-error
      multiPluginEditor.api.nonExistentMethod;
    });

    it('exposes custom plugin APIs on createPlateEditor', () => {
      const editor = createPlateEditor({
        plugins: [MyCustomPlugin, ListPlugin, ImagePlugin],
      });

      expect(editor.api.myCustom.myCustomMethod).toBeInstanceOf(Function);
      expect(editor.api.list.createBulletedList).toBeInstanceOf(Function);
      expect(editor.api.image.insertImage).toBeInstanceOf(Function);

      // @ts-expect-error
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

      // @ts-expect-error
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

      // @ts-expect-error
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
