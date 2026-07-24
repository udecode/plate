import { createBaseEditor } from '../../editor';
import { prepareParserPluginContext } from '../../utils';
import { HtmlPlugin } from './HtmlPlugin';

describe('HtmlPlugin', () => {
  it('declares the html parser format', () => {
    const editor = createBaseEditor();

    expect(editor.getPlugin(HtmlPlugin).parser.format).toBe('text/html');
    expect(editor.api.html).toBe(editor.plugin(HtmlPlugin).api);
    expect(Object.isFrozen(editor.api.html)).toBe(true);
  });

  it('deserializes the parsed document body without a second fitter', () => {
    const editor = createBaseEditor();

    const createContext = prepareParserPluginContext(editor, HtmlPlugin);
    const result = editor.read((state) =>
      editor.getPlugin(HtmlPlugin).parser.deserialize?.({
        ...createContext(state),
        data: '<p>Hello</p>',
        format: 'text/html',
        source: {
          files: [] as any,
          getData: () => '<p>Hello</p>',
          types: ['text/html'],
        },
      })
    );

    expect(result).toEqual([{ children: [{ text: 'Hello' }], type: 'p' }]);
  });
});
