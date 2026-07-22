import { createPlateEditor } from '@platejs/core/react';
import { BaseParagraphPlugin } from '@platejs/core';
import { BaseIndentPlugin } from '@platejs/indent';
import { KEYS } from '@platejs/utils';

import { TogglePlugin } from './TogglePlugin';
import { buildToggleIndex } from './toggleIndexAtom';

describe('withToggle', () => {
  const plugins = [
    BaseIndentPlugin.configure({
      config: {
        targets: [BaseParagraphPlugin, TogglePlugin],
      },
    }),
    TogglePlugin,
  ];

  it('inserts an indented paragraph inside an open toggle', () => {
    const editor = createPlateEditor({
      plugins,
      selection: {
        kind: 'text',
        anchor: { offset: 6, path: [0, 0] },
        focus: { offset: 6, path: [0, 0] },
      },
      value: [
        { children: [{ text: 'Toggle' }], id: 't1', type: KEYS.toggle },
        { children: [{ text: 'after' }], type: KEYS.p },
      ],
    });

    editor.api.toggle.toggleIds(['t1'], true);
    editor.update.break.insert();

    expect(editor.read.children()).toMatchObject([
      {
        children: [{ text: 'Toggle' }],
        id: 't1',
        type: KEYS.toggle,
      },
      {
        children: [{ text: '' }],
        indent: 1,
        type: KEYS.p,
      },
      {
        children: [{ text: 'after' }],
        type: KEYS.p,
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
      value: [
        { children: [{ text: 'Toggle' }], id: 't1', type: KEYS.toggle },
        {
          children: [{ text: 'hidden child' }],
          id: 'p1',
          indent: 1,
          type: KEYS.p,
        },
        { children: [{ text: 'after' }], type: KEYS.p },
      ],
    });

    editor
      .plugin(TogglePlugin)
      .setOption('toggleIndex', buildToggleIndex(editor.read.children()));
    editor.update.break.insert();

    expect(editor.read.children()).toMatchObject([
      {
        children: [{ text: 'Toggle' }],
        id: 't1',
        type: KEYS.toggle,
      },
      {
        children: [{ text: 'hidden child' }],
        id: 'p1',
        indent: 1,
        type: KEYS.p,
      },
      {
        children: [{ text: '' }],
        type: KEYS.toggle,
      },
      {
        children: [{ text: 'after' }],
        type: KEYS.p,
      },
    ]);
  });

  it('marks descendants of closed toggles as non-selectable', () => {
    const editor = createPlateEditor({
      plugins,
      value: [
        { children: [{ text: 'Toggle' }], id: 't1', type: KEYS.toggle },
        {
          children: [{ text: 'hidden child' }],
          id: 'p1',
          indent: 1,
          type: KEYS.p,
        },
      ],
    });

    editor
      .plugin(TogglePlugin)
      .setOption('toggleIndex', buildToggleIndex(editor.read.children()));

    const hiddenChild = editor.read.nodes.get([1])?.[0];

    expect(editor.read.schema.element(TogglePlugin)?.groups).toContain('block');
    expect(hiddenChild && editor.read.schema.isSelectable(hiddenChild)).toBe(
      true
    );

    expect(hiddenChild && editor.read.nodes.isSelectable(hiddenChild)).toBe(
      false
    );

    editor.api.toggle.toggleIds(['t1'], true);

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
      value: [
        { children: [{ text: 'Toggle' }], id: 't1', type: KEYS.toggle },
        {
          children: [{ text: 'hidden' }],
          id: 'p1',
          indent: 1,
          type: KEYS.p,
        },
        { children: [{ text: 'after' }], id: 'p2', type: KEYS.p },
      ],
    });

    editor
      .plugin(TogglePlugin)
      .setOption('toggleIndex', buildToggleIndex(editor.read.children()));
    editor.update.text.deleteBackward({ unit: 'character' });

    expect(editor.read.children()).toMatchObject([
      {
        children: [{ text: 'Toggleafter' }],
        id: 't1',
        type: KEYS.toggle,
      },
      {
        children: [{ text: 'hidden' }],
        id: 'p1',
        indent: 1,
        type: KEYS.p,
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
      value: [
        { children: [{ text: 'Toggle' }], id: 't1', type: KEYS.toggle },
        {
          children: [{ text: 'hidden' }],
          id: 'p1',
          indent: 1,
          type: KEYS.p,
        },
        { children: [{ text: 'after' }], id: 'p2', type: KEYS.p },
      ],
    });

    editor
      .plugin(TogglePlugin)
      .setOption('toggleIndex', buildToggleIndex(editor.read.children()));
    editor.update.text.deleteForward({ unit: 'character' });

    expect(editor.read.children()).toMatchObject([
      {
        children: [{ text: 'Toggleafter' }],
        id: 't1',
        type: KEYS.toggle,
      },
      {
        children: [{ text: 'hidden' }],
        id: 'p1',
        indent: 1,
        type: KEYS.p,
      },
    ]);
  });
});
