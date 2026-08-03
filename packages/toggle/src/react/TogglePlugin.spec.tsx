import { createPlateEditor } from '@platejs/core/react';
import { BaseParagraphPlugin } from '@platejs/core';
import { BaseIndentPlugin } from '@platejs/indent';

import { TogglePlugin } from './TogglePlugin';

describe('TogglePlugin', () => {
  const plugins = [
    BaseIndentPlugin.configure({
      targetPlugins: [BaseParagraphPlugin, TogglePlugin],
    }),
    TogglePlugin,
  ] as const;

  it('inserts an indented paragraph inside an open toggle', () => {
    const editor = createPlateEditor({
      plugins,
      selection: {
        kind: 'text',
        anchor: { offset: 6, path: [0, 0] },
        focus: { offset: 6, path: [0, 0] },
      },
      initialValue: [
        { children: [{ text: 'Toggle' }], id: 't1', type: 'toggle' },
        { children: [{ text: 'after' }], type: 'paragraph' },
      ],
    });

    editor.plugin(TogglePlugin).api.toggleIds(['t1'], true);
    editor.update.break.insert();

    expect(editor.read.children()).toMatchObject([
      {
        children: [{ text: 'Toggle' }],
        id: 't1',
        type: 'toggle',
      },
      {
        children: [{ text: '' }],
        indent: 1,
        type: 'paragraph',
      },
      {
        children: [{ text: 'after' }],
        type: 'paragraph',
      },
    ]);
  });

  it('places a new closed-toggle block after hidden children', () => {
    const editor = createPlateEditor({
      plugins,
      selection: {
        kind: 'text',
        anchor: { offset: 6, path: [0, 0] },
        focus: { offset: 6, path: [0, 0] },
      },
      initialValue: [
        { children: [{ text: 'Toggle' }], id: 't1', type: 'toggle' },
        {
          children: [{ text: 'hidden child' }],
          id: 'p1',
          indent: 1,
          type: 'paragraph',
        },
        { children: [{ text: 'after' }], type: 'paragraph' },
      ],
    });

    editor.plugin(TogglePlugin).store.set({
      toggleIndex: new Map<string, string[]>([
        ['t1', []],
        ['p1', ['t1']],
      ]),
    });
    editor.update.break.insert();

    expect(editor.read.children()).toMatchObject([
      {
        children: [{ text: 'Toggle' }],
        id: 't1',
        type: 'toggle',
      },
      {
        children: [{ text: 'hidden child' }],
        id: 'p1',
        indent: 1,
        type: 'paragraph',
      },
      {
        children: [{ text: '' }],
        type: 'toggle',
      },
      {
        children: [{ text: 'after' }],
        type: 'paragraph',
      },
    ]);
  });

  it('marks descendants of closed toggles as non-selectable', () => {
    const editor = createPlateEditor({
      plugins,
      initialValue: [
        { children: [{ text: 'Toggle' }], id: 't1', type: 'toggle' },
        {
          children: [{ text: 'hidden child' }],
          id: 'p1',
          indent: 1,
          type: 'paragraph',
        },
      ],
    });

    editor.plugin(TogglePlugin).store.set({
      toggleIndex: new Map<string, string[]>([
        ['t1', []],
        ['p1', ['t1']],
      ]),
    });

    const hiddenChild = editor.read.nodes.get([1])?.[0];

    expect(editor.read.schema.element(TogglePlugin)?.groups).toContain('block');
    expect(hiddenChild && editor.read.schema.isSelectable(hiddenChild)).toBe(
      true
    );

    expect(hiddenChild && editor.read.nodes.isSelectable(hiddenChild)).toBe(
      false
    );

    editor.plugin(TogglePlugin).api.toggleIds(['t1'], true);

    expect(hiddenChild && editor.read.nodes.isSelectable(hiddenChild)).toBe(
      true
    );
  });

  it('moves past hidden descendants before deleting backward', () => {
    const editor = createPlateEditor({
      plugins,
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [2, 0] },
        focus: { offset: 0, path: [2, 0] },
      },
      initialValue: [
        { children: [{ text: 'Toggle' }], id: 't1', type: 'toggle' },
        {
          children: [{ text: 'hidden' }],
          id: 'p1',
          indent: 1,
          type: 'paragraph',
        },
        { children: [{ text: 'after' }], id: 'p2', type: 'paragraph' },
      ],
    });

    editor.plugin(TogglePlugin).store.set({
      toggleIndex: new Map<string, string[]>([
        ['t1', []],
        ['p1', ['t1']],
        ['p2', []],
      ]),
    });
    editor.update.text.deleteBackward({ unit: 'character' });

    expect(editor.read.children()).toMatchObject([
      {
        children: [{ text: 'Toggleafter' }],
        id: 't1',
        type: 'toggle',
      },
      {
        children: [{ text: 'hidden' }],
        id: 'p1',
        indent: 1,
        type: 'paragraph',
      },
    ]);
  });

  it('moves past hidden descendants before deleting forward', () => {
    const editor = createPlateEditor({
      plugins,
      selection: {
        kind: 'text',
        anchor: { offset: 6, path: [0, 0] },
        focus: { offset: 6, path: [0, 0] },
      },
      initialValue: [
        { children: [{ text: 'Toggle' }], id: 't1', type: 'toggle' },
        {
          children: [{ text: 'hidden' }],
          id: 'p1',
          indent: 1,
          type: 'paragraph',
        },
        { children: [{ text: 'after' }], id: 'p2', type: 'paragraph' },
      ],
    });

    editor.plugin(TogglePlugin).store.set({
      toggleIndex: new Map<string, string[]>([
        ['t1', []],
        ['p1', ['t1']],
        ['p2', []],
      ]),
    });
    editor.update.text.deleteForward({ unit: 'character' });

    expect(editor.read.children()).toMatchObject([
      {
        children: [{ text: 'Toggleafter' }],
        id: 't1',
        type: 'toggle',
      },
      {
        children: [{ text: 'hidden' }],
        id: 'p1',
        indent: 1,
        type: 'paragraph',
      },
    ]);
  });

  it('finds the last top-level entry enclosed by a toggle', () => {
    const value = [
      { children: [{ text: 'toggle' }], id: 't1', type: 'toggle' },
      {
        children: [{ text: 'one' }],
        id: 'p1',
        indent: 1,
        type: 'paragraph',
      },
      {
        children: [{ text: 'two' }],
        id: 'p2',
        indent: 1,
        type: 'paragraph',
      },
      {
        children: [{ text: 'three' }],
        id: 'p3',
        indent: 0,
        type: 'paragraph',
      },
    ] as const;
    const editor = createPlateEditor({ plugins, initialValue: value });

    expect(editor.plugin(TogglePlugin).read.lastEnclosedEntry('t1')).toEqual([
      value[2],
      [2],
    ]);
  });

  it('reads hidden ids and closed state from the toggle index', () => {
    const value = [
      { children: [{ text: 'toggle' }], id: 't1', type: 'toggle' },
      {
        children: [{ text: 'one' }],
        id: 'p1',
        indent: 1,
        type: 'paragraph',
      },
      {
        children: [{ text: 'two' }],
        id: 'p2',
        indent: 1,
        type: 'paragraph',
      },
      {
        children: [{ text: 'three' }],
        id: 'p3',
        indent: 0,
        type: 'paragraph',
      },
    ] as const;
    const editor = createPlateEditor({ plugins, initialValue: value });
    const toggle = editor.plugin(TogglePlugin);

    toggle.store.set({
      toggleIndex: new Map([
        ['t1', []],
        ['p1', ['t1']],
        ['p2', ['t1']],
        ['p3', []],
      ]),
    });

    expect(toggle.store.get('enclosingIds', 'p1')).toEqual(['t1']);
    expect(toggle.store.get('isClosed', 'p1')).toBe(true);

    toggle.api.toggleIds(['t1'], true);

    expect(toggle.store.get('isClosed', 'p1')).toBe(false);
  });
});
