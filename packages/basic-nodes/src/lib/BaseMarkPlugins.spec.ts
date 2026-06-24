import { KEYS, createBasePlateEditor } from 'platejs';

import {
  BaseBoldPlugin,
  BaseCodePlugin,
  BaseHighlightPlugin,
  BaseItalicPlugin,
  BaseKbdPlugin,
  BaseStrikethroughPlugin,
  BaseSubscriptPlugin,
  BaseSuperscriptPlugin,
  BaseUnderlinePlugin,
} from './index';

const getDeserializerQuery = (plugin: any) =>
  createBasePlateEditor({
    plugins: [plugin],
  } as any).getPlugin(plugin).parsers.html.deserializer.query;

const runMarkToggleTx = (plugin: any, type: string) => {
  const remove = mock(() => {});
  const toggle = mock(() => {});
  const [extension] = plugin.__txExtensions;
  const txGroups = extension({ plugin, type } as any);
  const group = txGroups[plugin.key];
  const commands = group({ marks: { remove, toggle } });

  commands.toggle();

  return { remove, toggle };
};

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
  ])('vetoes %s parsing when a descendant resets the style', (_label, plugin, _key, html) => {
    const element = new DOMParser().parseFromString(html, 'text/html').body
      .firstElementChild!;
    const query = getDeserializerQuery(plugin);

    expect(query({ element })).toBe(false);
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

  it.each([
    ['bold', BaseBoldPlugin, KEYS.bold],
    ['code', BaseCodePlugin, KEYS.code],
    ['highlight', BaseHighlightPlugin, KEYS.highlight],
    ['italic', BaseItalicPlugin, KEYS.italic],
    ['kbd', BaseKbdPlugin, KEYS.kbd],
    ['strikethrough', BaseStrikethroughPlugin, KEYS.strikethrough],
    ['underline', BaseUnderlinePlugin, KEYS.underline],
  ])('registers %s as a transaction mark toggle', (_label, plugin, key) => {
    const { remove, toggle } = runMarkToggleTx(plugin, key);

    expect(toggle).toHaveBeenCalledWith(key);
    expect(remove).not.toHaveBeenCalled();
  });

  it('registers subscript and superscript as exclusive mark toggles', () => {
    const sub = runMarkToggleTx(BaseSubscriptPlugin, KEYS.sub);
    const sup = runMarkToggleTx(BaseSuperscriptPlugin, KEYS.sup);

    expect(sub.remove).toHaveBeenCalledWith(KEYS.sup);
    expect(sub.toggle).toHaveBeenCalledWith(KEYS.sub);
    expect(sup.remove).toHaveBeenCalledWith(KEYS.sub);
    expect(sup.toggle).toHaveBeenCalledWith(KEYS.sup);
  });
});
