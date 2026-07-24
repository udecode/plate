import { createBaseEditor } from '@platejs/core';
import { getRenderNodeStaticProps } from '@platejs/core/static/internal';
import { KEYS } from '@platejs/utils';

import { BaseFontSizePlugin } from './BaseFontSizePlugin';

describe('BaseFontSizePlugin', () => {
  it('parses html font-size styles into leaf marks', () => {
    const editor = createBaseEditor({
      plugins: [BaseFontSizePlugin],
    });
    const plugin = editor.getPlugin(BaseFontSizePlugin);

    expect(plugin.inject.nodeProps).toEqual({
      styleKey: 'fontSize',
    });
    expect(editor.getInjectProps(BaseFontSizePlugin)).toMatchObject({
      nodeKey: 'fontSize',
      styleKey: 'fontSize',
    });
    expect(editor.read.schema.property(BaseFontSizePlugin)?.value.kind).toBe(
      'string'
    );
    expect(
      editor.api.html.deserialize({
        element: '<span style="font-size: 18px">text</span>',
      })
    ).toMatchObject([
      {
        children: [
          {
            [KEYS.fontSize]: '18px',
            text: 'text',
          },
        ],
        type: KEYS.p,
      },
    ]);
  });

  it('sets font size through the typed tx group', () => {
    const editor = createBaseEditor({
      plugins: [BaseFontSizePlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'text' }], type: KEYS.p }],
    });

    editor.update.fontSize.set('24px');

    expect(editor.read.children()[0]?.children[0]).toMatchObject({
      [KEYS.fontSize]: '24px',
      text: 'text',
    });
  });

  it('uses the resolved plugin type as its sole storage and render key', () => {
    const FontSizePlugin = BaseFontSizePlugin.configure({
      type: 'fontScale',
    });
    const editor = createBaseEditor({
      plugins: [FontSizePlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'text' }], type: KEYS.p }],
    });

    expect(editor.getInjectProps(FontSizePlugin)).toMatchObject({
      nodeKey: 'fontScale',
      styleKey: 'fontSize',
    });
    expect(
      getRenderNodeStaticProps({
        editor,
        props: {
          attributes: {},
          children: null,
          text: { fontSize: '16px', text: 'text' },
        },
      }).attributes.style
    ).toBeUndefined();
    expect(
      getRenderNodeStaticProps({
        editor,
        props: {
          attributes: {},
          children: null,
          text: { fontScale: '20px', text: 'text' },
        },
      }).attributes.style
    ).toEqual({ fontSize: '20px' });

    const parsed = editor.api.html.deserialize({
      element: '<span style="font-size: 18px">text</span>',
    });

    expect(parsed).toEqual([
      {
        children: [{ fontScale: '18px', text: 'text' }],
        type: KEYS.p,
      },
    ]);

    editor.update.fontSize.set('20px');

    expect(editor.read.children()[0]?.children[0]).toMatchObject({
      fontScale: '20px',
      text: 'text',
    });
    expect(editor.read.children()[0]?.children[0]).not.toHaveProperty(
      'fontSize'
    );
  });
});
