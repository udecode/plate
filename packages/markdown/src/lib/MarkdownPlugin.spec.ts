import { createSlateEditor } from 'platejs';

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
  it('skips plain-text parsing when html is present', () => {
    const editor = createSlateEditor({
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
    const editor = createSlateEditor({
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
    const editor = createSlateEditor({
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
    const editor = createSlateEditor({
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
