import { createBaseEditor } from '@platejs/core';

import { BaseBlockquotePlugin } from './BaseBlockquotePlugin';

describe('BaseBlockquotePlugin', () => {
  it('uses wrapper semantics and drops text-block break rules', () => {
    const editor = createBaseEditor({
      plugins: [BaseBlockquotePlugin],
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 5, path: [0, 0] },
      },
      value: [{ children: [{ text: 'Quote' }], type: 'p' }],
    });
    const plugin = editor.getPlugin(BaseBlockquotePlugin);

    expect(plugin.rules).toMatchObject({
      break: {
        empty: 'lift',
      },
      delete: {
        start: 'lift',
      },
    });

    editor.update.blockquote.toggle();

    expect(editor.read.children()).toEqual([
      {
        children: [{ children: [{ text: 'Quote' }], type: 'p' }],
        type: 'blockquote',
      },
    ]);
  });

  it('normalizes legacy flat blockquote children into paragraphs', () => {
    const editor = createBaseEditor({
      plugins: [BaseBlockquotePlugin],
      selection: {
        anchor: { offset: 2, path: [0, 0] },
        focus: { offset: 2, path: [0, 0] },
      },
      value: [
        {
          children: [{ text: 'Quote' }],
          type: 'blockquote',
        },
      ],
    });

    editor.update.normalize({ force: true });

    expect(editor.read.children()).toEqual([
      {
        children: [
          {
            children: [{ text: 'Quote' }],
            type: 'p',
          },
        ],
        type: 'blockquote',
      },
    ]);
    expect(editor.read.selection()).toEqual({
      anchor: { offset: 2, path: [0, 0, 0] },
      focus: { offset: 2, path: [0, 0, 0] },
    });
    expect(editor.read.lastCommit()?.operations).toEqual([
      {
        children: [{ text: 'Quote' }],
        index: 0,
        newChildren: [
          {
            children: [{ text: 'Quote' }],
            type: 'p',
          },
        ],
        newSelection: {
          anchor: { offset: 2, path: [0, 0, 0] },
          focus: { offset: 2, path: [0, 0, 0] },
        },
        path: [0],
        selection: {
          anchor: { offset: 2, path: [0, 0] },
          focus: { offset: 2, path: [0, 0] },
        },
        type: 'replace_children',
      },
    ]);
  });

  it('wraps inline runs when a legacy blockquote mixes inline and block children', () => {
    const editor = createBaseEditor({
      plugins: [BaseBlockquotePlugin],
      value: [
        {
          children: [
            { text: 'Lead' },
            {
              children: [{ text: 'Nested block' }],
              type: 'p',
            },
            { text: 'Tail' },
          ],
          type: 'blockquote',
        },
      ],
    });

    editor.update.normalize({ force: true });

    expect(editor.read.children()).toEqual([
      {
        children: [
          {
            children: [{ text: 'Lead' }],
            type: 'p',
          },
          {
            children: [{ text: 'Nested block' }],
            type: 'p',
          },
          {
            children: [{ text: 'Tail' }],
            type: 'p',
          },
        ],
        type: 'blockquote',
      },
    ]);
  });

  it('lifts selected blockquote children on reverse-tab', () => {
    const editor = createBaseEditor({
      plugins: [BaseBlockquotePlugin],
      selection: {
        anchor: { offset: 0, path: [0, 0, 0] },
        focus: { offset: 3, path: [0, 0, 0] },
      },
      value: [
        {
          children: [
            {
              children: [{ text: 'One' }],
              type: 'p',
            },
            {
              children: [{ text: 'Two' }],
              type: 'p',
            },
          ],
          type: 'blockquote',
        },
      ],
    });

    expect(editor.update.blockquote.untab()).toBe(true);
    expect(editor.read.children()).toEqual([
      {
        children: [{ text: 'One' }],
        type: 'p',
      },
      {
        children: [
          {
            children: [{ text: 'Two' }],
            type: 'p',
          },
        ],
        type: 'blockquote',
      },
    ]);
  });

  it('lets reverse-tab fall through outside blockquote children', () => {
    const editor = createBaseEditor({
      plugins: [BaseBlockquotePlugin],
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 3, path: [0, 0] },
      },
      value: [{ children: [{ text: 'One' }], type: 'p' }],
    });

    expect(editor.update.blockquote.untab()).toBe(false);
    expect(editor.read.children()).toEqual([
      { children: [{ text: 'One' }], type: 'p' },
    ]);
  });

  it('lifts an empty blockquote child on Enter', () => {
    const editor = createBaseEditor({
      plugins: [BaseBlockquotePlugin],
      selection: {
        anchor: { offset: 0, path: [0, 0, 0] },
        focus: { offset: 0, path: [0, 0, 0] },
      },
      value: [
        {
          children: [
            {
              children: [{ text: '' }],
              type: 'p',
            },
          ],
          type: 'blockquote',
        },
      ],
    });

    editor.update.break.insert();

    expect(editor.read.children()).toMatchObject([
      {
        children: [{ text: '' }],
        type: 'p',
      },
    ]);
  });

  it('lifts an empty blockquote child on Backspace at block start', () => {
    const editor = createBaseEditor({
      plugins: [BaseBlockquotePlugin],
      selection: {
        anchor: { offset: 0, path: [0, 0, 0] },
        focus: { offset: 0, path: [0, 0, 0] },
      },
      value: [
        {
          children: [
            {
              children: [{ text: '' }],
              type: 'p',
            },
          ],
          type: 'blockquote',
        },
      ],
    });

    editor.update.text.deleteBackward({ unit: 'character' });

    expect(editor.read.children()).toMatchObject([
      {
        children: [{ text: '' }],
        type: 'p',
      },
    ]);
  });
});
