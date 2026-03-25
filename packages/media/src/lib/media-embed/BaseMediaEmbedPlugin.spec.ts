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
    expect(parse({ element: iframe, type: KEYS.mediaEmbed } as any)).toEqual({
      type: KEYS.mediaEmbed,
      url: 'https://example.com/embed',
    });
    expect(
      parse({ element: blankIframe, type: KEYS.mediaEmbed } as any)
    ).toBeFalsy();
  });
});
