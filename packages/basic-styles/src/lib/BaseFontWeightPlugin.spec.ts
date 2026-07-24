import { createBaseEditor, HtmlPlugin } from '@platejs/core';
import { getRenderNodeStaticProps } from '@platejs/core/static/internal';
import { KEYS } from '@platejs/utils';

import { BaseFontWeightPlugin } from './BaseFontWeightPlugin';

describe('BaseFontWeightPlugin', () => {
  it('parses html font-weight styles into leaf marks', () => {
    const editor = createBaseEditor({
      plugins: [BaseFontWeightPlugin],
    });
    const plugin = editor.getPlugin(BaseFontWeightPlugin);

    expect(plugin.inject.nodeProps).toEqual({
      styleKey: 'fontWeight',
    });
    expect(editor.getInjectProps(BaseFontWeightPlugin)).toMatchObject({
      nodeKey: 'fontWeight',
      styleKey: 'fontWeight',
    });
    expect(editor.read.schema.property(BaseFontWeightPlugin)?.value.kind).toBe(
      'string'
    );
    expect(
      editor.plugin(HtmlPlugin).api.deserialize({
        element: '<span style="font-weight: 700">text</span>',
      })
    ).toMatchObject([
      {
        [KEYS.fontWeight]: '700',
        text: 'text',
      },
    ]);
  });

  it('sets font weight through the typed tx group', () => {
    const editor = createBaseEditor({
      plugins: [BaseFontWeightPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'text' }], type: KEYS.p }],
    });

    editor.update.fontWeight.set('bold');

    expect(editor.read.children()[0]?.children[0]).toMatchObject({
      [KEYS.fontWeight]: 'bold',
      text: 'text',
    });
  });

  it('uses the resolved plugin type as its sole storage and render key', () => {
    const FontWeightPlugin = BaseFontWeightPlugin.configure({
      type: 'emphasisWeight',
    });
    const editor = createBaseEditor({
      plugins: [FontWeightPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'text' }], type: KEYS.p }],
    });

    expect(editor.getInjectProps(FontWeightPlugin)).toMatchObject({
      nodeKey: 'emphasisWeight',
      styleKey: 'fontWeight',
    });
    expect(
      getRenderNodeStaticProps({
        editor,
        props: {
          attributes: {},
          children: null,
          text: { fontWeight: '400', text: 'text' },
        },
      }).attributes.style
    ).toBeUndefined();
    expect(
      getRenderNodeStaticProps({
        editor,
        props: {
          attributes: {},
          children: null,
          text: { emphasisWeight: '700', text: 'text' },
        },
      }).attributes.style
    ).toEqual({ fontWeight: '700' });

    const parsed = editor.plugin(HtmlPlugin).api.deserialize({
      element: '<span style="font-weight: 700">text</span>',
    });

    expect(parsed).toMatchObject([{ emphasisWeight: '700', text: 'text' }]);
    expect(parsed[0]).not.toHaveProperty('fontWeight');

    editor.update.fontWeight.set('700');

    expect(editor.read.children()[0]?.children[0]).toMatchObject({
      emphasisWeight: '700',
      text: 'text',
    });
    expect(editor.read.children()[0]?.children[0]).not.toHaveProperty(
      'fontWeight'
    );
  });
});
