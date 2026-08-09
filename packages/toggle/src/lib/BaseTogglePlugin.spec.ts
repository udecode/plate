import { BaseParagraphPlugin, createBaseEditor } from '@platejs/core';
import { BaseIndentPlugin } from '@platejs/indent';

import { BaseTogglePlugin } from './BaseTogglePlugin';

describe('BaseTogglePlugin', () => {
  it('tracks open keys and respects explicit force overrides', () => {
    const editor = createBaseEditor({
      plugins: [BaseParagraphPlugin, BaseTogglePlugin],
      initialValue: [
        { children: [{ text: 'a' }], type: 'paragraph' },
        { children: [{ text: 'b' }], type: 'paragraph' },
        { children: [{ text: 'c' }], type: 'paragraph' },
      ],
    });
    const a = editor.key([0])!;
    const b = editor.key([1])!;
    const c = editor.key([2])!;

    expect(editor.read.schema.create(BaseTogglePlugin)).toEqual({
      children: [{ text: '' }],
      type: 'toggle',
    });
    expect(editor.read.schema.element(BaseTogglePlugin)?.groups).toContain(
      'block'
    );
    expect(editor.plugin(BaseTogglePlugin).store.get().openKeys).toEqual(
      new Set()
    );

    editor.plugin(BaseTogglePlugin).api.toggleKeys([a, b]);

    expect(editor.plugin(BaseTogglePlugin).store.get().openKeys).toEqual(
      new Set([a, b])
    );

    editor.plugin(BaseTogglePlugin).api.toggleKeys([b], false);

    expect([
      ...(editor.plugin(BaseTogglePlugin).store.get().openKeys ?? new Set()),
    ]).toEqual([a]);

    editor.plugin(BaseTogglePlugin).api.toggleKeys([a, c], true);

    expect(editor.plugin(BaseTogglePlugin).store.get().openKeys).toEqual(
      new Set([a, c])
    );
  });

  it('finds indented descendants of toggles', () => {
    const value = [
      {
        children: [{ text: 'toggle' }],
        indent: 0,
        type: 'toggle',
      },
      {
        children: [{ text: 'child' }],
        indent: 1,
        type: 'paragraph',
      },
    ] as const;
    const editor = createBaseEditor({
      plugins: [
        BaseIndentPlugin.configure({
          targetPlugins: [BaseParagraphPlugin, BaseTogglePlugin],
        }),
        BaseTogglePlugin,
      ],
      initialValue: value,
    });

    expect(
      editor.plugin(BaseTogglePlugin).read.lastEnclosedEntry(editor.key([0])!)
    ).toEqual([value[1], [1]]);
  });

  it('closes enclosing toggles at indentation boundaries', () => {
    const editor = createBaseEditor({
      plugins: [
        BaseIndentPlugin.configure({
          targetPlugins: [BaseParagraphPlugin, BaseTogglePlugin],
        }),
        BaseTogglePlugin,
      ],
      initialValue: [
        {
          children: [{ text: 'toggle' }],
          type: 'toggle',
        },
        {
          children: [{ text: 'child' }],
          indent: 1,
          type: 'paragraph',
        },
        { children: [{ text: 'boundary' }], type: 'paragraph' },
        {
          children: [{ text: 'outside' }],
          indent: 1,
          type: 'paragraph',
        },
      ],
    });

    expect(
      editor.plugin(BaseTogglePlugin).read.lastEnclosedEntry(editor.key([0])!)
    ).toMatchObject([{ children: [{ text: 'child' }] }, [1]]);
  });
});
