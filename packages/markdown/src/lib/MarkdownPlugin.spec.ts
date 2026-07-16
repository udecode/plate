import { createBaseEditor } from '@platejs/core';

import { MarkdownPlugin } from './MarkdownPlugin';

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
    expect(plugin.parser.format).toBe('text/plain');
    expect(
      plugin.parser.deserialize?.({
        ...editor.plugin(MarkdownPlugin),
        data: '**bold**',
        dataTransfer: createDataTransfer({}),
        mimeType: 'text/plain',
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
        ...editor.plugin(MarkdownPlugin),
        data: 'plain text',
        dataTransfer: createDataTransfer({ html: '<p>paste me</p>' }),
        mimeType: 'text/plain',
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
        ...editor.plugin(MarkdownPlugin),
        data: 'https://platejs.org/docs',
        dataTransfer: createDataTransfer({}),
        mimeType: 'text/plain',
      })
    ).toBe(false);
  });

  it('parses plain text when the clipboard carries files', () => {
    const editor = createBaseEditor({
      plugins: [MarkdownPlugin],
    });

    const query = editor.getPlugin(MarkdownPlugin).parser.query!;

    expect(
      query({
        ...editor.plugin(MarkdownPlugin),
        data: 'https://platejs.org/docs',
        dataTransfer: createDataTransfer({
          files: [new File([''], 'attachment.txt')],
        }),
        mimeType: 'text/plain',
      })
    ).toBe(true);
  });

  it('parses non-url plain text by default', () => {
    const editor = createBaseEditor({
      plugins: [MarkdownPlugin],
    });

    const query = editor.getPlugin(MarkdownPlugin).parser.query!;

    expect(
      query({
        ...editor.plugin(MarkdownPlugin),
        data: '**bold**',
        dataTransfer: createDataTransfer({}),
        mimeType: 'text/plain',
      })
    ).toBe(true);
  });
});
