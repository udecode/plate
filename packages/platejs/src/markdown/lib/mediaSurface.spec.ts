import { BaseParagraphPlugin, createEditor, schema } from '../../core';
import { BaseMediaEmbedPlugin } from '../../features/media';
import {
  createTestEditor,
  parseTestMarkdown,
  serializeTestMarkdown,
} from './__tests__/createTestEditor';
import { MarkdownPlugin } from './MarkdownPlugin';

describe('media package surfaces', () => {
  const createMediaEditor = () => createTestEditor();

  it('round-trips rich MDX media children directly', () => {
    const editor = createMediaEditor();
    const input = `<video src="https://example.com/video.mp4">
Rich **caption**.
</video>`;
    const document = parseTestMarkdown(editor, input);
    const media = document.children[0];

    expect(media).toMatchObject({
      children: [
        { text: 'Rich ' },
        { bold: true, text: 'caption' },
        { text: '.' },
      ],
      type: 'video',
      url: 'https://example.com/video.mp4',
    });
    expect(document).not.toHaveProperty('roots');
    expect(serializeTestMarkdown(editor, { document }).data).toBe(
      `<video src="https://example.com/video.mp4">Rich **caption**.</video>
`
    );
  });

  it('uses the application media embed type as its MDX identity', () => {
    const editor = createEditor({
      plugins: [
        BaseParagraphPlugin,
        BaseMediaEmbedPlugin,
        MarkdownPlugin.configure({
          initialState: { remarkPlugins: [] },
        }),
      ],
      schema: {
        overrides: [
          schema.override(BaseMediaEmbedPlugin, {
            element: { type: 'customMediaEmbed' },
          }),
        ],
      },
    });
    const document = parseTestMarkdown(
      editor,
      '<customMediaEmbed src="https://example.com/embed" />'
    );

    expect(document.children).toMatchObject([
      {
        children: [{ text: '' }],
        type: 'customMediaEmbed',
        url: 'https://example.com/embed',
      },
    ]);
    expect(serializeTestMarkdown(editor, { document }).data).toBe(
      '<customMediaEmbed src="https://example.com/embed" />\n'
    );
  });

  it('round-trips image attributes through the image plugin mapping', () => {
    const editor = createMediaEditor();
    const input =
      '<img alt="caption alt" height="180" src="/from-attr.png" width="320" />';
    const document = parseTestMarkdown(editor, input);

    expect(document.children).toMatchObject([
      {
        alt: 'caption alt',
        children: [{ text: '' }],
        naturalHeight: 180,
        type: 'image',
        url: '/from-attr.png',
        width: 320,
      },
    ]);
    expect(serializeTestMarkdown(editor, { document }).data).toBe(
      '<img src="/from-attr.png" width="320" alt="caption alt" height="180" />\n'
    );

    const stringWidth = serializeTestMarkdown(editor, {
      document: {
        children: [
          {
            children: [{ text: '' }],
            type: 'image',
            url: '/string-width.png',
            width: '320',
          },
        ],
      },
    });

    expect(stringWidth.data).toBe(
      '<img src="/string-width.png" width="&quot;320&quot;" />\n'
    );
    expect(
      parseTestMarkdown(editor, stringWidth.data).children[0]
    ).toMatchObject({ type: 'image', width: '320' });
  });

  it.each([
    {
      expected:
        '<file src="https://example.com/sample.pdf" name="sample.pdf" />\n',
      input: '<file name="sample.pdf" src="https://example.com/sample.pdf" />',
      output: [
        {
          children: [{ text: '' }],
          name: 'sample.pdf',
          type: 'file',
          url: 'https://example.com/sample.pdf',
        },
      ],
      title: 'round-trips file nodes',
    },
    {
      expected: '<audio src="https://example.com/audio.mp3" />\n',
      input: '<audio src="https://example.com/audio.mp3" />',
      output: [
        {
          children: [{ text: '' }],
          type: 'audio',
          url: 'https://example.com/audio.mp3',
        },
      ],
      title: 'round-trips audio nodes',
    },
    {
      expected:
        '<mediaEmbed src="https://www.youtube.com/embed/M7lc1UVf-VE" provider="youtube" sourceUrl="https://www.youtube.com/watch?v=M7lc1UVf-VE" />\n',
      input:
        '<mediaEmbed provider="youtube" sourceUrl="https://www.youtube.com/watch?v=M7lc1UVf-VE" src="https://www.youtube.com/embed/M7lc1UVf-VE" />',
      output: [
        {
          children: [{ text: '' }],
          provider: 'youtube',
          sourceUrl: 'https://www.youtube.com/watch?v=M7lc1UVf-VE',
          type: 'mediaEmbed',
          url: 'https://www.youtube.com/embed/M7lc1UVf-VE',
        },
      ],
      title: 'round-trips media embed nodes with normalized metadata',
    },
    {
      expected: '<video src="https://example.com/video.mp4" width="640" />\n',
      input: '<video width={640} src="https://example.com/video.mp4" />',
      output: [
        {
          children: [{ text: '' }],
          type: 'video',
          url: 'https://example.com/video.mp4',
          width: 640,
        },
      ],
      title: 'round-trips video nodes with numeric attributes',
    },
  ])('$title', ({ expected, input, output }) => {
    const editor = createMediaEditor();

    const document = parseTestMarkdown(editor, input);
    const value = document.children;

    expect(value).toMatchObject(output);
    expect(document).not.toHaveProperty('roots');
    expect(serializeTestMarkdown(editor, { document }).data).toBe(expected);
  });
});
