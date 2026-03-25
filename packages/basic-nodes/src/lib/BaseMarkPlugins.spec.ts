import { KEYS, createSlateEditor } from 'platejs';

import {
  BaseBoldPlugin,
  BaseCodePlugin,
  BaseItalicPlugin,
  BaseStrikethroughPlugin,
  BaseUnderlinePlugin,
} from './index';

const getDeserializerQuery = (plugin: any) =>
  createSlateEditor({
    plugins: [plugin],
  } as any).getPlugin(plugin).parsers.html.deserializer.query;

describe('BaseMarkPlugins', () => {
  afterEach(() => {
    mock.restore();
  });

  it.each([
    [
      'bold',
      BaseBoldPlugin,
      KEYS.bold,
      '<strong><span style="font-weight: normal">text</span></strong>',
    ],
    [
      'italic',
      BaseItalicPlugin,
      KEYS.italic,
      '<em><span style="font-style: normal">text</span></em>',
    ],
    [
      'underline',
      BaseUnderlinePlugin,
      KEYS.underline,
      '<u><span style="text-decoration: none">text</span></u>',
    ],
    [
      'strikethrough',
      BaseStrikethroughPlugin,
      KEYS.strikethrough,
      '<s><span style="text-decoration: none">text</span></s>',
    ],
  ])('vetoes %s parsing when a descendant resets the style and toggles the mark', (_label, plugin, key, html) => {
    const element = new DOMParser().parseFromString(html, 'text/html').body
      .firstElementChild!;
    const query = getDeserializerQuery(plugin);
    const editor = createSlateEditor({
      plugins: [plugin],
    } as any);
    const toggleMarkSpy = spyOn(editor.tf, 'toggleMark');

    expect(query({ element })).toBe(false);

    (editor.getTransforms(plugin as any) as any)[key].toggle();

    expect(toggleMarkSpy).toHaveBeenCalledWith(editor.getType(key as any));
  });

  it('skips inline code parsing inside pre blocks and paragraphs styled as code', () => {
    const query = getDeserializerQuery(BaseCodePlugin);
    const preCode = new DOMParser()
      .parseFromString('<pre><code>const a = 1;</code></pre>', 'text/html')
      .querySelector('code')!;
    const paragraphCode = new DOMParser()
      .parseFromString(
        '<p style="font-family: Consolas"><code>const b = 2;</code></p>',
        'text/html'
      )
      .querySelector('code')!;

    expect(query({ element: preCode })).toBe(false);
    expect(query({ element: paragraphCode })).toBe(false);
  });

  it('toggles the code mark', () => {
    const editor = createSlateEditor({
      plugins: [BaseCodePlugin],
    } as any);
    const toggleMarkSpy = spyOn(editor.tf, 'toggleMark');

    (editor.getTransforms(BaseCodePlugin as any) as any).code.toggle();

    expect(toggleMarkSpy).toHaveBeenCalledWith(editor.getType(KEYS.code));
  });
});
