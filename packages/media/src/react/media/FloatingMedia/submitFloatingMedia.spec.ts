import assert from 'node:assert/strict';
import { createBaseEditor } from '@platejs/core';
import type { TMediaElement } from '@platejs/utils';
import { NODES } from '@platejs/utils';

import { BaseMediaEmbedPlugin } from '../../../lib/media-embed/BaseMediaEmbedPlugin';
import { FloatingMediaStore } from './FloatingMediaStore';
import { submitFloatingMedia } from './submitFloatingMedia';

describe('submitFloatingMedia', () => {
  const createEditor = () =>
    createBaseEditor({
      plugins: [BaseMediaEmbedPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      initialValue: [
        {
          children: [{ text: '' }],
          type: NODES.mediaEmbed,
          url: 'https://example.com/old',
        },
      ],
    });

  afterEach(() => {
    FloatingMediaStore.actions.reset();
    mock.restore();
  });

  const getMediaElement = (editor: ReturnType<typeof createEditor>) => {
    const entry = editor.read.nodes.get<TMediaElement>([0]);
    assert(entry);

    return entry[0];
  };

  it('applies transformUrl before validation so allowlisted embed snippets can submit', () => {
    const editor = createEditor();

    FloatingMediaStore.set(
      'url',
      '<blockquote class="twitter-tweet"><a href="https://x.com/platejs/status/1234567890"></a></blockquote><script async src="https://platform.twitter.com/widgets.js"></script>'
    );

    const result = submitFloatingMedia(editor, {
      element: getMediaElement(editor),
      plugin: BaseMediaEmbedPlugin,
    });

    expect(result).toBe(true);
    expect(editor.read.children()[0]).toMatchObject({
      provider: 'twitter',
      url: 'https://x.com/platejs/status/1234567890',
    });
    expect(editor.read.children()[0]).not.toHaveProperty('id');
  });

  it('stores canonical provider metadata for supported video urls', () => {
    const editor = createEditor();

    FloatingMediaStore.set(
      'url',
      'https://www.youtube.com/watch?v=M7lc1UVf-VE'
    );

    const result = submitFloatingMedia(editor, {
      element: getMediaElement(editor),
      plugin: BaseMediaEmbedPlugin,
    });

    expect(result).toBe(true);
    expect(editor.read.children()[0]).toMatchObject({
      provider: 'youtube',
      sourceUrl: 'https://www.youtube.com/watch?v=M7lc1UVf-VE',
      url: 'https://www.youtube.com/embed/M7lc1UVf-VE',
    });
    expect(editor.read.children()[0]).not.toHaveProperty('id');
  });

  it('rejects non-allowlisted script embed snippets after transform', () => {
    const editor = createEditor();

    FloatingMediaStore.set(
      'url',
      '<script async src="https://example.com/widgets.js"></script>'
    );

    const result = submitFloatingMedia(editor, {
      element: getMediaElement(editor),
      plugin: BaseMediaEmbedPlugin,
    });

    expect(result).toBeUndefined();
    expect(editor.read.children()[0]).toMatchObject({
      url: 'https://example.com/old',
    });
  });
});
