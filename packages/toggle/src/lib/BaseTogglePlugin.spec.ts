import { BaseParagraphPlugin, createBaseEditor } from '@platejs/core';
import { BaseIndentPlugin } from '@platejs/indent';
import { KEYS } from '@platejs/utils';

import { BaseTogglePlugin } from './BaseTogglePlugin';

describe('BaseTogglePlugin', () => {
  it('tracks open ids and respects explicit force overrides', () => {
    const editor = createBaseEditor({
      plugins: [BaseTogglePlugin],
    });

    expect(editor.read.schema.create(BaseTogglePlugin)).toEqual({
      children: [{ text: '' }],
      type: BaseTogglePlugin.type,
    });
    expect(editor.read.schema.element(BaseTogglePlugin)?.groups).toContain(
      'block'
    );
    expect(editor.plugin(BaseTogglePlugin).store.get().openIds).toEqual(
      new Set()
    );

    editor.plugin(BaseTogglePlugin).api.toggleIds(['a', 'b']);

    expect(
      [
        ...(editor.plugin(BaseTogglePlugin).store.get().openIds ?? new Set()),
      ].sort()
    ).toEqual(['a', 'b']);

    editor.plugin(BaseTogglePlugin).api.toggleIds(['b'], false);

    expect([
      ...(editor.plugin(BaseTogglePlugin).store.get().openIds ?? new Set()),
    ]).toEqual(['a']);

    editor.plugin(BaseTogglePlugin).api.toggleIds(['a', 'c'], true);

    expect(
      [
        ...(editor.plugin(BaseTogglePlugin).store.get().openIds ?? new Set()),
      ].sort()
    ).toEqual(['a', 'c']);
  });

  it('reports whether the selection is inside a toggle', () => {
    const editor = createBaseEditor({
      plugins: [BaseTogglePlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      },
      initialValue: [
        { children: [{ text: 'one' }], type: KEYS.toggle },
        { children: [{ text: 'two' }], type: KEYS.p },
      ],
    });

    expect(editor.plugin(BaseTogglePlugin).read.isActive()).toBe(true);

    editor.update.selection.set({
      kind: 'text',
      anchor: { offset: 1, path: [1, 0] },
      focus: { offset: 1, path: [1, 0] },
    });

    expect(editor.plugin(BaseTogglePlugin).read.isActive()).toBe(false);
  });

  it('reports no selected toggle without a selection', () => {
    const editor = createBaseEditor({
      plugins: [BaseTogglePlugin],
      initialValue: [{ children: [{ text: 'one' }], type: KEYS.p }],
    });

    expect(editor.plugin(BaseTogglePlugin).read.isActive()).toBe(false);
  });

  it('finds indented descendants of toggles', () => {
    const value = [
      {
        children: [{ text: 'toggle' }],
        id: 't1',
        indent: 0,
        type: KEYS.toggle,
      },
      {
        children: [{ text: 'child' }],
        id: 'p1',
        indent: 1,
        type: KEYS.p,
      },
    ];
    const editor = createBaseEditor({
      plugins: [
        BaseIndentPlugin.configure({
          targetPluginNames: [BaseParagraphPlugin.name, BaseTogglePlugin.name],
        }),
        BaseTogglePlugin,
      ],
      initialValue: value,
    });

    expect(
      editor.plugin(BaseTogglePlugin).read.lastEnclosedEntry('t1')
    ).toEqual([value[1], [1]]);
  });

  it('closes enclosing toggles at idless boundaries', () => {
    const editor = createBaseEditor({
      plugins: [
        BaseIndentPlugin.configure({
          targetPluginNames: [BaseParagraphPlugin.name, BaseTogglePlugin.name],
        }),
        BaseTogglePlugin,
      ],
      initialValue: [
        {
          children: [{ text: 'toggle' }],
          id: 't1',
          type: KEYS.toggle,
        },
        {
          children: [{ text: 'child' }],
          id: 'p1',
          indent: 1,
          type: KEYS.p,
        },
        { children: [{ text: 'boundary' }], type: KEYS.p },
        {
          children: [{ text: 'outside' }],
          id: 'p2',
          indent: 1,
          type: KEYS.p,
        },
      ],
    });

    expect(
      editor.plugin(BaseTogglePlugin).read.lastEnclosedEntry('t1')
    ).toMatchObject([{ id: 'p1' }, [1]]);
  });
});
