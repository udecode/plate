import { createBaseEditor } from '@platejs/core';
import { getRenderNodeStaticProps } from '@platejs/core/static/internal';
import { KEYS } from '@platejs/utils';

import { BaseFontFamilyPlugin } from './BaseFontFamilyPlugin';

describe('BaseFontFamilyPlugin', () => {
  it('parses html font-family styles into leaf marks', () => {
    const editor = createBaseEditor({
      plugins: [BaseFontFamilyPlugin],
    });
    const plugin = editor.getPlugin(BaseFontFamilyPlugin);

    expect(plugin.inject.nodeProps).toEqual({
      styleKey: 'fontFamily',
    });
    expect(editor.getInjectProps(BaseFontFamilyPlugin)).toMatchObject({
      nodeKey: 'fontFamily',
      styleKey: 'fontFamily',
    });
    expect(editor.read.schema.property(BaseFontFamilyPlugin)?.value.kind).toBe(
      'string'
    );
    expect(
      editor.api.html.deserialize({
        element: '<span style="font-family: Fira Code, monospace">text</span>',
      })
    ).toMatchObject([
      {
        children: [
          {
            [KEYS.fontFamily]: '"Fira Code", monospace',
            text: 'text',
          },
        ],
        type: KEYS.p,
      },
    ]);
  });

  it('sets font family through the typed tx group', () => {
    const editor = createBaseEditor({
      plugins: [BaseFontFamilyPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'text' }], type: KEYS.p }],
    });

    editor.update.fontFamily.set('serif');

    expect(editor.read.children()[0]?.children[0]).toMatchObject({
      [KEYS.fontFamily]: 'serif',
      text: 'text',
    });
  });

  it('uses the resolved plugin type as its sole storage and render key', () => {
    const FontFamilyPlugin = BaseFontFamilyPlugin.configure({
      type: 'typeface',
    });
    const editor = createBaseEditor({
      plugins: [FontFamilyPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'text' }], type: KEYS.p }],
    });

    expect(editor.getInjectProps(FontFamilyPlugin)).toMatchObject({
      nodeKey: 'typeface',
      styleKey: 'fontFamily',
    });
    expect(
      getRenderNodeStaticProps({
        editor,
        props: {
          attributes: {},
          children: null,
          text: { fontFamily: 'serif', text: 'text' },
        },
      }).attributes.style
    ).toBeUndefined();
    expect(
      getRenderNodeStaticProps({
        editor,
        props: {
          attributes: {},
          children: null,
          text: { text: 'text', typeface: 'monospace' },
        },
      }).attributes.style
    ).toEqual({ fontFamily: 'monospace' });

    const parsed = editor.api.html.deserialize({
      element: '<span style="font-family: serif">text</span>',
    });

    expect(parsed).toEqual([
      {
        children: [{ text: 'text', typeface: 'serif' }],
        type: KEYS.p,
      },
    ]);

    editor.update.fontFamily.set('monospace');

    expect(editor.read.children()[0]?.children[0]).toMatchObject({
      text: 'text',
      typeface: 'monospace',
    });
    expect(editor.read.children()[0]?.children[0]).not.toHaveProperty(
      'fontFamily'
    );
  });
});
