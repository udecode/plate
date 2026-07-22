import { createBaseEditor } from '@platejs/core';

import { BaseCaptionPlugin } from './BaseCaptionPlugin';

describe('BaseCaptionPlugin', () => {
  it('ships caption defaults and visibility selector', () => {
    const editor = createBaseEditor({
      plugins: [BaseCaptionPlugin],
    });
    const plugin = editor.getPlugin(BaseCaptionPlugin);

    expect(plugin.options).toMatchObject({
      focusEndPath: null,
      focusStartPath: null,
      visibleId: null,
    });
    expect(plugin.targetPluginKeys).toEqual([]);

    editor.plugin(BaseCaptionPlugin).setOption('visibleId', 'caption-1');

    expect(editor.plugin(BaseCaptionPlugin).getOption('visibleId')).toBe(
      'caption-1'
    );
  });
});
