import { createBasePlateEditor } from 'platejs';

import { BaseCaptionPlugin } from './BaseCaptionPlugin';

describe('BaseCaptionPlugin', () => {
  it('ships caption defaults, visibility selector, and runtime ownership', () => {
    const editor = createBasePlateEditor({
      plugins: [BaseCaptionPlugin],
    });
    const plugin = editor.getPlugin(BaseCaptionPlugin);

    expect(plugin.options).toMatchObject({
      focusEndPath: null,
      focusStartPath: null,
      query: { allow: [] },
      visibleId: null,
    });

    editor.setOption(BaseCaptionPlugin, 'visibleId', 'caption-1');

    expect(editor.getOption(BaseCaptionPlugin, 'visibleId')).toBe('caption-1');
    expect(BaseCaptionPlugin.runtimeCaption).toBe(true);
  });
});
