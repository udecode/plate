import { createBaseEditor } from '@platejs/core';
import { getRenderNodeStaticProps } from '@platejs/core/static/internal';
import { KEYS } from '@platejs/utils';

import { BaseFontBackgroundColorPlugin } from './BaseFontBackgroundColorPlugin';

describe('BaseFontBackgroundColorPlugin', () => {
  it('parses html background-color styles into leaf marks', () => {
    const editor = createBaseEditor({
      plugins: [BaseFontBackgroundColorPlugin],
    });
    const plugin = editor.getPlugin(BaseFontBackgroundColorPlugin);

    expect(plugin.inject.nodeProps).toEqual({
      styleKey: 'backgroundColor',
    });
    expect(editor.getInjectProps(BaseFontBackgroundColorPlugin)).toMatchObject({
      nodeKey: 'backgroundColor',
      styleKey: 'backgroundColor',
    });
    expect(
      editor.read.schema.property(BaseFontBackgroundColorPlugin)?.value.kind
    ).toBe('string');
    expect(
      editor.api.html.deserialize({
        element: '<span style="background-color: rgb(255, 255, 0)">text</span>',
      })
    ).toMatchObject([
      {
        children: [
          {
            [KEYS.backgroundColor]: 'rgb(255, 255, 0)',
            text: 'text',
          },
        ],
        type: KEYS.p,
      },
    ]);
  });

  it('sets background color through the typed tx group', () => {
    const editor = createBaseEditor({
      plugins: [BaseFontBackgroundColorPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'text' }], type: KEYS.p }],
    });

    editor.update.backgroundColor.set('yellow');

    expect(editor.read.children()[0]?.children[0]).toMatchObject({
      [KEYS.backgroundColor]: 'yellow',
      text: 'text',
    });

    editor.update.backgroundColor.clear();

    expect(editor.read.children()[0]?.children[0]).toEqual({
      text: 'text',
    });
  });

  it('uses the resolved plugin type as its sole storage and render key', () => {
    const BackgroundColorPlugin = BaseFontBackgroundColorPlugin.configure({
      type: 'highlight',
    });
    const editor = createBaseEditor({
      plugins: [BackgroundColorPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'text' }], type: KEYS.p }],
    });

    expect(editor.getInjectProps(BackgroundColorPlugin)).toMatchObject({
      nodeKey: 'highlight',
      styleKey: 'backgroundColor',
    });
    expect(
      getRenderNodeStaticProps({
        editor,
        props: {
          attributes: {},
          children: null,
          text: { backgroundColor: 'red', text: 'text' },
        },
      }).attributes.style
    ).toBeUndefined();
    expect(
      getRenderNodeStaticProps({
        editor,
        props: {
          attributes: {},
          children: null,
          text: { highlight: 'yellow', text: 'text' },
        },
      }).attributes.style
    ).toEqual({ backgroundColor: 'yellow' });

    const parsed = editor.api.html.deserialize({
      element: '<span style="background-color: red">text</span>',
    });

    expect(parsed).toEqual([
      {
        children: [{ highlight: 'red', text: 'text' }],
        type: KEYS.p,
      },
    ]);

    editor.update.backgroundColor.set('yellow');

    expect(editor.read.children()[0]?.children[0]).toMatchObject({
      highlight: 'yellow',
      text: 'text',
    });
    expect(editor.read.children()[0]?.children[0]).not.toHaveProperty(
      'backgroundColor'
    );

    editor.update.backgroundColor.clear();

    expect(editor.read.children()[0]?.children[0]).toEqual({
      text: 'text',
    });
  });
});
