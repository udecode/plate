import { createPlateEditor } from '@platejs/core/react';
import { BaseParagraphPlugin, ElementIdPlugin } from '@platejs/core';
import { BaseIndentPlugin } from '@platejs/indent';

import { TogglePlugin } from './TogglePlugin';

describe('TogglePlugin', () => {
  const plugins = [
    BaseIndentPlugin.configure({
      targetPlugins: [BaseParagraphPlugin, TogglePlugin],
    }),
    ElementIdPlugin,
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

    editor.plugin(TogglePlugin).api.toggleKeys([editor.key([0])!], true);
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

    const toggleKey = editor.key([0])!;
    const childKey = editor.key([1])!;

    editor.plugin(TogglePlugin).store.set({
      toggleIndex: new Map([
        [toggleKey, []],
        [childKey, [toggleKey]],
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

    const toggleKey = editor.key([0])!;
    const childKey = editor.key([1])!;

    editor.plugin(TogglePlugin).store.set({
      toggleIndex: new Map([
        [toggleKey, []],
        [childKey, [toggleKey]],
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

    editor.plugin(TogglePlugin).api.toggleKeys([toggleKey], true);

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

    const toggleKey = editor.key([0])!;
    const childKey = editor.key([1])!;
    const afterKey = editor.key([2])!;

    editor.plugin(TogglePlugin).store.set({
      toggleIndex: new Map([
        [toggleKey, []],
        [childKey, [toggleKey]],
        [afterKey, []],
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

    const toggleKey = editor.key([0])!;
    const childKey = editor.key([1])!;
    const afterKey = editor.key([2])!;

    editor.plugin(TogglePlugin).store.set({
      toggleIndex: new Map([
        [toggleKey, []],
        [childKey, [toggleKey]],
        [afterKey, []],
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

    expect(
      editor.plugin(TogglePlugin).read.lastEnclosedEntry(editor.key([0])!)
    ).toEqual([value[2], [2]]);
  });

  it('reads hidden keys and closed state from the toggle index', () => {
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
    const toggleKey = editor.key([0])!;
    const firstKey = editor.key([1])!;
    const secondKey = editor.key([2])!;
    const lastKey = editor.key([3])!;

    toggle.store.set({
      toggleIndex: new Map([
        [toggleKey, []],
        [firstKey, [toggleKey]],
        [secondKey, [toggleKey]],
        [lastKey, []],
      ]),
    });

    expect(toggle.store.get('enclosingKeys', firstKey)).toEqual([toggleKey]);
    expect(toggle.store.get('isClosed', firstKey)).toBe(true);

    toggle.api.toggleKeys([toggleKey], true);

    expect(toggle.store.get('isClosed', firstKey)).toBe(false);
  });
});
