import type { Value } from 'platejs';
import { BaseParagraphPlugin } from '@platejs/core';
import { KEYS } from '@platejs/utils';
import { createPlateEditor } from 'platejs/react';
import { createListClassicRuntimeTestEditor as createSlateEditor } from './__tests__/createListClassicRuntimeTestEditor';

import { BaseTodoListPlugin } from './BaseTodoListPlugin';

describe('BaseTodoListPlugin', () => {
  afterEach(() => {
    mock.restore();
  });

  it('inserts a new todo item on line break inside a todo item', () => {
    const editor = createSlateEditor({
      plugins: [BaseTodoListPlugin],
      selection: {
        anchor: { path: [0, 0], offset: 4 },
        focus: { path: [0, 0], offset: 4 },
      },
      value: [
        {
          checked: true,
          children: [{ text: 'task' }],
          type: KEYS.listTodoClassic,
        },
      ],
    });

    editor.update((tx) => tx.break.insert());

    expect(editor.children).toEqual([
      {
        checked: true,
        children: [{ text: 'task' }],
        type: KEYS.listTodoClassic,
      },
      {
        checked: false,
        children: [{ text: '' }],
        type: KEYS.listTodoClassic,
      },
    ]);
    expect(editor.selection).toEqual({
      anchor: { offset: 0, path: [1, 0] },
      focus: { offset: 0, path: [1, 0] },
    });
  });

  it('falls back to the base insertBreak outside todo items', () => {
    const editor = createSlateEditor({
      plugins: [BaseParagraphPlugin, BaseTodoListPlugin],
      selection: {
        anchor: { path: [0, 0], offset: 4 },
        focus: { path: [0, 0], offset: 4 },
      },
      value: [{ children: [{ text: 'task' }], type: KEYS.p }],
    });

    editor.update((tx) => tx.break.insert());

    expect(editor.children).toEqual([
      {
        children: [{ text: 'task' }],
        type: KEYS.p,
      },
      {
        children: [{ text: '' }],
        type: KEYS.p,
      },
    ]);
    expect(editor.selection).toEqual({
      anchor: { offset: 0, path: [1, 0] },
      focus: { offset: 0, path: [1, 0] },
    });
  });

  it('exposes an inferred todo transaction group', () => {
    const editor = createPlateEditor<
      Value,
      typeof BaseParagraphPlugin | typeof BaseTodoListPlugin
    >({
      plugins: [BaseParagraphPlugin, BaseTodoListPlugin],
      runtime: 'slate-v2',
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      value: [{ children: [{ text: 'task' }], type: KEYS.p }],
    });

    editor.update((tx) => tx.action_item.toggle());

    expect(editor.children[0]).toMatchObject({
      type: KEYS.listTodoClassic,
    });

    editor.update((tx) => tx.action_item.toggle());

    expect(editor.children[0]).toMatchObject({
      type: KEYS.p,
    });
  });

  it('routes todo line-end insertBreak through the Slate v2 runtime', () => {
    const editor = createPlateEditor<Value, typeof BaseTodoListPlugin>({
      plugins: [BaseTodoListPlugin],
      runtime: 'slate-v2',
      selection: {
        anchor: { offset: 4, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      value: [
        {
          checked: true,
          children: [{ text: 'task' }],
          type: KEYS.listTodoClassic,
        },
      ],
    });

    editor.update((tx) => tx.break.insert());
    expect(editor.read((state) => state.value.root())).toEqual([
      {
        checked: true,
        children: [{ text: 'task' }],
        type: KEYS.listTodoClassic,
      },
      {
        checked: false,
        children: [{ text: '' }],
        type: KEYS.listTodoClassic,
      },
    ]);
    expect(editor.read((state) => state.selection.get())).toEqual({
      anchor: { offset: 0, path: [1, 0] },
      focus: { offset: 0, path: [1, 0] },
    });
  });

  it('falls back to Slate v2 insertBreak outside classic todo items', () => {
    const editor = createPlateEditor<
      Value,
      typeof BaseParagraphPlugin | typeof BaseTodoListPlugin
    >({
      plugins: [BaseParagraphPlugin, BaseTodoListPlugin],
      runtime: 'slate-v2',
      selection: {
        anchor: { offset: 4, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      value: [{ children: [{ text: 'task' }], type: KEYS.p }],
    });

    editor.update((tx) => tx.break.insert());
    expect(editor.read((state) => state.value.root())).toEqual([
      { children: [{ text: 'task' }], type: KEYS.p },
      { children: [{ text: '' }], type: KEYS.p },
    ]);
  });
});
