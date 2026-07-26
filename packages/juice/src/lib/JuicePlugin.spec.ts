import { createBaseEditor, prepareHtmlPluginContext } from '@platejs/core';

import { JuicePlugin } from './JuicePlugin';

describe('JuicePlugin', () => {
  it('removes commented style guards before inlining css', () => {
    const editor = createBaseEditor({
      plugins: [JuicePlugin],
    });
    const createContext = prepareHtmlPluginContext(editor, JuicePlugin);
    const context = editor.read((state) => createContext(state));
    const transformData =
      editor.getPlugin(JuicePlugin).parsers.html?.transformData;

    if (!transformData) {
      throw new Error('Missing HTML transformData');
    }

    const dataTransfer = new DataTransfer();
    const result = transformData({
      ...context,
      data: '<style><!-- .x { color: red; } --></style><p class="x">a</p>',
      format: 'text/html',
      source: {
        files: dataTransfer.files,
        getData: (format: string) => dataTransfer.getData(format),
        types: [...dataTransfer.types],
      },
    });

    expect(result).toContain('style="color: red;"');
    expect(result).not.toContain('<!--');
  });

  it('leaves plain html alone when there is nothing to inline', () => {
    const editor = createBaseEditor({
      plugins: [JuicePlugin],
    });
    const createContext = prepareHtmlPluginContext(editor, JuicePlugin);
    const context = editor.read((state) => createContext(state));
    const transformData =
      editor.getPlugin(JuicePlugin).parsers.html?.transformData;

    if (!transformData) {
      throw new Error('Missing HTML transformData');
    }

    const dataTransfer = new DataTransfer();

    expect(
      transformData({
        ...context,
        data: '<p>a</p>',
        format: 'text/html',
        source: {
          files: dataTransfer.files,
          getData: (format: string) => dataTransfer.getData(format),
          types: [...dataTransfer.types],
        },
      })
    ).toBe('<p>a</p>');
  });
});
