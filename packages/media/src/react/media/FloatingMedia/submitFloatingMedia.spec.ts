import { createSlateEditor, KEYS } from 'platejs';

import { BaseMediaEmbedPlugin } from '../../../lib/media-embed/BaseMediaEmbedPlugin';
import { FloatingMediaStore } from './FloatingMediaStore';
import { submitFloatingMedia } from './submitFloatingMedia';

describe('submitFloatingMedia', () => {
  afterEach(() => {
    FloatingMediaStore.actions.reset();
    mock.restore();
  });

  it('applies transformUrl before validation so allowlisted embed snippets can submit', () => {
    const editor = createSlateEditor({
      plugins: [BaseMediaEmbedPlugin],
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      value: [
        {
          children: [{ text: '' }],
          type: KEYS.mediaEmbed,
          url: 'https://example.com/old',
        },
      ],
    } as any);

    const focus = mock();
    (editor.api as any).dom = { focus };

    FloatingMediaStore.set(
      'url',
      '<blockquote class="twitter-tweet"><a href="https://x.com/platejs/status/1234567890"></a></blockquote><script async src="https://platform.twitter.com/widgets.js"></script>'
    );

    const result = submitFloatingMedia(editor as any, {
      element: editor.children[0] as any,
      plugin: BaseMediaEmbedPlugin,
    });

    expect(result).toBe(true);
    expect(editor.children[0]).toMatchObject({
      id: '1234567890',
      provider: 'twitter',
      url: 'https://x.com/platejs/status/1234567890',
    });
    expect(focus).toHaveBeenCalled();
  });

  it('stores canonical provider metadata for supported video urls', () => {
    const editor = createSlateEditor({
      plugins: [BaseMediaEmbedPlugin],
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      value: [
        {
          children: [{ text: '' }],
          type: KEYS.mediaEmbed,
          url: 'https://example.com/old',
        },
      ],
    } as any);

    (editor.api as any).dom = { focus: mock() };

    FloatingMediaStore.set(
      'url',
      'https://www.youtube.com/watch?v=M7lc1UVf-VE'
    );

    const result = submitFloatingMedia(editor as any, {
      element: editor.children[0] as any,
      plugin: BaseMediaEmbedPlugin,
    });

    expect(result).toBe(true);
    expect(editor.children[0]).toMatchObject({
      id: 'M7lc1UVf-VE',
      provider: 'youtube',
      sourceUrl: 'https://www.youtube.com/watch?v=M7lc1UVf-VE',
      url: 'https://www.youtube.com/embed/M7lc1UVf-VE',
    });
  });

  it('rejects non-allowlisted script embed snippets after transform', () => {
    const editor = createSlateEditor({
      plugins: [BaseMediaEmbedPlugin],
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      value: [
        {
          children: [{ text: '' }],
          type: KEYS.mediaEmbed,
          url: 'https://example.com/old',
        },
      ],
    } as any);

    const focus = mock();
    (editor.api as any).dom = { focus };

    FloatingMediaStore.set(
      'url',
      '<script async src="https://example.com/widgets.js"></script>'
    );

    const result = submitFloatingMedia(editor as any, {
      element: editor.children[0] as any,
      plugin: BaseMediaEmbedPlugin,
    });

    expect(result).toBeUndefined();
    expect(editor.children[0]).toMatchObject({
      url: 'https://example.com/old',
    });
    expect(focus).not.toHaveBeenCalled();
  });
});
