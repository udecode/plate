import { schema } from '../../core';
import { getPlateRuntime } from '../../internal/plugin/compilePlateModel';
import { createEditor as createHeadlessEditor } from '../../lib/editor/withPlite';
import { definePlugin as defineHeadlessPlugin } from '../../lib/plugin/definePlugin';
import { DebugPlugin } from '../../lib/plugins/debug/DebugPlugin';
import { plateDOMPlugin } from '../../lib/plugins/dom/plateDOMPlugin.internal';
import { definePlugin } from '../plugin/definePlugin';
import { ParagraphPlugin } from '../plugins/paragraph/ParagraphPlugin';
import { getPlateCorePlugins } from './getPlateCorePlugins.internal';
import { createEditor } from './withPlate';

describe('Editor core package', () => {
  const ReactPlugin = getPlateCorePlugins()[1];

  const MyCustomPlugin = defineHeadlessPlugin('myCustom', {
    api: () => ({ myCustomMethod: () => {} }),
  });

  const TextFormattingPlugin = defineHeadlessPlugin('textFormatting', {
    api: () => ({
      bold: () => {},
      italic: () => {},
      underline: () => {},
    }),
  });

  const ListPlugin = defineHeadlessPlugin('list', {
    api: () => ({
      createBulletedList: () => {},
    }),
  });

  const TablePlugin = defineHeadlessPlugin('table', {
    api: () => ({
      addRow: () => {},
      insertTable: () => {},
    }),
  });

  const ImagePlugin = defineHeadlessPlugin('image', {
    api: () => ({
      insertImage: () => {},
      resizeImage: () => {},
    }),
  });

  const LinkPlugin = definePlugin('link', {
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
    expect(Reflect.apply(editor.plugin, editor, [plateDOMPlugin]).api).toBe(
      editor.api.dom
    );
    expect(Reflect.apply(editor.plugin, editor, [ReactPlugin]).api).toBe(
      editor.api.react
    );
  });

  it('keeps the paragraph shortcut valid inside a structural application root', () => {
    const HeadingPlugin = definePlugin('applicationHeading', {
      schema: { element: schema.element.textBlock() },
    });
    const SectionPlugin = definePlugin('applicationSection', {
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
  });
});
