import type { Value } from '@platejs/slate';

import { BaseIndentPlugin } from '@platejs/indent';
import { getCurrentRuntimeTransforms } from '../../../core/src/internal/currentRuntimeBridge';
import { BaseParagraphPlugin } from '../../../core/src/lib/plugins/paragraph/BaseParagraphPlugin';
import { createPlateRuntimeEditor } from '../../../core/src/react/editor/createPlateRuntimeEditor';

import { BaseListPlugin } from './BaseListPlugin';

const plugins = [BaseParagraphPlugin, BaseIndentPlugin, BaseListPlugin];

type ListRuntimeTransforms = {
  deleteBackward: () => boolean;
  insertBreak: () => boolean;
  resetBlock: () => boolean;
  tab: (options: { reverse: boolean }) => boolean;
};

const runtimeTransforms = (editor: unknown) =>
  getCurrentRuntimeTransforms(editor) as unknown as ListRuntimeTransforms;

describe('BaseListPlugin Slate v2 runtime', () => {
  it('removes the list layer on resetBlock at a root list item', () => {
    const editor = createPlateRuntimeEditor<Value>({
      plugins,
      initialSelection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      initialValue: [
        {
          children: [{ text: 'One' }],
          indent: 1,
          listStyleType: 'disc',
          type: 'p',
        },
      ],
    });

    expect(runtimeTransforms(editor).resetBlock()).toBe(true);
    expect(editor.read((state) => state.value.root())).toEqual([
      { children: [{ text: 'One' }], type: 'p' },
    ]);
    expect(editor.read((state) => state.selection.get())).toEqual({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    });
  });

  it('outdents a nested list item on resetBlock', () => {
    const editor = createPlateRuntimeEditor<Value>({
      plugins,
      initialSelection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      initialValue: [
        {
          children: [{ text: 'One' }],
          indent: 2,
          listStyleType: 'disc',
          type: 'p',
        },
      ],
    });

    expect(runtimeTransforms(editor).resetBlock()).toBe(true);
    expect(editor.read((state) => state.value.root())).toEqual([
      {
        children: [{ text: 'One' }],
        indent: 1,
        listStyleType: 'disc',
        type: 'p',
      },
    ]);
  });

  it('sets a new todo line to unchecked on insertBreak at the line end', () => {
    const editor = createPlateRuntimeEditor<Value>({
      plugins,
      initialSelection: {
        anchor: { offset: 4, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      initialValue: [
        {
          checked: true,
          children: [{ text: 'Todo' }],
          indent: 1,
          listStyleType: 'todo',
          type: 'p',
        },
      ],
    });

    expect(runtimeTransforms(editor).insertBreak()).toBe(true);
    expect(editor.read((state) => state.value.root())).toEqual([
      {
        checked: true,
        children: [{ text: 'Todo' }],
        indent: 1,
        listStyleType: 'todo',
        type: 'p',
      },
      {
        checked: false,
        children: [{ text: '' }],
        indent: 1,
        listStart: 2,
        listStyleType: 'todo',
        type: 'p',
      },
    ]);
    expect(editor.read((state) => state.selection.get())).toEqual({
      anchor: { offset: 0, path: [1, 0] },
      focus: { offset: 0, path: [1, 0] },
    });
  });

  it('renumbers following ordered list items after removal', () => {
    const editor = createPlateRuntimeEditor<Value>({
      plugins,
      initialValue: [
        {
          children: [{ text: 'One' }],
          indent: 1,
          listStyleType: 'decimal',
          type: 'p',
        },
        {
          children: [{ text: 'Two' }],
          indent: 1,
          listStart: 2,
          listStyleType: 'decimal',
          type: 'p',
        },
        {
          children: [{ text: 'Three' }],
          indent: 1,
          listStart: 3,
          listStyleType: 'decimal',
          type: 'p',
        },
      ],
    });

    editor.update((tx) => {
      tx.nodes.remove({ at: [1] });
    });

    expect(editor.read((state) => state.value.root())).toEqual([
      {
        children: [{ text: 'One' }],
        indent: 1,
        listStyleType: 'decimal',
        type: 'p',
      },
      {
        children: [{ text: 'Three' }],
        indent: 1,
        listStart: 2,
        listStyleType: 'decimal',
        type: 'p',
      },
    ]);
  });

  it('exits an empty root list item on insertBreak', () => {
    const editor = createPlateRuntimeEditor<Value>({
      plugins,
      initialSelection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      initialValue: [
        {
          children: [{ text: '' }],
          indent: 1,
          listStyleType: 'disc',
          type: 'p',
        },
      ],
    });

    expect(runtimeTransforms(editor).insertBreak()).toBe(true);
    expect(editor.read((state) => state.value.root())).toEqual([
      { children: [{ text: '' }], type: 'p' },
    ]);
  });

  it('removes the list layer before deleting content at a root list start', () => {
    const editor = createPlateRuntimeEditor<Value>({
      plugins,
      initialSelection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      initialValue: [
        {
          children: [{ text: 'One' }],
          indent: 1,
          listStyleType: 'disc',
          type: 'p',
        },
      ],
    });

    expect(runtimeTransforms(editor).deleteBackward()).toBe(true);
    expect(editor.read((state) => state.value.root())).toEqual([
      { children: [{ text: 'One' }], type: 'p' },
    ]);
  });

  it('indents and outdents list items on tab', () => {
    const editor = createPlateRuntimeEditor<Value>({
      plugins,
      initialSelection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      initialValue: [
        {
          children: [{ text: 'One' }],
          indent: 1,
          listStyleType: 'disc',
          type: 'p',
        },
      ],
    });

    expect(runtimeTransforms(editor).tab({ reverse: false })).toBe(true);
    expect(editor.read((state) => state.value.root())).toEqual([
      {
        children: [{ text: 'One' }],
        indent: 2,
        listStyleType: 'disc',
        type: 'p',
      },
    ]);

    expect(runtimeTransforms(editor).tab({ reverse: true })).toBe(true);
    expect(editor.read((state) => state.value.root())).toEqual([
      {
        children: [{ text: 'One' }],
        indent: 1,
        listStyleType: 'disc',
        type: 'p',
      },
    ]);
  });
});
