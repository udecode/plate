import {
  BaseParagraphPlugin,
  createBaseEditor as createTypedBaseEditor,
  type BaseEditorOptions,
  type BasePluginInput,
} from '@platejs/core';
import {
  createEditor as createPliteEditor,
  type InitialValue,
  type Value,
} from '@platejs/plite';
import { PLUGINS } from '@platejs/utils';

import { BaseTodoListPlugin } from './BaseListPlugin';

const createBaseEditor = <const P extends readonly BasePluginInput[]>(
  options: Omit<BaseEditorOptions, 'plugins'> & {
    initialValue?: InitialValue<Value>;
    plugins: P;
  }
) =>
  createTypedBaseEditor({
    ...options,
    editor: createPliteEditor<Value>(),
  });

describe('BaseTodoListPlugin', () => {
  it('inserts a new todo item on line break inside a todo item', () => {
    const editor = createBaseEditor({
      plugins: [BaseTodoListPlugin],
      selection: {
        kind: 'text',
        anchor: { path: [0, 0], offset: 4 },
        focus: { path: [0, 0], offset: 4 },
      },
      initialValue: [
        {
          checked: true,
          children: [{ text: 'task' }],
          type: 'todoList',
        },
      ],
    });

    expect(BaseTodoListPlugin.name).toBe('todoList');
    expect(BaseTodoListPlugin.name).toBe(PLUGINS.todoList);
    const typedEditor = createBaseEditor({
      plugins: [BaseTodoListPlugin],
    });
    expect(typeof typedEditor.plugin(BaseTodoListPlugin).update.toggle).toBe(
      'function'
    );
    expect(typedEditor.read.schema.create(BaseTodoListPlugin)).toEqual({
      checked: false,
      children: [{ text: '' }],
      type: 'todoList',
    });

    editor.update.break.insert();

    expect(editor.read.children()).toEqual([
      {
        checked: true,
        children: [{ text: 'task' }],
        type: 'todoList',
      },
      {
        checked: false,
        children: [{ text: '' }],
        type: 'todoList',
      },
    ]);
    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 0, path: [1, 0] },
      focus: { offset: 0, path: [1, 0] },
    });
  });

  it('falls back to the base insertBreak outside todo items', () => {
    const editor = createBaseEditor({
      plugins: [BaseParagraphPlugin, BaseTodoListPlugin],
      selection: {
        kind: 'text',
        anchor: { path: [0, 0], offset: 4 },
        focus: { path: [0, 0], offset: 4 },
      },
      initialValue: [{ children: [{ text: 'task' }], type: 'paragraph' }],
    });

    editor.update.break.insert();

    expect(editor.read.children()).toEqual([
      {
        children: [{ text: 'task' }],
        type: 'paragraph',
      },
      {
        children: [{ text: '' }],
        type: 'paragraph',
      },
    ]);
    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 0, path: [1, 0] },
      focus: { offset: 0, path: [1, 0] },
    });
  });

  it('inserts a fresh todo before a break at the start', () => {
    const editor = createBaseEditor({
      plugins: [BaseTodoListPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      initialValue: [
        {
          checked: true,
          children: [{ text: 'task' }],
          type: 'todoList',
        },
      ],
    });

    editor.update.break.insert();

    expect(editor.read.children()).toMatchObject([
      { checked: false, children: [{ text: '' }] },
      { checked: true, children: [{ text: 'task' }] },
    ]);
  });

  it('toggles the selected block to the todo list type', () => {
    const editor = createBaseEditor({
      plugins: [BaseTodoListPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
    });

    editor.plugin(BaseTodoListPlugin).update.toggle();

    expect(editor.read.children()[0].type).toBe(
      editor.plugin(PLUGINS.todoList).schema.element!.type
    );
  });
});
