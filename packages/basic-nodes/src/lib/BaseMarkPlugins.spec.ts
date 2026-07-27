import { createBaseEditor } from '@platejs/core';
import { NodeApi, SelectionApi } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import {
  BaseBoldPlugin,
  BaseCodePlugin,
  BaseHighlightPlugin,
  BaseItalicPlugin,
  BaseKbdPlugin,
  BaseScriptPlugin,
  BaseStrikethroughPlugin,
  BaseUnderlinePlugin,
} from './index';

type MarkPlugin =
  | typeof BaseBoldPlugin
  | typeof BaseCodePlugin
  | typeof BaseHighlightPlugin
  | typeof BaseItalicPlugin
  | typeof BaseKbdPlugin
  | typeof BaseScriptPlugin
  | typeof BaseStrikethroughPlugin
  | typeof BaseUnderlinePlugin;

const getDecodedMarkReader = (plugin: MarkPlugin) => {
  const editor = createBaseEditor({
    plugins: [plugin],
  });

  return (element: HTMLElement) => {
    const fragment = editor.api.html.deserialize({ element });

    if (!fragment) return false;

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
      initialValue: [{ children: [{ text: '' }], type: KEYS.p }],
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
    const hasDecodedMark = getDecodedMarkReader(plugin);

    expect(hasDecodedMark(parseElement(html))).toBe(false);
  });

  it('skips inline code parsing inside pre blocks and paragraphs styled as code', () => {
    const hasDecodedCode = getDecodedMarkReader(BaseCodePlugin);

    expect(
      hasDecodedCode(parseElement('<pre><code>const a = 1;</code></pre>'))
    ).toBe(false);
    expect(
      hasDecodedCode(
        parseElement(
          '<p style="font-family: Consolas"><code>const b = 2;</code></p>'
        )
      )
    ).toBe(false);
  });

  it.each([
    [
      'bold',
      BaseBoldPlugin,
      KEYS.bold,
      true,
      '<span style="font-weight: 700">text</span>',
      'strong',
    ],
    ['code', BaseCodePlugin, KEYS.code, true, '<code>text</code>', 'code'],
    [
      'highlight',
      BaseHighlightPlugin,
      KEYS.highlight,
      true,
      '<mark>text</mark>',
      'mark',
    ],
    [
      'italic',
      BaseItalicPlugin,
      KEYS.italic,
      true,
      '<span style="font-style: italic">text</span>',
      'em',
    ],
    ['keyboard', BaseKbdPlugin, KEYS.kbd, true, '<kbd>text</kbd>', 'kbd'],
    [
      'strikethrough',
      BaseStrikethroughPlugin,
      KEYS.strikethrough,
      true,
      '<del>text</del>',
      's',
    ],
    [
      'subscript',
      BaseScriptPlugin,
      KEYS.script,
      'sub',
      '<span style="vertical-align: sub">text</span>',
      'sub',
    ],
    [
      'superscript',
      BaseScriptPlugin,
      KEYS.script,
      'sup',
      '<span style="vertical-align: super">text</span>',
      'sup',
    ],
    [
      'underline',
      BaseUnderlinePlugin,
      KEYS.underline,
      true,
      '<span style="text-decoration: underline">text</span>',
      'u',
    ],
  ] as const)('decodes and encodes the %s HTML claim', (_label, plugin, key, value, input, outputTag) => {
    const editor = createBaseEditor({
      plugins: [plugin],
      initialValue: [
        {
          children: [{ [key]: value, text: 'text' }],
          type: KEYS.p,
        },
      ],
    });
    const decoded = editor.api.html.deserialize({
      element: `<p>${input}</p>`,
    });
    const decodedText = decoded
      ? Array.from(NodeApi.texts({ children: decoded, type: 'root' }))[0]?.[0]
      : undefined;
    const point = { offset: 0, path: [0, 0] };
    const data = new DataTransfer();

    expect(decodedText).toMatchObject({
      [key]: value,
      text: 'text',
    });

    editor.update.selection.set(
      SelectionApi.node([0], { anchor: point, focus: point })
    );
    editor.api.clipboard.writeSelection(data);

    const body = new DOMParser().parseFromString(
      data.getData('text/html'),
      'text/html'
    ).body;

    expect(body.querySelector(`p > ${outputTag}`)?.textContent).toBe('text');
  });

  it('composes product mark wrappers without losing claims', () => {
    const point = { offset: 0, path: [0, 0] };
    const editor = createBaseEditor({
      plugins: [BaseBoldPlugin, BaseItalicPlugin, BaseUnderlinePlugin],
      selection: SelectionApi.node([0], { anchor: point, focus: point }),
      initialValue: [
        {
          children: [
            {
              [KEYS.bold]: true,
              [KEYS.italic]: true,
              [KEYS.underline]: true,
              text: 'text',
            },
          ],
          type: KEYS.p,
        },
      ],
    });
    const decoded = editor.api.html.deserialize({
      element: '<p><strong><em><u>text</u></em></strong></p>',
    });
    const decodedText = decoded
      ? Array.from(NodeApi.texts({ children: decoded, type: 'root' }))[0]?.[0]
      : undefined;
    const data = new DataTransfer();

    expect(decodedText).toMatchObject({
      [KEYS.bold]: true,
      [KEYS.italic]: true,
      [KEYS.underline]: true,
      text: 'text',
    });

    editor.api.clipboard.writeSelection(data);

    const body = new DOMParser().parseFromString(
      data.getData('text/html'),
      'text/html'
    ).body;

    expect(body.querySelector('strong')?.textContent).toBe('text');
    expect(body.querySelector('em')?.textContent).toBe('text');
    expect(body.querySelector('u')?.textContent).toBe('text');
  });

  it('toggles the code mark', () => {
    const editor = createBaseEditor({
      plugins: [BaseCodePlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'text' }], type: KEYS.p }],
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
      initialValue: [{ children: [{ text: 'text' }], type: KEYS.p }],
    });
    const italic = createBaseEditor({
      plugins: [BaseItalicPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'text' }], type: KEYS.p }],
    });
    const underline = createBaseEditor({
      plugins: [BaseUnderlinePlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'text' }], type: KEYS.p }],
    });
    const strikethrough = createBaseEditor({
      plugins: [BaseStrikethroughPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'text' }], type: KEYS.p }],
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
