import {
  createEditor,
  prepareHtmlPluginContext,
  prepareHtmlRegistry,
} from '../../core';
import { JuicePlugin } from './JuicePlugin';

describe('JuicePlugin', () => {
  it('removes commented style guards before inlining css', () => {
    const editor = createEditor({
      plugins: [JuicePlugin],
    });
    const createContext = prepareHtmlPluginContext(editor, JuicePlugin);
    const context = editor.read((state) => createContext(state));
    const transformData = prepareHtmlRegistry(editor).plugins.find(
      ({ name }) => name === JuicePlugin.name
    )?.transformData;

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
    const editor = createEditor({
      plugins: [JuicePlugin],
    });
    const createContext = prepareHtmlPluginContext(editor, JuicePlugin);
    const context = editor.read((state) => createContext(state));
    const transformData = prepareHtmlRegistry(editor).plugins.find(
      ({ name }) => name === JuicePlugin.name
    )?.transformData;

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
