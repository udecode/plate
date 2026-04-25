import { createSlateEditor, KEYS } from 'platejs';

import { BaseMediaEmbedPlugin } from './BaseMediaEmbedPlugin';

describe('BaseMediaEmbedPlugin', () => {
  it('configures media embeds as void elements with iframe parsing', () => {
    const editor = createSlateEditor({
      plugins: [BaseMediaEmbedPlugin],
    } as any);
    const plugin = editor.getPlugin(BaseMediaEmbedPlugin);
    const parse = plugin.parsers.html!.deserializer!.parse! as any;
    const transformUrl = plugin.options.transformUrl!;
    const iframe = new DOMParser().parseFromString(
      '<iframe src="https://example.com/embed"></iframe>',
      'text/html'
    ).body.firstElementChild as HTMLElement;
    const blankIframe = new DOMParser().parseFromString(
      '<iframe></iframe>',
      'text/html'
    ).body.firstElementChild as HTMLElement;

    expect(plugin.node).toMatchObject({
      isElement: true,
      isVoid: true,
    });
    expect(transformUrl('<iframe src="https://x.test"></iframe>')).toBe(
      'https://x.test'
    );
    expect(
      transformUrl(
        '<blockquote class="twitter-tweet"><a href="https://x.com/platejs/status/1234567890"></a></blockquote><script async src="https://platform.twitter.com/widgets.js"></script>'
      )
    ).toBe('https://x.com/platejs/status/1234567890');
    expect(parse({ element: iframe, type: KEYS.mediaEmbed } as any)).toEqual({
      type: KEYS.mediaEmbed,
      url: 'https://example.com/embed',
    });
    expect(
      parse({ element: blankIframe, type: KEYS.mediaEmbed } as any)
    ).toBeFalsy();
  });

  it('insert transform stores normalized embed metadata for supported providers', async () => {
    const { insertMediaEmbed } = await import('./transforms/insertMediaEmbed');
    const editor = createSlateEditor({
      plugins: [BaseMediaEmbedPlugin],
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      value: [{ children: [{ text: '' }], type: KEYS.p }],
    } as any);

    insertMediaEmbed(editor, {
      url: 'https://www.youtube.com/watch?v=M7lc1UVf-VE',
    });

    expect(editor.children[1]).toMatchObject({
      id: 'M7lc1UVf-VE',
      provider: 'youtube',
      sourceUrl: 'https://www.youtube.com/watch?v=M7lc1UVf-VE',
      type: KEYS.mediaEmbed,
      url: 'https://www.youtube.com/embed/M7lc1UVf-VE',
    });
  });
});
