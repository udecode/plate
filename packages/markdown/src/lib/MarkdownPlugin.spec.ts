import {
  createBaseEditor,
  createBasePlugin,
  prepareParserPluginContext,
} from '@platejs/core';
import { ContentSlice } from '@platejs/plite';
import { writeHostFragmentData } from '@platejs/plite-dom';

import { MarkdownPlugin } from './MarkdownPlugin';

const BoldPlugin = createBasePlugin({
  key: 'bold',
  node: { mark: true },
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
  it('exposes default options, bound markdown api, and text parser deserialization', () => {
    const editor = createBaseEditor({
      plugins: [MarkdownPlugin],
    });
    const plugin = editor.getPlugin(MarkdownPlugin);

    expect(editor.plugin(MarkdownPlugin).getOptions()).toEqual({
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
    const editor = createBaseEditor({ plugins: [MarkdownPlugin] });
    const data = new DataTransfer();
    const fragment = editor.api.markdown.deserialize('**bold**');

    writeHostFragmentData(editor, data, ContentSlice.closed(fragment));

    expect(data.getData('text/markdown')).toBe('**bold**\n');
  });

  it('parses the registered Markdown clipboard format', () => {
    const editor = createBaseEditor({
      plugins: [BoldPlugin, MarkdownPlugin],
      value: [{ children: [{ text: '' }], type: 'p' }],
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
      value,
    });
    const target = createBaseEditor({
      plugins: [BoldPlugin, MarkdownPlugin],
      value: [{ children: [{ text: '' }], type: 'p' }],
    });
    const data = new DataTransfer();

    writeHostFragmentData(source, data, ContentSlice.closed(value));

    expect(target.api.clipboard.insertData(data)).toBe(true);
    expect(target.read.children()).toEqual(value);
  });
});
