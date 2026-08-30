import type { Pluggable, Preset, Settings } from 'unified';

import {
  BaseParagraphPlugin,
  ContentSlice,
  createEditor,
  ElementIdPlugin,
  PLUGINS,
  type BasePluginInput,
  type CreateEditorOptions,
  type InitialValue,
  type Value,
} from '../../core';
import { writeHostFragmentData } from '../../dom';
import { BaseBoldPlugin } from '../../features/basic-nodes';
import { BaseFontColorPlugin } from '../../features/basic-styles';
import { BaseListPlugin } from '../../features/list';
import { createTestEditor } from './__tests__/createTestEditor';
import { createMarkdownRuntime } from './internal/markdownConversion';
import { MarkdownPlugin } from './MarkdownPlugin';
import { remarkMdx } from './plugins';
import { materializeRemarkPlugins } from './utils/getRemarkPluginsWithoutMdx';

const createFixtureEditor = <const P extends readonly BasePluginInput[]>(
  options: Omit<CreateEditorOptions, 'plugins'> & {
    initialValue?: InitialValue<Value>;
    plugins: P;
  }
) =>
  createEditor({
    ...options,
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
    const editor = createFixtureEditor({
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
        listType: 'bulleted',
        type: 'paragraph',
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
    expect(editor.api.markdown.serialize({ value: { children: value } })).toBe(
      '+ Item\n'
    );
    expect(serializeHost()).toBe('+ Item\n');

    editor.plugin(MarkdownPlugin).store.set({
      remarkStringifyOptions: { bullet: '*' },
    });

    expect(editor.api.markdown.serialize({ value: { children: value } })).toBe(
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
    const editor = createFixtureEditor({
      plugins: [
        MarkdownPlugin.configure({
          initialState: { remarkPlugins: configuredPlugins },
        }),
      ],
    });
    const snapshot =
      editor.plugin(MarkdownPlugin).store.get().remarkPlugins ?? [];
    const snapshotPreset = snapshot[0];

    if (
      !snapshotPreset ||
      typeof snapshotPreset === 'function' ||
      !('plugins' in snapshotPreset) ||
      !snapshotPreset.plugins ||
      !('settings' in snapshotPreset) ||
      !snapshotPreset.settings?.join
    ) {
      throw new Error('Expected a frozen remark preset.');
    }

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
      !('plugins' in materializedPreset) ||
      !('settings' in materializedPreset)
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
    if (!materializedPreset.plugins) {
      throw new Error('Expected materialized remark plugins.');
    }

    materializedPreset.plugins.push(() => undefined);
    expect(snapshotPreset.plugins).toHaveLength(1);
    expect(typeof editor.api.markdown.serialize()).toBe('string');
  });

  it('exposes default options, root markdown api, and codec deserialization', () => {
    const editor = createFixtureEditor({
      plugins: [BaseBoldPlugin, MarkdownPlugin],
    });
    const plugin = editor.plugin(MarkdownPlugin);

    expect(editor.plugin(MarkdownPlugin).store.get()).toMatchObject({
      allowedNodes: null,
      disallowedNodes: null,
      plainMarks: null,
      remarkPlugins: [],
      remarkStringifyOptions: null,
    });
    expect(typeof editor.api.markdown.deserialize).toBe('function');
    expect(typeof editor.api.markdown.deserializeInline).toBe('function');
    expect(typeof editor.api.markdown.serialize).toBe('function');
    expect(Reflect.ownKeys(editor.plugin(MarkdownPlugin).api)).toEqual([
      'deserialize',
      'deserializeInline',
      'serialize',
    ]);
    expect(editor.plugin(MarkdownPlugin).api.deserialize('**bold**')).toEqual(
      editor.api.markdown.deserialize('**bold**')
    );
    expect('parser' in plugin).toBe(false);
    expect(editor.api.markdown.deserialize('**bold**')).toEqual({
      children: [
        {
          children: [{ bold: true, text: 'bold' }],
          type: 'paragraph',
        },
      ],
    });
  });

  it('round-trips canonical persisted element ids', () => {
    const editor = createFixtureEditor({
      plugins: [
        ElementIdPlugin,
        MarkdownPlugin.configure({
          initialState: { remarkPlugins: [remarkMdx] },
        }),
      ],
      initialValue: [
        {
          children: [{ text: 'Hello' }],
          id: 'block-1',
          type: 'paragraph',
        },
      ],
    });

    const markdown = editor.api.markdown.serialize({ withBlockId: true });

    expect(markdown).toContain('<block id="block-1">');
    expect(editor.api.markdown.deserialize(markdown)).toEqual({
      children: [
        {
          children: [{ text: 'Hello' }],
          id: 'block-1',
          type: 'paragraph',
        },
      ],
    });
  });

  it('round-trips persisted ids for flat list blocks', () => {
    const editor = createFixtureEditor({
      plugins: [
        BaseParagraphPlugin,
        BaseListPlugin,
        ElementIdPlugin,
        MarkdownPlugin.configure({
          initialState: { remarkPlugins: [remarkMdx] },
        }),
      ],
      initialValue: [
        {
          children: [{ text: 'First' }],
          id: 'list-1',
          indent: 1,
          listType: 'bulleted',
          type: 'paragraph',
        },
        {
          children: [{ text: 'Second' }],
          id: 'list-2',
          indent: 1,
          listType: 'bulleted',
          type: 'paragraph',
        },
      ],
    });

    const markdown = editor.api.markdown.serialize({ withBlockId: true });

    expect(markdown).toContain('<block id="list-1">');
    expect(markdown).toContain('<block id="list-2">');
    expect(editor.api.markdown.deserialize(markdown).children).toEqual([
      expect.objectContaining({ id: 'list-1' }),
      expect.objectContaining({ id: 'list-2' }),
    ]);
  });

  it('rejects persisted block wrappers without ElementIdPlugin', () => {
    const editor = createFixtureEditor({
      plugins: [
        MarkdownPlugin.configure({
          initialState: { remarkPlugins: [remarkMdx] },
        }),
      ],
    });

    expect(() =>
      editor.api.markdown.deserialize(
        '<block id="block-1">\n\nHello\n\n</block>'
      )
    ).toThrow('requires ElementIdPlugin');
  });

  it('applies one-operation overrides by installed feature name', () => {
    const editor = createTestEditor();

    expect(
      editor.api.markdown.deserialize('```ts\nconst answer = 42;\n```', {
        rules: {
          codeBlock: {
            deserialize: () => ({
              children: [{ text: '' }],
              lang: 'ts',
              rawCode: 'const answer = 42;',
              type: 'codeBlock',
            }),
          },
        },
      })
    ).toEqual({
      children: [
        {
          children: [{ text: '' }],
          lang: 'ts',
          rawCode: 'const answer = 42;',
          type: 'codeBlock',
        },
      ],
    });
  });

  it('checks optional plugins through their installed portal state', () => {
    const editor = createFixtureEditor({
      plugins: [MarkdownPlugin],
    });
    const installed = editor.read((state) => {
      const runtime = createMarkdownRuntime(
        editor,
        editor.plugin(MarkdownPlugin).store.get(),
        state
      );

      return {
        markdown: runtime.registry.has(PLUGINS.markdown),
        missing: runtime.registry.has('missingPlugin'),
      };
    });

    expect(installed).toEqual({
      markdown: true,
      missing: false,
    });
  });

  it('skips plain-text parsing when html is present', () => {
    const editor = createFixtureEditor({
      plugins: [MarkdownPlugin],
    });

    expect(
      editor.api.dom.clipboard.insertData(
        createDataTransfer({
          html: '<p>paste me</p>',
          text: '**plain text**',
        })
      )
    ).toBe(true);
    expect(editor.read.children()).toEqual([
      { children: [{ text: 'paste me' }], type: 'paragraph' },
    ]);
  });

  it('passes through URL-only clipboard text so link handling can own it', () => {
    const editor = createFixtureEditor({
      plugins: [MarkdownPlugin],
    });

    expect(
      editor.api.dom.clipboard.insertData(
        createDataTransfer({ text: 'https://platejs.org/docs' })
      )
    ).toBe(true);
    expect(editor.read.children()).toEqual([
      { children: [{ text: 'https://platejs.org/docs' }], type: 'paragraph' },
    ]);
  });

  it('parses plain text when the clipboard carries files', () => {
    const editor = createFixtureEditor({
      plugins: [MarkdownPlugin],
    });

    expect(
      editor.api.dom.clipboard.insertData(
        createDataTransfer({
          files: [new File([''], 'attachment.txt')],
          text: 'https://platejs.org/docs',
        })
      )
    ).toBe(true);
    expect(editor.read.children()).toEqual([
      { children: [{ text: 'https://platejs.org/docs' }], type: 'paragraph' },
    ]);
  });

  it('parses non-url plain text by default', () => {
    const editor = createFixtureEditor({
      plugins: [BaseBoldPlugin, MarkdownPlugin],
    });

    expect(
      editor.api.dom.clipboard.insertData(
        createDataTransfer({ text: '**bold**' })
      )
    ).toBe(true);
    expect(editor.read.children()).toEqual([
      { children: [{ bold: true, text: 'bold' }], type: 'paragraph' },
    ]);
  });

  it('registers Markdown serialization with the host codec registry', () => {
    const editor = createFixtureEditor({
      plugins: [BaseBoldPlugin, MarkdownPlugin],
    });
    const data = new DataTransfer();
    const fragment = editor.api.markdown.deserialize('**bold**');

    writeHostFragmentData(editor, data, ContentSlice.closed(fragment.children));

    expect(data.getData('text/markdown')).toBe('**bold**\n');
  });

  it('projects only primary content through the Markdown host codec', () => {
    const editor = createFixtureEditor({
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
            type: 'paragraph',
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

  it('keeps inline marks while unwrapping an open nested fragment', () => {
    const editor = createTestEditor();
    const data = new DataTransfer();
    const blockquote = editor.api.markdown.deserialize('> alpha **beta** gamma')
      .children[0];

    writeHostFragmentData(
      editor,
      data,
      ContentSlice.fromJSON({
        content: [blockquote],
        openEnd: 1,
        openStart: 1,
      })
    );

    expect(data.getData('text/markdown')).toBe('alpha **beta** gamma\n');
  });

  it('unwraps every open depth without inventing nested block markers', () => {
    const editor = createTestEditor();
    const data = new DataTransfer();
    const blockquote = editor.api.markdown.deserialize(
      '> # alpha **beta** gamma'
    ).children[0];

    writeHostFragmentData(
      editor,
      data,
      ContentSlice.fromJSON({
        content: [blockquote],
        openEnd: 2,
        openStart: 2,
      })
    );

    expect(data.getData('text/markdown')).toBe('alpha **beta** gamma\n');
  });

  it('does not invent a heading marker for an open clipboard fragment', () => {
    const editor = createTestEditor();
    const data = new DataTransfer();
    const heading = editor.api.markdown.deserialize('# alpha **beta** gamma')
      .children[0];

    writeHostFragmentData(
      editor,
      data,
      ContentSlice.fromJSON({
        content: [heading],
        openEnd: 1,
        openStart: 1,
      })
    );

    expect(data.getData('text/markdown')).toBe('alpha **beta** gamma\n');
  });

  it('does not invent code fences for an open clipboard fragment', () => {
    const editor = createTestEditor();
    const data = new DataTransfer();
    const codeBlock = editor.api.markdown.deserialize(
      '```ts\nconst alpha = 1;\nconst beta = 2;\n```'
    ).children[0];

    writeHostFragmentData(
      editor,
      data,
      ContentSlice.fromJSON({
        content: [codeBlock],
        openEnd: 1,
        openStart: 1,
      })
    );

    expect(data.getData('text/markdown')).toBe(
      'const alpha = 1;\nconst beta = 2;\n'
    );
  });

  it('does not invent a list marker for an open clipboard fragment', () => {
    const editor = createFixtureEditor({
      plugins: [BaseParagraphPlugin, BaseListPlugin, MarkdownPlugin],
    });
    const data = new DataTransfer();

    writeHostFragmentData(
      editor,
      data,
      ContentSlice.fromJSON({
        content: [
          {
            children: [{ text: 'partial item' }],
            indent: 1,
            listType: 'bulleted',
            type: 'paragraph',
          },
        ],
        openEnd: 1,
        openStart: 1,
      })
    );

    expect(data.getData('text/markdown')).toBe('partial item\n');
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
      children: [{ children: [{ text: '' }], type: 'paragraph' }],
    });
    target.update.selection.set({ offset: 0, path: [0, 0] });
    markdownData.setData('text/markdown', data.getData('text/markdown'));

    expect(target.api.dom.clipboard.insertData(markdownData)).toBe(true);

    const value = target.read.value();
    const image = value.children[0];

    expect(image).toMatchObject({
      alt: 'Caption',
      children: [{ text: '' }],
      type: 'image',
      url: '/image.png',
    });
    expect(value).not.toHaveProperty('roots');
  });

  it('deserializes partially styled MDX spans into JSON-compatible content', () => {
    const editor = createFixtureEditor({
      plugins: [BaseFontColorPlugin, MarkdownPlugin],
    });
    const value = editor.api.markdown.deserialize(
      '<span style="color: #93C47D;">colored</span>',
      { remarkPlugins: [remarkMdx] }
    );

    expect(value).toEqual({
      children: [
        {
          children: [{ color: '#93C47D', text: 'colored' }],
          type: 'paragraph',
        },
      ],
    });
    expect(ContentSlice.closed(value.children).content).toEqual(value.children);
  });

  it('parses the registered Markdown clipboard format', () => {
    const editor = createFixtureEditor({
      plugins: [BaseBoldPlugin, MarkdownPlugin],
      initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
    });
    const data = new DataTransfer();

    data.setData('text/markdown', '**bold**');

    expect(editor.api.dom.clipboard.insertData(data)).toBe(true);
    expect(editor.read.children()).toEqual(
      editor.api.markdown.deserialize('**bold**').children
    );
  });

  it('round-trips a leaf property through the Markdown host codec', () => {
    const value = [
      { children: [{ bold: true, text: 'bold' }], type: 'paragraph' },
    ];
    const source = createFixtureEditor({
      plugins: [BaseBoldPlugin, MarkdownPlugin],
      initialValue: value,
    });
    const target = createFixtureEditor({
      plugins: [BaseBoldPlugin, MarkdownPlugin],
      initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
    });
    const data = new DataTransfer();

    writeHostFragmentData(source, data, ContentSlice.closed(value));

    expect(target.api.dom.clipboard.insertData(data)).toBe(true);
    expect(target.read.children()).toEqual(value);
  });
});
