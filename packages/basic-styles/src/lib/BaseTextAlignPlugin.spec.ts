import {
  BaseParagraphPlugin,
  createBaseEditor,
  HtmlPlugin,
} from '@platejs/core';
import { KEYS } from '@platejs/utils';

import { BaseTextAlignPlugin } from './BaseTextAlignPlugin';

describe('BaseTextAlignPlugin', () => {
  it('exposes the injected block contract and typed tx group', () => {
    const editor = createBaseEditor({
      plugins: [BaseParagraphPlugin, BaseTextAlignPlugin],
    });
    const plugin = editor.getPlugin(BaseTextAlignPlugin);

    expect(plugin.inject.isBlock).toBe(true);
    expect(plugin.targetPluginKeys).toEqual([KEYS.p]);
    expect(plugin.inject.nodeProps).toMatchObject({
      defaultNodeValue: 'start',
      styleKey: 'textAlign',
      validNodeValues: ['start', 'left', 'center', 'right', 'end', 'justify'],
    });
    expect(editor.read.schema.property(BaseTextAlignPlugin)?.value.kind).toBe(
      'string'
    );
    expect(typeof editor.update.textAlign.set).toBe('function');
  });

  it('derives schema and injection targets from configured plugin keys', () => {
    const ParagraphPlugin = BaseParagraphPlugin.configure({
      type: 'custom-paragraph',
    });
    const TextAlignPlugin = BaseTextAlignPlugin.configure({
      targetPluginKeys: [KEYS.p],
    });
    const editor = createBaseEditor({
      plugins: [ParagraphPlugin, TextAlignPlugin],
    });
    const plugin = editor.getPlugin(TextAlignPlugin);

    expect(plugin.targetPluginKeys).toEqual([KEYS.p]);
    expect(
      editor.read.schema.property({
        key: 'align',
        placement: 'element',
        type: 'custom-paragraph',
      })?.value.kind
    ).toBe('string');
    expect(
      editor.read.schema.property({
        key: 'align',
        placement: 'element',
        type: KEYS.p,
      })
    ).toBeNull();
  });

  it('parses text-align styles through the injected target plugin deserializer', () => {
    const editor = createBaseEditor({
      plugins: [BaseParagraphPlugin, BaseTextAlignPlugin],
    });

    expect(
      editor.plugin(HtmlPlugin).api.deserialize({
        element: '<p style="text-align: center">text</p>',
      })
    ).toMatchObject([
      {
        [editor.getType(KEYS.textAlign)]: 'center',
        children: [{ text: 'text' }],
        type: KEYS.p,
      },
    ]);
  });

  it('applies and clears text alignment through the typed tx group', () => {
    const editor = createBaseEditor({
      plugins: [BaseParagraphPlugin, BaseTextAlignPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 3, path: [0, 0] },
      },
      initialValue: [
        {
          children: [{ text: 'One' }],
          type: 'p',
        },
      ],
    });
    const nodeKey = editor.getType(KEYS.textAlign);

    editor.update.textAlign.set('center');
    expect(editor.read.children()[0]).toMatchObject({ [nodeKey]: 'center' });

    editor.update.textAlign.set('start');
    expect(editor.read.children()[0]).not.toHaveProperty(nodeKey);
  });

  it('uses the resolved plugin type as its sole storage key', () => {
    const TextAlignPlugin = BaseTextAlignPlugin.configure({
      inject: {
        nodeProps: {
          nodeKey: 'legacyAlign',
        },
      },
      type: 'textAlignment',
    });
    const editor = createBaseEditor({
      plugins: [BaseParagraphPlugin, TextAlignPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 3, path: [0, 0] },
      },
      initialValue: [
        {
          children: [{ text: 'One' }],
          type: 'p',
        },
      ],
    });

    expect(
      editor.plugin(HtmlPlugin).api.deserialize({
        element: '<p style="text-align: center">text</p>',
      })
    ).toMatchObject([
      {
        children: [{ text: 'text' }],
        textAlignment: 'center',
        type: KEYS.p,
      },
    ]);

    editor.update.textAlign.set('center');

    expect(editor.read.children()[0]).toMatchObject({
      textAlignment: 'center',
    });
    expect(editor.read.children()[0]).not.toHaveProperty('legacyAlign');

    editor.update.textAlign.set('start');

    expect(editor.read.children()[0]).not.toHaveProperty('textAlignment');
  });
});
