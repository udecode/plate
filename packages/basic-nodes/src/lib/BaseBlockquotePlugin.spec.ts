import { createBaseEditor } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import { BaseBlockquotePlugin } from './BaseBlockquotePlugin';

describe('BaseBlockquotePlugin', () => {
  it('uses container grammar and scoped wrapper semantics', () => {
    const editor = createBaseEditor({
      plugins: [BaseBlockquotePlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 5, path: [0, 0] },
      },
      value: [{ children: [{ text: 'Quote' }], type: 'p' }],
    });
    const before = { children: editor.read.children() };

    expect(
      editor.read.schema.isElementTypeInGroup(KEYS.blockquote, 'block')
    ).toBe(true);
    expect(editor.read.schema.allowsElementType(KEYS.blockquote, KEYS.p)).toBe(
      true
    );
    expect(editor.read.schema.createAndFill(KEYS.blockquote)).toEqual({
      children: [{ children: [{ text: '' }], type: KEYS.p }],
      type: KEYS.blockquote,
    });

    editor.update.blockquote.toggle();

    expect(editor.read.children()).toMatchObject([
      {
        children: [{ children: [{ text: 'Quote' }], type: KEYS.p }],
        type: 'blockquote',
      },
    ]);

    const commit = editor.read.lastCommit();

    expect(commit?.changed.has('structure')).toBe(true);
    expect(commit?.changes.apply(before).children).toEqual(
      editor.read.children()
    );
  });

  it('keeps canonical nested block content during repair', () => {
    const editor = createBaseEditor({
      plugins: [BaseBlockquotePlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 2, path: [0, 0, 0] },
        focus: { offset: 2, path: [0, 0, 0] },
      },
      value: [
        {
          children: [
            { children: [{ text: 'Quote' }], type: KEYS.p },
            { children: [{ text: 'Second paragraph' }], type: KEYS.p },
          ],
          type: 'blockquote',
        },
      ],
    });

    editor.update.value.repair();

    expect(editor.read.children()).toEqual([
      {
        children: [
          { children: [{ text: 'Quote' }], type: KEYS.p },
          { children: [{ text: 'Second paragraph' }], type: KEYS.p },
        ],
        type: 'blockquote',
      },
    ]);
    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 2, path: [0, 0, 0] },
      focus: { offset: 2, path: [0, 0, 0] },
    });
  });

  it('lifts selected blockquote children on reverse-tab', () => {
    const editor = createBaseEditor({
      plugins: [BaseBlockquotePlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0, 0] },
        focus: { offset: 3, path: [0, 0, 0] },
      },
      value: [
        {
          children: [
            {
              children: [{ text: 'One' }],
              type: KEYS.p,
            },
            {
              children: [{ text: 'Two' }],
              type: KEYS.p,
            },
          ],
          type: 'blockquote',
        },
      ],
    });

    expect(editor.update.blockquote.untab()).toBe(true);
    expect(editor.read.children()).toMatchObject([
      {
        children: [{ text: 'One' }],
        type: KEYS.p,
      },
      {
        children: [
          {
            children: [{ text: 'Two' }],
            type: KEYS.p,
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
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 3, path: [0, 0] },
      },
      value: [{ children: [{ text: 'One' }], type: KEYS.p }],
    });

    expect(editor.update.blockquote.untab()).toBe(false);
    expect(editor.read.children()).toEqual([
      { children: [{ text: 'One' }], type: KEYS.p },
    ]);
  });

  it('lifts an empty blockquote child on Enter', () => {
    const editor = createBaseEditor({
      plugins: [BaseBlockquotePlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0, 0] },
        focus: { offset: 0, path: [0, 0, 0] },
      },
      value: [
        {
          children: [
            {
              children: [{ text: '' }],
              type: KEYS.p,
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
        type: KEYS.p,
      },
    ]);
  });

  it('lifts an empty blockquote child on Backspace at block start', () => {
    const editor = createBaseEditor({
      plugins: [BaseBlockquotePlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0, 0] },
        focus: { offset: 0, path: [0, 0, 0] },
      },
      value: [
        {
          children: [
            {
              children: [{ text: '' }],
              type: KEYS.p,
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
        type: KEYS.p,
      },
    ]);
  });
});
