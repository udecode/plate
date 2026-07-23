import {
  createBaseEditor,
  createBasePlugin,
  prepareParserPluginContext,
} from '@platejs/core';
import { ContentSlice, property } from '@platejs/plite';
import { writeHostFragmentData } from '@platejs/plite-dom';
import type { Pluggable, Preset, Settings } from 'unified';

import { MarkdownPlugin } from './MarkdownPlugin';
import { remarkMdx } from './plugins';
import { materializeRemarkPlugins } from './utils/getRemarkPluginsWithoutMdx';

const BoldPlugin = createBasePlugin({
  key: 'bold',
  schema: {
    mark: property.boolean({ default: false, omitDefault: true }),
  },
});

const createDataTransfer = ({
  files = [],
  html = '',
}: {
  files?: File[];
  html?: string;
}) => {
  const dataTransfer = new DataTransfer();

  if (html) dataTransfer.setData('text/html', html);
  files.forEach((file) => {
    dataTransfer.items.add(file);
  });

  return dataTransfer;
};

const createParserContext = (
  editor: ReturnType<typeof createBaseEditor>,
  dataTransfer: DataTransfer,
  data: string,
  format = 'text/plain'
) => {
  const createContext = prepareParserPluginContext(editor, MarkdownPlugin);

  return editor.read((state) => ({
    ...createContext(state),
    data,
    format,
    source: {
      files: dataTransfer.files,
      getData: (type: string) => dataTransfer.getData(type),
      types: [...dataTransfer.types],
    },
  }));
};

describe('MarkdownPlugin', () => {
  it('reads live codec options without changing document schema identity', () => {
    const remarkPlugin = () => undefined;
    const editor = createBaseEditor({
      plugins: [
        MarkdownPlugin.configure({
          options: {
            remarkPlugins: [remarkPlugin],
            remarkStringifyOptions: { bullet: '+' },
          },
        }),
      ],
    });
    const value = [
      {
        children: [{ text: 'Item' }],
        indent: 1,
        listStyleType: 'disc',
        type: 'p',
      },
    ];
    const identity = editor.read.schema.identity();
    const serializeHost = () => {
      const data = new DataTransfer();

      writeHostFragmentData(editor, data, ContentSlice.closed(value));

      return data.getData('text/markdown');
    };

    expect(editor.plugin(MarkdownPlugin).getOptions().remarkPlugins?.[0]).toBe(
      remarkPlugin
    );
    expect(editor.api.markdown.serialize({ value })).toBe('+ Item\n');
    expect(serializeHost()).toBe('+ Item\n');

    editor.plugin(MarkdownPlugin).setOptions({
      remarkStringifyOptions: { bullet: '*' },
    });

    expect(editor.api.markdown.serialize({ value })).toBe('* Item\n');
    expect(serializeHost()).toBe('* Item\n');
    expect(editor.read.schema.identity()).toEqual(identity);
  });

  it('materializes frozen plugin presets only at the unified boundary', () => {
    const remarkPlugin = () => undefined;
    const joins: NonNullable<Settings['join']> = [];
    const nestedPlugins: Pluggable[] = [remarkPlugin];
    const preset: Preset = {
      plugins: nestedPlugins,
      settings: { join: joins },
    };
    const configuredPlugins: Pluggable[] = [preset];
    const editor = createBaseEditor({
      plugins: [
        MarkdownPlugin.configure({
          options: { remarkPlugins: configuredPlugins },
        }),
      ],
    });
    const snapshot = editor.plugin(MarkdownPlugin).getOptions().remarkPlugins!;
    const snapshotPreset = snapshot[0] as {
      readonly plugins: readonly Pluggable[];
      readonly settings: {
        readonly join: readonly unknown[];
      };
    };

    configuredPlugins.push(() => undefined);
    nestedPlugins.push(() => undefined);

    expect(snapshot).toHaveLength(1);
    expect(snapshotPreset.plugins).toHaveLength(1);
    expect(Object.isFrozen(snapshot)).toBe(true);
    expect(Object.isFrozen(snapshotPreset.plugins)).toBe(true);
    expect(Object.isFrozen(snapshotPreset.settings.join)).toBe(true);

    const materialized = materializeRemarkPlugins(snapshot);
    const materializedPreset = materialized[0];

    if (
      !materializedPreset ||
      typeof materializedPreset === 'function' ||
      Array.isArray(materializedPreset)
    ) {
      throw new Error('Expected a materialized remark preset.');
    }

    expect(materialized).not.toBe(snapshot);
    expect(materializedPreset.plugins).not.toBe(snapshotPreset.plugins);
    expect(materializedPreset.settings?.join).not.toBe(
      snapshotPreset.settings.join
    );
    expect(Object.isFrozen(materializedPreset.plugins)).toBe(false);
    expect(Object.isFrozen(materializedPreset.settings?.join)).toBe(false);
    materializedPreset.plugins!.push(() => undefined);
    expect(snapshotPreset.plugins).toHaveLength(1);
    expect(typeof editor.api.markdown.serialize()).toBe('string');
  });

  it('exposes default options, root markdown api, and text parser deserialization', () => {
    const editor = createBaseEditor({
      plugins: [MarkdownPlugin],
    });
    const plugin = editor.getPlugin(MarkdownPlugin);

    expect(editor.plugin(MarkdownPlugin).getOptions()).toMatchObject({
      allowedNodes: null,
      disallowedNodes: null,
      plainMarks: null,
      remarkPlugins: [],
      remarkStringifyOptions: null,
      rules: null,
    });
    expect(typeof editor.api.markdown.deserialize).toBe('function');
    expect(typeof editor.api.markdown.deserializeInline).toBe('function');
    expect(typeof editor.api.markdown.serialize).toBe('function');
    expect(plugin.parser.format).toEqual(['text/plain', 'text/markdown']);
    expect(
      plugin.parser.deserialize?.({
        ...createParserContext(editor, createDataTransfer({}), '**bold**'),
      })
    ).toEqual(editor.api.markdown.deserialize('**bold**'));
  });

  it('skips plain-text parsing when html is present', () => {
    const editor = createBaseEditor({
      plugins: [MarkdownPlugin],
    });

    const query = editor.getPlugin(MarkdownPlugin).parser.query!;

    expect(
      query({
        ...createParserContext(
          editor,
          createDataTransfer({ html: '<p>paste me</p>' }),
          'plain text'
        ),
      })
    ).toBe(false);
  });

  it('passes through URL-only clipboard text so link handling can own it', () => {
    const editor = createBaseEditor({
      plugins: [MarkdownPlugin],
    });

    const query = editor.getPlugin(MarkdownPlugin).parser.query!;

    expect(
      query({
        ...createParserContext(
          editor,
          createDataTransfer({}),
          'https://platejs.org/docs'
        ),
      })
    ).toBe(false);
  });

  it('parses plain text when the clipboard carries files', () => {
    const editor = createBaseEditor({
      plugins: [MarkdownPlugin],
    });

    const query = editor.getPlugin(MarkdownPlugin).parser.query!;

    expect(
      query(
        createParserContext(
          editor,
          createDataTransfer({
            files: [new File([''], 'attachment.txt')],
          }),
          'https://platejs.org/docs'
        )
      )
    ).toBe(true);
  });

  it('parses non-url plain text by default', () => {
    const editor = createBaseEditor({
      plugins: [MarkdownPlugin],
    });

    const query = editor.getPlugin(MarkdownPlugin).parser.query!;

    expect(
      query({
        ...createParserContext(editor, createDataTransfer({}), '**bold**'),
      })
    ).toBe(true);
  });

  it('registers Markdown serialization with the host codec registry', () => {
    const editor = createBaseEditor({
      plugins: [MarkdownPlugin],
    });
    const data = new DataTransfer();
    const fragment = editor.api.markdown.deserialize('**bold**');

    writeHostFragmentData(editor, data, ContentSlice.closed(fragment));

    expect(data.getData('text/markdown')).toBe('**bold**\n');
  });

  it('deserializes partially styled MDX spans into JSON-compatible content', () => {
    const editor = createBaseEditor({
      plugins: [MarkdownPlugin],
    });
    const value = editor.api.markdown.deserialize(
      '<span style="color: #93C47D;">colored</span>',
      { remarkPlugins: [remarkMdx] }
    );

    expect(value).toEqual([
      {
        children: [{ color: '#93C47D', text: 'colored' }],
        type: 'p',
      },
    ]);
    expect(ContentSlice.closed(value).content).toEqual(value);
  });

  it('parses the registered Markdown clipboard format', () => {
    const editor = createBaseEditor({
      plugins: [BoldPlugin, MarkdownPlugin],
      initialValue: [{ children: [{ text: '' }], type: 'p' }],
    });
    const data = new DataTransfer();

    data.setData('text/markdown', '**bold**');

    expect(editor.api.clipboard.insertData(data)).toBe(true);
    expect(editor.read.children()).toEqual(
      editor.api.markdown.deserialize('**bold**')
    );
  });

  it('round-trips a leaf property through the Markdown host codec', () => {
    const value = [{ children: [{ bold: true, text: 'bold' }], type: 'p' }];
    const source = createBaseEditor({
      plugins: [BoldPlugin, MarkdownPlugin],
      initialValue: value,
    });
    const target = createBaseEditor({
      plugins: [BoldPlugin, MarkdownPlugin],
      initialValue: [{ children: [{ text: '' }], type: 'p' }],
    });
    const data = new DataTransfer();

    writeHostFragmentData(source, data, ContentSlice.closed(value));

    expect(target.api.clipboard.insertData(data)).toBe(true);
    expect(target.read.children()).toEqual(value);
  });
});
