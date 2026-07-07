import {
  type AnyBasePlugin,
  createBaseEditor,
  getEditorPlugin,
} from '@platejs/core';
import { KEYS } from '@platejs/utils';

import {
  BaseBoldPlugin,
  BaseCodePlugin,
  BaseItalicPlugin,
  BaseStrikethroughPlugin,
  BaseUnderlinePlugin,
} from './index';

const getDeserializerQuery = (plugin: AnyBasePlugin) => {
  const editor = createBaseEditor({
    plugins: [plugin],
  });
  const resolvedPlugin = editor.getPlugin(plugin);
  const query = resolvedPlugin.parsers.html?.deserializer?.query;

  if (!query) {
    throw new Error(`Missing HTML query for ${plugin.key}`);
  }

  const pluginContext = getEditorPlugin(editor, resolvedPlugin);

  return (element: HTMLElement) => query({ ...pluginContext, element });
};

const parseElement = (html: string) => {
  const element = new DOMParser().parseFromString(html, 'text/html').body
    .firstElementChild;

  if (!(element instanceof HTMLElement)) {
    throw new Error(`Expected HTMLElement for ${html}`);
  }

  return element;
};

const queryElement = (html: string, selector: string) => {
  const element = new DOMParser()
    .parseFromString(html, 'text/html')
    .querySelector(selector);

  if (!(element instanceof HTMLElement)) {
    throw new Error(`Expected HTMLElement for ${selector}`);
  }

  return element;
};

describe('BaseMarkPlugins', () => {
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

    expect(
      query(queryElement('<pre><code>const a = 1;</code></pre>', 'code'))
    ).toBe(false);
    expect(
      query(
        queryElement(
          '<p style="font-family: Consolas"><code>const b = 2;</code></p>',
          'code'
        )
      )
    ).toBe(false);
  });

  it('toggles the code mark', () => {
    const editor = createBaseEditor({
      plugins: [BaseCodePlugin],
      selection: {
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
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      value: [{ children: [{ text: 'text' }], type: KEYS.p }],
    });
    const italic = createBaseEditor({
      plugins: [BaseItalicPlugin],
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      value: [{ children: [{ text: 'text' }], type: KEYS.p }],
    });
    const underline = createBaseEditor({
      plugins: [BaseUnderlinePlugin],
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      value: [{ children: [{ text: 'text' }], type: KEYS.p }],
    });
    const strikethrough = createBaseEditor({
      plugins: [BaseStrikethroughPlugin],
      selection: {
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
