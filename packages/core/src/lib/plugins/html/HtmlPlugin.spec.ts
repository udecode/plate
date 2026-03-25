import { createSlateEditor } from '../../editor';
import { HtmlPlugin } from './HtmlPlugin';

describe('HtmlPlugin', () => {
  it('declares the html parser format', () => {
    const editor = createSlateEditor();

    expect(editor.getPlugin(HtmlPlugin).parser.format).toBe('text/html');
  });

  it('deserializes through api.html using the parsed document body', () => {
    const editor = createSlateEditor();
    const fragment = [{ children: [{ text: 'Hello' }], type: 'p' }] as any;
    const deserializeSpy = spyOn(
      editor.api.html,
      'deserialize'
    ).mockReturnValue(fragment);

    const result = editor.getPlugin(HtmlPlugin).parser.deserialize?.({
      api: editor.api,
      data: '<p>Hello</p>',
    } as any);

    expect(result).toBe(fragment);
    expect(deserializeSpy).toHaveBeenCalledTimes(1);
    expect(
      (deserializeSpy.mock.calls[0]?.[0]?.element as HTMLElement).tagName
    ).toBe('BODY');
    expect(
      (deserializeSpy.mock.calls[0]?.[0]?.element as HTMLElement).innerHTML
    ).toBe('<p>Hello</p>');

    deserializeSpy.mockRestore();
  });
});
