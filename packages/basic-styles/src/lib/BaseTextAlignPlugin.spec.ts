import { BaseParagraphPlugin, createBaseEditor } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import { BaseTextAlignPlugin } from './BaseTextAlignPlugin';

describe('BaseTextAlignPlugin', () => {
  it('exposes the injected block contract and typed tx group', () => {
    const editor = createBaseEditor({
      plugins: [BaseParagraphPlugin, BaseTextAlignPlugin],
    });
    const plugin = editor.getPlugin(BaseTextAlignPlugin);

    expect(plugin.inject.isBlock).toBe(true);
    expect(plugin.inject.targetPlugins).toEqual([KEYS.p]);
    expect(plugin.inject.nodeProps).toMatchObject({
      defaultNodeValue: 'start',
      styleKey: 'textAlign',
      validNodeValues: ['start', 'left', 'center', 'right', 'end', 'justify'],
    });
    expect(
      editor.read.schema.property({
        key: 'align',
        placement: 'element',
        type: KEYS.p,
      })?.value.kind
    ).toBe('string');
    expect(typeof editor.update.textAlign.set).toBe('function');
  });

  it('derives schema and injection targets from configured plugin keys', () => {
    const ParagraphPlugin = BaseParagraphPlugin.configure({
      node: { type: 'custom-paragraph' },
    });
    const TextAlignPlugin = BaseTextAlignPlugin.configure({
      options: { targetPluginKeys: [KEYS.p] },
    });
    const editor = createBaseEditor({
      plugins: [ParagraphPlugin, TextAlignPlugin],
    });
    const plugin = editor.getPlugin(TextAlignPlugin);

    expect(plugin.options.targetPluginKeys).toEqual([KEYS.p]);
    expect(plugin.inject.targetPlugins).toEqual(
      plugin.options.targetPluginKeys
    );
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
      editor.api.html.deserialize({
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
      value: [
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
});
