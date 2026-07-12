import { createBaseEditor, getEditorPlugin } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import { JuicePlugin } from './JuicePlugin';

describe('JuicePlugin', () => {
  it('removes commented style guards before inlining css', () => {
    const editor = createBaseEditor({
      plugins: [JuicePlugin],
    });
    const context = getEditorPlugin(editor, JuicePlugin);
    const transformData =
      JuicePlugin.inject?.plugins?.[KEYS.html]?.parser?.transformData;

    if (!transformData) {
      throw new Error('Missing HTML parser transformData');
    }

    const result = transformData({
      ...context,
      data: '<style><!-- .x { color: red; } --></style><p class="x">a</p>',
      dataTransfer: new DataTransfer(),
      mimeType: 'text/html',
    });

    expect(result).toContain('style="color: red;"');
    expect(result).not.toContain('<!--');
  });

  it('leaves plain html alone when there is nothing to inline', () => {
    const editor = createBaseEditor({
      plugins: [JuicePlugin],
    });
    const context = getEditorPlugin(editor, JuicePlugin);
    const transformData =
      JuicePlugin.inject?.plugins?.[KEYS.html]?.parser?.transformData;

    if (!transformData) {
      throw new Error('Missing HTML parser transformData');
    }

    expect(
      transformData({
        ...context,
        data: '<p>a</p>',
        dataTransfer: new DataTransfer(),
        mimeType: 'text/html',
      })
    ).toBe('<p>a</p>');
  });
});
