import { createBaseEditor } from '@platejs/core';
import { NodeApi } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import {
  BaseBoldPlugin,
  BaseCodePlugin,
  BaseItalicPlugin,
  BaseStrikethroughPlugin,
  BaseUnderlinePlugin,
} from './index';

type MarkPlugin =
  | typeof BaseBoldPlugin
  | typeof BaseCodePlugin
  | typeof BaseItalicPlugin
  | typeof BaseStrikethroughPlugin
  | typeof BaseUnderlinePlugin;

const getDeserializerQuery = (plugin: MarkPlugin) => {
  const editor = createBaseEditor({
    plugins: [plugin],
  });

  return (element: HTMLElement) => {
    const fragment = editor.api.html.deserialize({ element });

    return Array.from(NodeApi.texts({ children: fragment, type: 'root' })).some(
      ([text]) => text[plugin.key]
    );
  };
};

const parseElement = (html: string) => {
  const element = new DOMParser().parseFromString(html, 'text/html').body
    .firstElementChild;

  if (!(element instanceof HTMLElement)) {
    throw new Error(`Expected HTMLElement for ${html}`);
  }

  return element;
};

describe('BaseMarkPlugins', () => {
  it('registers and parses bold as a schema-owned text property', () => {
    const editor = createBaseEditor({
      plugins: [BaseBoldPlugin],
      value: [{ children: [{ text: '' }], type: KEYS.p }],
    });
    const bold = editor.read.schema
      .getVocabulary()
      .propertyIds.find((propertyId) =>
        propertyId.startsWith(`text:${KEYS.bold}@`)
      );
    const data = new DataTransfer();

    data.setData('text/html', '<p><strong>bold</strong></p>');

    expect(bold).toBeDefined();
    expect(editor.api.clipboard.insertData(data)).toBe(true);
    expect(editor.read.children()).toEqual([
      { children: [{ bold: true, text: 'bold' }], type: KEYS.p },
    ]);
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
    const query = getDeserializerQuery(plugin);

    expect(query(parseElement(html))).toBe(false);
  });

  it('skips inline code parsing inside pre blocks and paragraphs styled as code', () => {
    const query = getDeserializerQuery(BaseCodePlugin);

    expect(query(parseElement('<pre><code>const a = 1;</code></pre>'))).toBe(
      false
    );
    expect(
      query(
        parseElement(
          '<p style="font-family: Consolas"><code>const b = 2;</code></p>'
        )
      )
    ).toBe(false);
  });

  it('toggles the code mark', () => {
    const editor = createBaseEditor({
      plugins: [BaseCodePlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      value: [{ children: [{ text: 'text' }], type: KEYS.p }],
    });

    editor.update.code.toggle();

    expect(editor.read.children()[0]?.children[0]).toMatchObject({
      code: true,
      text: 'text',
    });
  });

  it('toggles basic marks through typed tx groups', () => {
    const bold = createBaseEditor({
      plugins: [BaseBoldPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      value: [{ children: [{ text: 'text' }], type: KEYS.p }],
    });
    const italic = createBaseEditor({
      plugins: [BaseItalicPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      value: [{ children: [{ text: 'text' }], type: KEYS.p }],
    });
    const underline = createBaseEditor({
      plugins: [BaseUnderlinePlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      value: [{ children: [{ text: 'text' }], type: KEYS.p }],
    });
    const strikethrough = createBaseEditor({
      plugins: [BaseStrikethroughPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      value: [{ children: [{ text: 'text' }], type: KEYS.p }],
    });

    bold.update.bold.toggle();
    italic.update.italic.toggle();
    underline.update.underline.toggle();
    strikethrough.update.strikethrough.toggle();

    expect(bold.read.children()[0]?.children[0]).toMatchObject({ bold: true });
    expect(italic.read.children()[0]?.children[0]).toMatchObject({
      italic: true,
    });
    expect(underline.read.children()[0]?.children[0]).toMatchObject({
      underline: true,
    });
    expect(strikethrough.read.children()[0]?.children[0]).toMatchObject({
      strikethrough: true,
    });
  });
});
