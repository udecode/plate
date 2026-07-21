import {
  BaseParagraphPlugin,
  createBaseEditor,
  getEditorPlugin,
} from '@platejs/core';
import { KEYS } from '@platejs/utils';

import { BaseTextIndentPlugin } from './BaseTextIndentPlugin';

describe('BaseTextIndentPlugin', () => {
  it('exposes the default injected block contract', () => {
    const editor = createBaseEditor({
      plugins: [BaseParagraphPlugin, BaseTextIndentPlugin],
    });
    const plugin = editor.getPlugin(BaseTextIndentPlugin);
    const nodeProps = editor.getInjectProps(BaseTextIndentPlugin);
    const transformNodeValue = nodeProps.transformNodeValue!;

    expect(plugin.inject.isBlock).toBe(true);
    expect(plugin.inject.targetPlugins).toEqual([KEYS.p]);
    expect(nodeProps).toMatchObject({
      nodeKey: 'textIndent',
      styleKey: 'textIndent',
    });
    expect(
      transformNodeValue({
        ...getEditorPlugin(editor, plugin),
        getOptions: () => editor.plugin(BaseTextIndentPlugin).getOptions(),
        nodeValue: 2,
      })
    ).toBe('48px');
    expect(
      editor.read.schema.property({
        key: KEYS.textIndent,
        placement: 'element',
        type: KEYS.p,
      })?.value.kind
    ).toBe('number');
  });

  it('derives schema and injection targets from configured plugin keys', () => {
    const ParagraphPlugin = BaseParagraphPlugin.configure({
      node: { type: 'custom-paragraph' },
    });
    const TextIndentPlugin = BaseTextIndentPlugin.configure({
      options: { targetPluginKeys: [KEYS.p] },
    });
    const editor = createBaseEditor({
      plugins: [ParagraphPlugin, TextIndentPlugin],
    });
    const plugin = editor.getPlugin(TextIndentPlugin);

    expect(plugin.options.targetPluginKeys).toEqual([KEYS.p]);
    expect(plugin.inject.targetPlugins).toEqual(
      plugin.options.targetPluginKeys
    );
    expect(
      editor.read.schema.property({
        key: KEYS.textIndent,
        placement: 'element',
        type: 'custom-paragraph',
      })?.value.kind
    ).toBe('number');
    expect(
      editor.read.schema.property({
        key: KEYS.textIndent,
        placement: 'element',
        type: KEYS.p,
      })
    ).toBeNull();
  });

  it('uses configured offset and unit when formatting node values', () => {
    const TextIndentPlugin = BaseTextIndentPlugin.configure({
      options: {
        offset: 10,
        unit: 'em',
      },
    });
    const editor = createBaseEditor({
      plugins: [BaseParagraphPlugin, TextIndentPlugin],
    });
    const plugin = editor.getPlugin(TextIndentPlugin);
    const nodeProps = editor.getInjectProps(TextIndentPlugin);

    expect(
      nodeProps.transformNodeValue!({
        ...getEditorPlugin(editor, plugin),
        getOptions: () => editor.plugin(TextIndentPlugin).getOptions(),
        nodeValue: 3,
      })
    ).toBe('30em');
  });

  it('applies and clears text indent through the typed tx group', () => {
    const editor = createBaseEditor({
      plugins: [BaseParagraphPlugin, BaseTextIndentPlugin],
      value: [
        {
          children: [{ text: 'One' }],
          type: 'p',
        },
      ],
    });
    const nodeKey = editor.getType(KEYS.textIndent);

    editor.update.textIndent.set(2, { at: [0] });
    expect(editor.read.children()[0]).toMatchObject({ [nodeKey]: 2 });

    editor.update.textIndent.unset({ at: [0] });
    expect(editor.read.children()[0]).not.toHaveProperty(nodeKey);
  });
});
