import { createBaseEditor, prepareParserPluginContext } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import { JuicePlugin } from './JuicePlugin';

describe('JuicePlugin', () => {
  it('removes commented style guards before inlining css', () => {
    const editor = createBaseEditor({
      plugins: [JuicePlugin],
    });
    const createContext = prepareParserPluginContext(editor, JuicePlugin);
    const context = editor.read((state) => createContext(state));
    const transformData =
      JuicePlugin.inject?.parsers?.[KEYS.html]?.parser?.transformData;

    if (!transformData) {
      throw new Error('Missing HTML parser transformData');
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
    const createContext = prepareParserPluginContext(editor, JuicePlugin);
    const context = editor.read((state) => createContext(state));
    const transformData =
      JuicePlugin.inject?.parsers?.[KEYS.html]?.parser?.transformData;

    if (!transformData) {
      throw new Error('Missing HTML parser transformData');
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
