import assert from 'node:assert/strict';

import { createEditor, ElementApi } from '../../../core';
import { parseHtmlSliceContent } from '../../../internal/testing/parseHtmlSliceContent';
import { BaseMentionPlugin } from './BaseMentionPlugin';

describe('BaseMentionPlugin', () => {
  it('requires a non-empty persisted ref', () => {
    const editor = createEditor({ plugins: [BaseMentionPlugin] });

    expect(() =>
      editor.read.schema.assertDocument({
        children: [
          {
            children: [{ text: '' }],
            ref: '   ',
            type: 'mention',
          },
        ],
      })
    ).toThrow(/ref.*validation/i);
  });

  it('inserts markable void mention nodes', () => {
    const editor = createEditor({
      plugins: [BaseMentionPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 2, path: [0, 0] },
        focus: { offset: 2, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'hello' }], type: 'paragraph' }],
    });
    expect(
      editor.read.schema.element(BaseMentionPlugin)?.behavior
    ).toMatchObject({
      inline: true,
      markableVoid: true,
      void: true,
      voidKind: 'markable-inline',
    });

    editor.update.mention.insert({ ref: 'u1', label: 'Ada' });

    const entry = editor.read.nodes.get([0], {
      match: ElementApi.isElement,
    });
    assert.ok(entry);
    const { children } = entry[0];

    expect(children[0]).toEqual({ text: 'he' });
    expect(children[1]).toMatchObject({
      children: [{ text: '' }],
      ref: 'u1',
      type: 'mention',
      label: 'Ada',
    });
    expect(children[2]).toEqual({ text: 'llo' });
  });

  it('rejects blank mention refs before insertion', () => {
    const editor = createEditor({
      plugins: [BaseMentionPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
    });

    expect(() => editor.update.mention.insert({ ref: '   ' })).toThrow(
      /mention ref must be a non-empty string/i
    );
    expect(editor.read.children()).toEqual([
      { children: [{ text: '' }], type: 'paragraph' },
    ]);
  });

  it('round-trips mention identity through HTML clipboard data', () => {
    const editor = createEditor({
      plugins: [BaseMentionPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 7, path: [0, 0] },
        focus: { offset: 0, path: [0, 2] },
      },
      initialValue: [
        {
          children: [
            { text: 'before ' },
            {
              children: [{ text: '' }],
              ref: 'user-1',
              type: 'mention',
              label: 'Ada',
            },
            { text: ' after' },
          ],
          type: 'paragraph',
        },
      ],
    });
    const data = new DataTransfer();

    editor.api.dom.clipboard.writeSelection(data);

    const html = data.getData('text/html');
    const element = new DOMParser()
      .parseFromString(html, 'text/html')
      .body.querySelector('[data-editor-mention]');

    expect(element?.getAttribute('data-editor-mention-ref')).toBe('user-1');
    expect(element?.getAttribute('data-editor-mention-label')).toBe('Ada');
    expect(element?.textContent).toBe('@Ada');

    expect(parseHtmlSliceContent(editor, html)).toEqual([
      {
        children: [
          {
            children: [{ text: '' }],
            ref: 'user-1',
            type: 'mention',
            label: 'Ada',
          },
        ],
        type: 'paragraph',
      },
    ]);
  });

  it('ignores blank mention refs from external formats', () => {
    const editor = createEditor({ plugins: [BaseMentionPlugin] });

    expect(
      parseHtmlSliceContent(
        editor,
        '<span data-editor-mention data-editor-mention-ref=" ">@blank</span>'
      )
    ).toEqual([
      {
        text: '@blank',
      },
    ]);
  });

  it('inserts a trailing space when the mention lands at block end', () => {
    const innerMentionPlugin = BaseMentionPlugin.configure({
      initialState: { insertSpaceAfterMention: true },
    });
    const editor = createEditor({
      plugins: [innerMentionPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 2, path: [0, 0] },
        focus: { offset: 2, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'hi' }], type: 'paragraph' }],
    });

    editor
      .plugin(innerMentionPlugin)
      .update.insert({ ref: 'u1', label: 'Ada' });

    const entry = editor.read.nodes.get([0], {
      match: ElementApi.isElement,
    });
    assert.ok(entry);
    const { children } = entry[0];

    expect(children[1]).toMatchObject({
      children: [{ text: '' }],
      ref: 'u1',
      type: 'mention',
      label: 'Ada',
    });
    expect(children[2]).toEqual({ text: ' ' });
    expect(editor.read.selection()).toEqual({
      anchor: { offset: 1, path: [0, 2] },
      focus: { offset: 1, path: [0, 2] },
    });
  });

  it('leaves the caret after a mention completed at block end without a space', () => {
    const editor = createEditor({
      plugins: [BaseMentionPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 2, path: [0, 0] },
        focus: { offset: 2, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'hi' }], type: 'paragraph' }],
    });

    editor.update((tx) => {
      tx.plugin(BaseMentionPlugin).insert({ ref: 'u1', label: 'Ada' });
    });
    editor.update((tx) => {
      tx.text.insert('!');
    });

    expect(editor.read.text.string([0])).toBe('hi!');
    expect(editor.read.nodes.get([0, 2])?.[0]).toEqual({ text: '!' });
  });

  it('skips the trailing space when the mention is inserted mid-block', () => {
    const innerMentionPlugin2 = BaseMentionPlugin.configure({
      initialState: { insertSpaceAfterMention: true },
    });
    const editor = createEditor({
      plugins: [innerMentionPlugin2],
      selection: {
        kind: 'text',
        anchor: { offset: 2, path: [0, 0] },
        focus: { offset: 2, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'hello' }], type: 'paragraph' }],
    });

    editor
      .plugin(innerMentionPlugin2)
      .update.insert({ ref: 'u1', label: 'Ada' });

    const entry = editor.read.nodes.get([0], {
      match: ElementApi.isElement,
    });
    assert.ok(entry);

    expect(entry[0].children).toMatchObject([
      { text: 'he' },
      {
        children: [{ text: '' }],
        ref: 'u1',
        type: 'mention',
        label: 'Ada',
      },
      { text: 'llo' },
    ]);
  });

  it('deleteBackward removes the adjacent mention atom', () => {
    const editor = createEditor({
      plugins: [BaseMentionPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 2] },
        focus: { offset: 0, path: [0, 2] },
      },
      initialValue: [
        {
          children: [
            { text: 'hi ' },
            {
              children: [{ text: '' }],
              ref: 'u1',
              type: 'mention',
              label: 'Ada',
            },
            { text: ' after' },
          ],
          type: 'paragraph',
        },
      ],
    });

    editor.update.text.deleteBackward({ unit: 'character' });

    expect(editor.read.children()).toMatchObject([
      {
        children: [{ text: 'hi  after' }],
        type: 'paragraph',
      },
    ]);
    expect(editor.read.selection()).toEqual({
      anchor: { offset: 3, path: [0, 0] },
      focus: { offset: 3, path: [0, 0] },
    });
  });

  it('deleteForward removes the next mention atom', () => {
    const editor = createEditor({
      plugins: [BaseMentionPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 3, path: [0, 0] },
        focus: { offset: 3, path: [0, 0] },
      },
      initialValue: [
        {
          children: [
            { text: 'hi ' },
            {
              children: [{ text: '' }],
              ref: 'u1',
              type: 'mention',
              label: 'Ada',
            },
            { text: ' after' },
          ],
          type: 'paragraph',
        },
      ],
    });

    editor.update.text.deleteForward({ unit: 'character' });

    expect(editor.read.children()).toMatchObject([
      {
        children: [{ text: 'hi  after' }],
        type: 'paragraph',
      },
    ]);
    expect(editor.read.selection()).toEqual({
      anchor: { offset: 3, path: [0, 0] },
      focus: { offset: 3, path: [0, 0] },
    });
  });

  it('moves right into the mention child so the inline void stays keyboard-accessible', () => {
    const editor = createEditor({
      plugins: [BaseMentionPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 3, path: [0, 0] },
        focus: { offset: 3, path: [0, 0] },
      },
      initialValue: [
        {
          children: [
            { text: 'hi ' },
            {
              children: [{ text: '' }],
              ref: 'u1',
              type: 'mention',
              label: 'Ada',
            },
            { text: ' after' },
          ],
          type: 'paragraph',
        },
      ],
    });

    editor.update.selection.move({ distance: 1, unit: 'character' });

    expect(editor.read.selection()).toEqual({
      anchor: { offset: 0, path: [0, 1, 0] },
      focus: { offset: 0, path: [0, 1, 0] },
    });
  });

  it('moves left into the mention child so the inline void stays keyboard-accessible', () => {
    const editor = createEditor({
      plugins: [BaseMentionPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 2] },
        focus: { offset: 0, path: [0, 2] },
      },
      initialValue: [
        {
          children: [
            { text: 'hi ' },
            {
              children: [{ text: '' }],
              ref: 'u1',
              type: 'mention',
              label: 'Ada',
            },
            { text: ' after' },
          ],
          type: 'paragraph',
        },
      ],
    });

    editor.update.selection.move({
      distance: 1,
      reverse: true,
      unit: 'character',
    });

    expect(editor.read.selection()).toEqual({
      anchor: { offset: 0, path: [0, 1, 0] },
      focus: { offset: 0, path: [0, 1, 0] },
    });
  });
});
