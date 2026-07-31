import { createTestEditor } from './__tests__/createTestEditor';

describe('media package surfaces', () => {
  const createMediaEditor = () => createTestEditor();

  it('round-trips rich MDX media children directly', () => {
    const editor = createMediaEditor();
    const input = `<video src="https://example.com/video.mp4">
Rich **caption**.
</video>`;
    const document = editor.api.markdown.deserialize(input);
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
    expect(editor.api.markdown.serialize({ value: document })).toBe(
      `<video src="https://example.com/video.mp4">
  Rich **caption**.
</video>
`
    );
  });

  it('round-trips image attributes through the image plugin codec', () => {
    const editor = createMediaEditor();
    const input =
      '<img alt="caption alt" height="180" src="/from-attr.png" width="320" />';
    const document = editor.api.markdown.deserialize(input);

    expect(document.children).toMatchObject([
      {
        alt: 'caption alt',
        children: [{ text: '' }],
        height: 180,
        type: 'img',
        url: '/from-attr.png',
        width: 320,
      },
    ]);
    expect(editor.api.markdown.serialize({ value: document })).toBe(
      '<img alt="caption alt" height="180" width="320" src="/from-attr.png" />\n'
    );
  });

  it.each([
    {
      expected:
        '<file name="sample.pdf" src="https://example.com/sample.pdf" />\n',
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
        '<media_embed id="M7lc1UVf-VE" provider="youtube" sourceUrl="https://www.youtube.com/watch?v=M7lc1UVf-VE" src="https://www.youtube.com/embed/M7lc1UVf-VE" />\n',
      input:
        '<media_embed id="M7lc1UVf-VE" provider="youtube" sourceUrl="https://www.youtube.com/watch?v=M7lc1UVf-VE" src="https://www.youtube.com/embed/M7lc1UVf-VE" />',
      output: [
        {
          children: [{ text: '' }],
          id: 'M7lc1UVf-VE',
          provider: 'youtube',
          sourceUrl: 'https://www.youtube.com/watch?v=M7lc1UVf-VE',
          type: 'media_embed',
          url: 'https://www.youtube.com/embed/M7lc1UVf-VE',
        },
      ],
      title: 'round-trips media embed nodes with normalized metadata',
    },
    {
      expected: '<video width={640} src="https://example.com/video.mp4" />\n',
      input: '<video width={640} src="https://example.com/video.mp4" />',
      output: [
        {
          children: [{ text: '' }],
          type: 'video',
          url: 'https://example.com/video.mp4',
          width: {
            data: expect.any(Object),
            type: 'mdxJsxAttributeValueExpression',
            value: '640',
          },
        },
      ],
      title: 'round-trips video nodes with numeric attributes',
    },
  ])('$title', ({ expected, input, output }) => {
    const editor = createMediaEditor();

    const document = editor.api.markdown.deserialize(input);
    const value = document.children;

    expect(value).toMatchObject(output);
    expect(document).not.toHaveProperty('roots');
    expect(editor.api.markdown.serialize({ value: document })).toBe(expected);
  });
});
