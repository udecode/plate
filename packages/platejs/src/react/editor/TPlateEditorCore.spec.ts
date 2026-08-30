import { property, schema } from 'plitejs';

import { getPlateRuntime } from '../../internal/plugin/compilePlateModel';
import { createEditor as createHeadlessEditor } from '../../lib/editor/withPlite';
import { defineBasePlugin } from '../../lib/plugin/defineBasePlugin';
import { DebugPlugin } from '../../lib/plugins/debug/DebugPlugin';
import { plateDOMExtension } from '../../lib/plugins/dom/plateDOMExtension.internal';
import { someHtmlElement } from '../../lib/plugins/html/htmlDom';
import { definePlatePlugin } from '../plugin/definePlatePlugin';
import { ParagraphPlugin } from '../plugins/paragraph/ParagraphPlugin';
import { getPlateCorePlugins } from './getPlateCorePlugins';
import { createEditor } from './withPlate';

describe('Editor core package', () => {
  const ReactPlugin = getPlateCorePlugins()[1];

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
    const baseEditor = createHeadlessEditor();
    const editor = createEditor();
    const named = createHeadlessEditor({
      schema: { id: 'persisted-document', version: 7 },
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
    expect(Reflect.apply(editor.extension, editor, [ReactPlugin]).api).toBe(
      editor.api.react
    );
  });

  it('keeps the paragraph shortcut valid inside a structural application root', () => {
    const HeadingPlugin = definePlatePlugin('applicationHeading', {
      schema: { element: schema.element.textBlock() },
    });
    const SectionPlugin = definePlatePlugin('applicationSection', {
      schema: {
        element: {
          content: schema.content.elements([HeadingPlugin, ParagraphPlugin], {
            min: 1,
          }),
        },
      },
    });
    const editor = createEditor({
      plugins: [HeadingPlugin, SectionPlugin],
      schema: {
        root: schema.content.element(SectionPlugin, { min: 1 }),
      },
    });

    editor.update.selection.set({ offset: 0, path: [0, 0, 0] });
    getPlateRuntime(editor).shortcuts['paragraph.toggle']?.handler?.({
      editor,
    } as never);

    expect(editor.read.children()).toEqual([
      {
        children: [{ children: [{ text: '' }], type: 'paragraph' }],
        type: 'applicationSection',
      },
    ]);
  });

  describe('Core Plugins', () => {
    it('exposes DebugPlugin methods on createEditor', () => {
      const editor = createHeadlessEditor();

      expect(editor.plugin(DebugPlugin).api).toBeDefined();
      expect(editor.plugin(DebugPlugin).api.log).toBeInstanceOf(Function);
      expect(editor.plugin(DebugPlugin).api.error).toBeInstanceOf(Function);
      expect(editor.plugin(DebugPlugin).api.info).toBeInstanceOf(Function);
      expect(editor.plugin(DebugPlugin).api.warn).toBeInstanceOf(Function);
    });

    it('exposes DebugPlugin methods on createEditor', () => {
      const editor = createEditor();

      expect(editor.plugin(DebugPlugin).api).toBeDefined();
      expect(editor.plugin(DebugPlugin).api.log).toBeInstanceOf(Function);
      expect(editor.plugin(DebugPlugin).api.error).toBeInstanceOf(Function);
      expect(editor.plugin(DebugPlugin).api.info).toBeInstanceOf(Function);
      expect(editor.plugin(DebugPlugin).api.warn).toBeInstanceOf(Function);
    });

    it('combines core and custom plugin APIs on base and Plate editors', () => {
      const baseEditor = createHeadlessEditor({
        plugins: [DebugPlugin, TextFormattingPlugin, ImagePlugin, LinkPlugin],
      });

      expect(baseEditor.plugin(DebugPlugin).api).toBeDefined();
      expect(baseEditor.api.textFormatting.bold).toBeInstanceOf(Function);
      expect(baseEditor.api.image.insertImage).toBeInstanceOf(Function);

      // @ts-expect-error -- unavailable plugin APIs must remain excluded
      baseEditor.api.list;

      const editor = createEditor({
        plugins: [DebugPlugin, TextFormattingPlugin, ImagePlugin, LinkPlugin],
      });

      expect(editor.plugin(DebugPlugin).api).toBeDefined();
      expect(editor.api.textFormatting.bold).toBeInstanceOf(Function);
      expect(editor.api.image.insertImage).toBeInstanceOf(Function);

      // @ts-expect-error -- unavailable plugin APIs must remain excluded
      editor.api.list;
    });

    it('exposes link api after extending a plate plugin', () => {
      const editor = createEditor({
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

      // @ts-expect-error -- unavailable plugin APIs must remain excluded
      editor.api.list;
    });
  });

  describe('Custom Plugins', () => {
    it('infers plugin APIs across custom plugin sets', () => {
      const singlePluginEditor = createEditor({
        plugins: [MyCustomPlugin],
      });
      expect(singlePluginEditor.api.myCustom.myCustomMethod).toBeInstanceOf(
        Function
      );
      const installedPlugin = singlePluginEditor.plugin(MyCustomPlugin);

      // @ts-expect-error installed descriptors do not expose author methods
      installedPlugin.extend;

      const multiPluginEditor = createEditor({
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

    it('exposes custom plugin APIs on createEditor', () => {
      const editor = createEditor({
        plugins: [MyCustomPlugin, ListPlugin, ImagePlugin],
      });

      expect(editor.api.myCustom.myCustomMethod).toBeInstanceOf(Function);
      expect(editor.api.list.createBulletedList).toBeInstanceOf(Function);
      expect(editor.api.image.insertImage).toBeInstanceOf(Function);

      // @ts-expect-error -- unavailable plugin APIs must remain excluded
      editor.api.table;
    });

    it('creates an editor with all plugins atomically', () => {
      const editor = createEditor({
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

      const editor = createEditor({
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

    it('supports specific plugin generics on createEditor', () => {
      const editor = createEditor({
        plugins: [BoldPlugin],
      });

      expect(getPlateRuntime(editor).plugins[BoldPlugin.name]).toBeDefined();
    });
  });
});
