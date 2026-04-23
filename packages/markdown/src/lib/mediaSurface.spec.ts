import {
  BaseAudioPlugin,
  BaseFilePlugin,
  BaseMediaEmbedPlugin,
  BaseVideoPlugin,
} from '../../../media/src/lib';

import { createTestEditor } from './__tests__/createTestEditor';
import { deserializeMd } from './deserializer';
import { serializeMd } from './serializer';

describe('media package surfaces', () => {
  const createMediaEditor = () =>
    createTestEditor([
      BaseFilePlugin,
      BaseAudioPlugin,
      BaseMediaEmbedPlugin,
      BaseVideoPlugin,
    ]);

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

    const value = deserializeMd(editor, input);

    expect(value).toMatchObject(output);

    const markdown = serializeMd(editor, { value: value as any });

    expect(markdown).toBe(expected);
    expect(deserializeMd(editor, markdown)).toMatchObject(value);
  });
});
