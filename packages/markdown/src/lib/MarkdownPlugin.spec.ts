import { createBasePlateEditor } from 'platejs';
import { createPlateEditor } from 'platejs/react';

import { MarkdownPlugin } from './MarkdownPlugin';

const createDataTransfer = ({
  files = [],
  html = '',
}: {
  files?: File[];
  html?: string;
}) =>
  ({
    files,
    getData: (format: string) => (format === 'text/html' ? html : ''),
  }) as unknown as DataTransfer;

describe('MarkdownPlugin', () => {
  it('exposes default options, bound markdown api, and text parser deserialization', () => {
    const editor = createBasePlateEditor({
      plugins: [MarkdownPlugin],
    });
    const plugin = editor.getPlugin(MarkdownPlugin);

    expect(editor.getOptions(MarkdownPlugin)).toEqual({
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
        data: '**bold**',
      } as any)
    ).toEqual(editor.api.markdown.deserialize('**bold**'));
  });

  it('exposes the markdown api on the Plite runtime route', () => {
    const editor = createPlateEditor({
      plugins: [MarkdownPlugin],
      runtime: 'plite',
    });
    const api = editor.api as typeof editor.api & {
      markdown: {
        deserialize: (data: string) => unknown;
      };
    };

    expect(typeof api.markdown.deserialize).toBe('function');
    expect(api.markdown.deserialize('plain text')).toEqual([
      { children: [{ text: 'plain text' }], type: 'p' },
    ]);
  });

  it('skips plain-text parsing when html is present', () => {
    const editor = createBasePlateEditor({
      plugins: [MarkdownPlugin],
    });

    const query = editor.getPlugin(MarkdownPlugin).parser.query!;

    expect(
      query({
        data: 'plain text',
        dataTransfer: createDataTransfer({ html: '<p>paste me</p>' }),
      } as any)
    ).toBe(false);
  });

  it('passes through URL-only clipboard text so link handling can own it', () => {
    const editor = createBasePlateEditor({
      plugins: [MarkdownPlugin],
    });

    const query = editor.getPlugin(MarkdownPlugin).parser.query!;

    expect(
      query({
        data: 'https://platejs.org/docs',
        dataTransfer: createDataTransfer({}),
      } as any)
    ).toBe(false);
  });

  it('parses plain text when the clipboard carries files', () => {
    const editor = createBasePlateEditor({
      plugins: [MarkdownPlugin],
    });

    const query = editor.getPlugin(MarkdownPlugin).parser.query!;

    expect(
      query({
        data: 'https://platejs.org/docs',
        dataTransfer: createDataTransfer({ files: [{} as File] }),
      } as any)
    ).toBe(true);
  });

  it('parses non-url plain text by default', () => {
    const editor = createBasePlateEditor({
      plugins: [MarkdownPlugin],
    });

    const query = editor.getPlugin(MarkdownPlugin).parser.query!;

    expect(
      query({
        data: '**bold**',
        dataTransfer: createDataTransfer({}),
      } as any)
    ).toBe(true);
  });
});
