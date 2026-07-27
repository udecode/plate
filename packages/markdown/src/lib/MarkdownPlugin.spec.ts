import { createBaseEditor, createBasePlugin } from '@platejs/core';
import { ContentSlice, property } from '@platejs/plite';
import { writeHostFragmentData } from '@platejs/plite-dom';
import type { Pluggable, Preset, Settings } from 'unified';

import { MarkdownPlugin } from './MarkdownPlugin';
import { createTestEditor } from './__tests__/createTestEditor';
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
  text = '',
}: {
  files?: File[];
  html?: string;
  text?: string;
}) => {
  const dataTransfer = new DataTransfer();

  if (html) dataTransfer.setData('text/html', html);
  if (text) dataTransfer.setData('text/plain', text);
  files.forEach((file) => {
    dataTransfer.items.add(file);
  });

  return dataTransfer;
};

describe('MarkdownPlugin', () => {
  it('reads live codec options without changing document schema identity', () => {
    const remarkPlugin = () => undefined;
    const editor = createBaseEditor({
      plugins: [
        MarkdownPlugin.configure({
          initialState: {
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

    expect(editor.plugin(MarkdownPlugin).store.get().remarkPlugins?.[0]).toBe(
      remarkPlugin
    );
    expect(editor.read.markdown.serialize({ value: { children: value } })).toBe(
      '+ Item\n'
    );
    expect(serializeHost()).toBe('+ Item\n');

    editor.plugin(MarkdownPlugin).store.set({
      remarkStringifyOptions: { bullet: '*' },
    });

    expect(editor.read.markdown.serialize({ value: { children: value } })).toBe(
      '* Item\n'
    );
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
          initialState: { remarkPlugins: configuredPlugins },
        }),
      ],
    });
    const snapshot = editor.plugin(MarkdownPlugin).store.get().remarkPlugins!;
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
    expect(typeof editor.read.markdown.serialize()).toBe('string');
  });

  it('exposes default options, root markdown api, and codec deserialization', () => {
    const editor = createBaseEditor({
      plugins: [MarkdownPlugin],
    });
    const plugin = editor.getPlugin(MarkdownPlugin);

    expect(editor.plugin(MarkdownPlugin).store.get()).toMatchObject({
      allowedNodes: null,
      disallowedNodes: null,
      plainMarks: null,
      remarkPlugins: [],
      remarkStringifyOptions: null,
      rules: null,
    });
    expect(typeof editor.api.markdown.deserialize).toBe('function');
    expect(typeof editor.api.markdown.deserializeInline).toBe('function');
    expect(typeof editor.api.markdown.serializeInline).toBe('function');
    expect(typeof editor.read.markdown.serialize).toBe('function');
    expect('parser' in plugin).toBe(false);
    expect(editor.api.markdown.deserialize('**bold**')).toEqual({
      children: [
        {
          children: [{ bold: true, text: 'bold' }],
          type: 'p',
        },
      ],
    });
  });

  it('skips plain-text parsing when html is present', () => {
    const editor = createBaseEditor({
      plugins: [MarkdownPlugin],
    });

    expect(
      editor.api.clipboard.insertData(
        createDataTransfer({
          html: '<p>paste me</p>',
          text: '**plain text**',
        })
      )
    ).toBe(true);
    expect(editor.read.children()).toEqual([
      { children: [{ text: 'paste me' }], type: 'p' },
    ]);
  });

  it('passes through URL-only clipboard text so link handling can own it', () => {
    const editor = createBaseEditor({
      plugins: [MarkdownPlugin],
    });

    expect(
      editor.api.clipboard.insertData(
        createDataTransfer({ text: 'https://platejs.org/docs' })
      )
    ).toBe(true);
    expect(editor.read.children()).toEqual([
      { children: [{ text: 'https://platejs.org/docs' }], type: 'p' },
    ]);
  });

  it('parses plain text when the clipboard carries files', () => {
    const editor = createBaseEditor({
      plugins: [MarkdownPlugin],
    });

    expect(
      editor.api.clipboard.insertData(
        createDataTransfer({
          files: [new File([''], 'attachment.txt')],
          text: 'https://platejs.org/docs',
        })
      )
    ).toBe(true);
    expect(editor.read.children()).toEqual([
      { children: [{ text: 'https://platejs.org/docs' }], type: 'p' },
    ]);
  });

  it('parses non-url plain text by default', () => {
    const editor = createBaseEditor({
      plugins: [BoldPlugin, MarkdownPlugin],
    });

    expect(
      editor.api.clipboard.insertData(createDataTransfer({ text: '**bold**' }))
    ).toBe(true);
    expect(editor.read.children()).toEqual([
      { children: [{ bold: true, text: 'bold' }], type: 'p' },
    ]);
  });

  it('registers Markdown serialization with the host codec registry', () => {
    const editor = createBaseEditor({
      plugins: [MarkdownPlugin],
    });
    const data = new DataTransfer();
    const fragment = editor.api.markdown.deserialize('**bold**');

    writeHostFragmentData(editor, data, ContentSlice.closed(fragment.children));

    expect(data.getData('text/markdown')).toBe('**bold**\n');
  });

  it('projects only primary content through the Markdown host codec', () => {
    const editor = createBaseEditor({
      plugins: [MarkdownPlugin],
    });
    const data = new DataTransfer();

    writeHostFragmentData(
      editor,
      data,
      ContentSlice.fromJSON({
        content: [
          {
            children: [{ text: 'Primary content' }],
            type: 'p',
          },
        ],
        openEnd: 1,
        openStart: 1,
        roots: {
          caption: [{ text: 'Detached caption' }],
        },
      })
    );

    expect(data.getData('text/markdown')).toBe('Primary content\n');
  });

  it('round-trips image alt through the Markdown host codec', () => {
    const source = createTestEditor();
    const document = source.api.markdown.deserialize('![Caption](/image.png)');
    const data = new DataTransfer();

    writeHostFragmentData(
      source,
      data,
      ContentSlice.fromJSON({
        content: document.children,
        openEnd: 0,
        openStart: 0,
      })
    );

    expect(data.getData('text/markdown')).toBe('![Caption](/image.png)\n');

    const target = createTestEditor();
    const markdownData = new DataTransfer();

    target.update.value.replace({
      children: [{ children: [{ text: '' }], type: 'p' }],
    });
    target.update.selection.set({ offset: 0, path: [0, 0] });
    markdownData.setData('text/markdown', data.getData('text/markdown'));

    expect(target.api.clipboard.insertData(markdownData)).toBe(true);

    const value = target.read.value();
    const image = value.children[0];

    expect(image).toMatchObject({
      alt: 'Caption',
      children: [{ text: '' }],
      type: 'img',
      url: '/image.png',
    });
    expect(value).not.toHaveProperty('roots');
  });

  it('deserializes partially styled MDX spans into JSON-compatible content', () => {
    const editor = createBaseEditor({
      plugins: [MarkdownPlugin],
    });
    const value = editor.api.markdown.deserialize(
      '<span style="color: #93C47D;">colored</span>',
      { remarkPlugins: [remarkMdx] }
    );

    expect(value).toEqual({
      children: [
        {
          children: [{ color: '#93C47D', text: 'colored' }],
          type: 'p',
        },
      ],
    });
    expect(ContentSlice.closed(value.children).content).toEqual(value.children);
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
      editor.api.markdown.deserialize('**bold**').children
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
