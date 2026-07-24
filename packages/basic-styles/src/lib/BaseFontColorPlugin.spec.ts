import { createBaseEditor } from '@platejs/core';
import { getRenderNodeStaticProps } from '@platejs/core/static/internal';
import { KEYS } from '@platejs/utils';

import { BaseFontColorPlugin } from './BaseFontColorPlugin';

describe('BaseFontColorPlugin', () => {
  it('parses html color styles into leaf marks', () => {
    const editor = createBaseEditor({
      plugins: [BaseFontColorPlugin],
    });
    const plugin = editor.getPlugin(BaseFontColorPlugin);

    expect(plugin.inject.nodeProps).toEqual({
      defaultNodeValue: 'black',
      styleKey: 'color',
    });
    expect(editor.getInjectProps(BaseFontColorPlugin)).toMatchObject({
      defaultNodeValue: 'black',
      nodeKey: 'color',
      styleKey: 'color',
    });
    expect(editor.read.schema.property(BaseFontColorPlugin)?.value.kind).toBe(
      'string'
    );
    expect(
      editor.api.html.deserialize({
        element: '<span style="color: rgb(255, 0, 0)">text</span>',
      })
    ).toMatchObject([
      {
        children: [
          {
            [KEYS.color]: 'rgb(255, 0, 0)',
            text: 'text',
          },
        ],
        type: KEYS.p,
      },
    ]);
  });

  it('sets font color through the typed tx group', () => {
    const editor = createBaseEditor({
      plugins: [BaseFontColorPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'text' }], type: KEYS.p }],
    });

    editor.update.color.set('red');

    expect(editor.read.children()[0]?.children[0]).toMatchObject({
      [KEYS.color]: 'red',
      text: 'text',
    });

    editor.update.color.clear();

    expect(editor.read.children()[0]?.children[0]).toEqual({
      text: 'text',
    });
  });

  it('uses the resolved plugin type as its sole storage and render key', () => {
    const FontColorPlugin = BaseFontColorPlugin.configure({
      type: 'ink',
    });
    const editor = createBaseEditor({
      plugins: [FontColorPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'text' }], type: KEYS.p }],
    });

    expect(editor.getInjectProps(FontColorPlugin)).toMatchObject({
      nodeKey: 'ink',
      styleKey: 'color',
    });
    expect(
      getRenderNodeStaticProps({
        editor,
        props: {
          attributes: {},
          children: null,
          text: { color: 'red', text: 'text' },
        },
      }).attributes.style
    ).toBeUndefined();
    expect(
      getRenderNodeStaticProps({
        editor,
        props: {
          attributes: {},
          children: null,
          text: { ink: 'blue', text: 'text' },
        },
      }).attributes.style
    ).toEqual({ color: 'blue' });

    const parsed = editor.api.html.deserialize({
      element: '<span style="color: red">text</span>',
    });

    expect(parsed).toEqual([
      {
        children: [{ ink: 'red', text: 'text' }],
        type: KEYS.p,
      },
    ]);

    editor.update.color.set('blue');

    expect(editor.read.children()[0]?.children[0]).toMatchObject({
      ink: 'blue',
      text: 'text',
    });
    expect(editor.read.children()[0]?.children[0]).not.toHaveProperty('color');

    editor.update.color.clear();

    expect(editor.read.children()[0]?.children[0]).toEqual({
      text: 'text',
    });
  });
});
